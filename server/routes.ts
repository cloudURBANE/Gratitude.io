import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertTipSchema } from "@shared/schema";
import Stripe from "stripe";
import { createHash } from "crypto";

// Initialize Stripe if available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

function getClientIp(req: any): string {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         '0.0.0.0';
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'tipvault-salt')).digest('hex');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Server-side entitlements endpoint for clean feature gating
  app.get('/api/user/entitlements', async (req, res) => {
    try {
      // Mock user subscription - would come from database in production
      const subscription = {
        plan: 'free' as const,
        status: 'active' as const,
        trialEndsAt: undefined,
        currentPeriodEnd: undefined
      };
      
      // Server-side entitlements calculation
      const isPro = subscription.plan === 'pro' && 
        subscription.status === 'active';
      
      const entitlements = {
        customBranding: isPro,
        advancedAnalytics: isPro,
        multiplePages: isPro,
        prioritySupport: isPro,
        noAds: isPro,
        unlimitedTips: isPro
      };
      
      res.json(entitlements);
    } catch (error) {
      console.error('Error fetching entitlements:', error);
      res.status(500).json({ error: 'Failed to fetch entitlements' });
    }
  });

  // Profile endpoints
  app.get('/api/profiles/:handle', async (req, res) => {
    try {
      const { handle } = req.params;
      const profile = await storage.getProfileByHandle(handle);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/profiles', async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(400).json({ error: 'Invalid profile data' });
    }
  });

  // Tip endpoints
  app.post('/api/tips', async (req, res) => {
    try {
      const tipData = insertTipSchema.parse({
        ...req.body,
        ipHash: hashIp(getClientIp(req)),
      });

      const tip = await storage.createTip(tipData);

      // Handle Stripe payments
      if (tipData.paymentMethod === 'stripe' && stripe) {
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(tipData.amount) * 100), // Convert to cents
            currency: 'usd',
            metadata: {
              tipId: tip.id,
              profileId: tipData.profileId,
            },
          });

          // Update tip with payment intent ID
          await storage.updateTipStatus(tip.id, 'processing');
          
          return res.json({
            ...tip,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          });
        } catch (stripeError) {
          console.error('Stripe error:', stripeError);
          await storage.updateTipStatus(tip.id, 'failed');
          return res.status(500).json({ error: 'Payment processing failed' });
        }
      }

      // For non-Stripe payments, return success immediately
      // These will be marked as completed when payment is verified
      res.status(201).json(tip);
    } catch (error) {
      console.error('Error creating tip:', error);
      res.status(400).json({ error: 'Invalid tip data' });
    }
  });

  app.get('/api/tips/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const tip = await storage.getTip(id);
      
      if (!tip) {
        return res.status(404).json({ error: 'Tip not found' });
      }

      res.json(tip);
    } catch (error) {
      console.error('Error fetching tip:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Payment verification endpoints
  app.get('/api/payments/:paymentIntentId/status', async (req, res) => {
    try {
      const { paymentIntentId } = req.params;
      
      if (!stripe) {
        return res.status(400).json({ error: 'Stripe not configured' });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Update tip status based on payment intent status
      if (paymentIntent.metadata.tipId) {
        let status = 'pending';
        if (paymentIntent.status === 'succeeded') {
          status = 'completed';
        } else if (paymentIntent.status === 'canceled') {
          status = 'failed';
        }
        
        await storage.updateTipStatus(
          paymentIntent.metadata.tipId, 
          status,
          paymentIntent.status === 'succeeded' ? new Date() : undefined
        );
      }

      res.json({
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        },
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ 
        success: false,
        status: 'error',
        error: 'Failed to verify payment' 
      });
    }
  });

  // Event tracking
  app.post('/api/events/track', async (req, res) => {
    try {
      const eventData = {
        profileId: req.body.profileId || null,
        sessionId: req.body.sessionId,
        eventType: req.body.eventType,
        eventData: req.body.eventData || {},
        userAgent: req.body.userAgent || req.get('User-Agent'),
        ipHash: hashIp(getClientIp(req)),
        referrer: req.body.referrer || req.get('Referer'),
      };

      const event = await storage.trackEvent(eventData);
      res.status(201).json({ success: true, eventId: event.id });
    } catch (error) {
      console.error('Error tracking event:', error);
      res.status(500).json({ error: 'Failed to track event' });
    }
  });

  // QR scan tracking
  app.post('/api/qr/scan', async (req, res) => {
    try {
      const scanData = {
        profileId: req.body.profileId,
        sessionId: req.body.sessionId,
        ipHash: hashIp(getClientIp(req)),
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
      };

      const scan = await storage.trackQrScan(scanData);
      res.status(201).json({ success: true, scanId: scan.id });
    } catch (error) {
      console.error('Error tracking QR scan:', error);
      res.status(500).json({ error: 'Failed to track QR scan' });
    }
  });

  // Reviews endpoint
  app.post('/api/reviews', async (req, res) => {
    try {
      const { profileId, rating, reviewText, sessionId } = req.body;
      
      // Find the most recent tip from this session for this profile
      const tips = await storage.getProfileTips(profileId, 10);
      const sessionTip = tips.find(tip => tip.sessionId === sessionId);
      
      if (sessionTip) {
        // Update the tip with rating and review
        await storage.updateTipStatus(sessionTip.id, sessionTip.status || 'pending');
        // Note: In a real implementation, you'd add rating/reviewText update to storage
      }

      // Track review submission event
      await storage.trackEvent({
        profileId,
        sessionId,
        eventType: 'review_submitted',
        eventData: { rating, hasReviewText: !!reviewText },
        ipHash: hashIp(getClientIp(req)),
        userAgent: req.get('User-Agent'),
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ error: 'Failed to submit review' });
    }
  });

  // Ad serving endpoint
  app.post('/api/ads/serve', async (req, res) => {
    try {
      const { slot, profileId, sessionId } = req.body;
      
      // Simple house ad serving logic
      const houseAds = [
        {
          id: 'house-pro-upgrade',
          title: '✨ Go Ad-Free with TipVault Pro',
          body: 'Remove ads, get custom branding, detailed analytics, and more premium features.',
          cta: 'Upgrade to Pro',
          url: '/upgrade',
          type: 'house',
        },
        {
          id: 'house-nfc-kit',
          title: '🏷️ Get Your NFC Tap Kit',
          body: 'Physical NFC cards + QR stickers. Customers just tap to tip with prefilled amounts.',
          cta: 'Order Kit ($15)',
          url: '/shop/nfc-kit',
          type: 'house',
        },
      ];

      const ad = houseAds[Math.floor(Math.random() * houseAds.length)];
      
      // Track impression
      await storage.trackImpression({
        profileId: profileId || null,
        slot,
        adId: ad.id,
        sessionId,
        ipHash: hashIp(getClientIp(req)),
        userAgent: req.get('User-Agent'),
      });

      res.json({ ad });
    } catch (error) {
      console.error('Error serving ad:', error);
      res.status(500).json({ error: 'Failed to serve ad' });
    }
  });

  // Ad click tracking
  app.post('/api/ads/click', async (req, res) => {
    try {
      const { adId, slot, profileId, sessionId } = req.body;
      
      // Track click event
      await storage.trackEvent({
        profileId: profileId || null,
        sessionId,
        eventType: 'ad_click',
        eventData: { adId, slot },
        ipHash: hashIp(getClientIp(req)),
        userAgent: req.get('User-Agent'),
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking ad click:', error);
      res.status(500).json({ error: 'Failed to track ad click' });
    }
  });

  // Analytics endpoints
  app.get('/api/profiles/:id/analytics', async (req, res) => {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const analytics = await storage.getProfileAnalytics(id, startDate, endDate);
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}