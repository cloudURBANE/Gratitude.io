import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getCurrentUser, hashPassword, verifyPassword } from "./auth";
import { insertProfileSchema, insertTipSchema } from "@shared/schema";
import Stripe from "stripe";
import { createHash } from "crypto";
import { z } from "zod";

// Initialize Stripe if available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
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

// Auth schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Add current user to all requests
  app.use(getCurrentUser);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      console.log('Signup request body:', req.body);
      const { email, password, firstName, lastName } = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }
      
      // Hash password and create user
      const passwordHash = await hashPassword(password);
      console.log('Creating user with:', { email, firstName, lastName, passwordHashLength: passwordHash.length });
      
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
      });
      
      console.log('User created successfully:', user.id);
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { passwordHash: _, ...userResponse } = user;
      res.status(201).json({ user: userResponse });
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      res.status(400).json({ error: 'Invalid registration data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('Login request:', req.body);
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      console.log('User found, verifying password...');
      
      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        console.log('Password verification failed');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      console.log('Login successful for user:', user.id);
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { passwordHash: _, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      res.status(400).json({ error: 'Invalid login data' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Could not log out' });
      }
      res.json({ success: true });
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.user) {
      const { passwordHash: _, ...userResponse } = req.user;
      res.json(userResponse);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  // Profile creation endpoint - no auth barriers
  app.post('/api/profiles', async (req, res) => {
    try {
      const profileData = req.body;
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  // Get profile by handle
  app.get('/api/profiles/:handle', async (req, res) => {
    try {
      const { handle } = req.params;
      const profile = await storage.getProfileByHandle(handle);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Simple entitlements based on profile
  app.get('/api/entitlements', async (req, res) => {
    try {
      // For MVP: everyone gets basic features
      const entitlements = {
        customBranding: false,
        advancedAnalytics: false,
        multiplePages: false,
        prioritySupport: false,
        noAds: true, // No ads during MVP
        unlimitedTips: true // Everyone can receive unlimited tips
      };
      
      res.json(entitlements);
    } catch (error) {
      console.error('Error fetching entitlements:', error);
      res.status(500).json({ error: 'Failed to fetch entitlements' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      
      // Import analytics service
      const { analyticsService } = await import('./analytics');
      const analytics = await analyticsService.getTipAnalytics(profileId, days);
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/analytics/:profileId/heatmap', async (req, res) => {
    try {
      const { profileId } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      
      const { analyticsService } = await import('./analytics');
      const heatmapData = await analyticsService.getHeatmapData(profileId, days);
      
      res.json(heatmapData);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      res.status(500).json({ error: 'Failed to fetch heatmap data' });
    }
  });

  // Tip verification endpoint
  app.post('/api/tips/:tipId/verify', async (req, res) => {
    try {
      const { tipId } = req.params;
      const { verified, method, manualConfirmation } = req.body;
      
      if (verified) {
        await storage.updateTipStatus(tipId, 'completed');
        res.json({ success: true, status: 'completed' });
      } else {
        await storage.updateTipStatus(tipId, 'failed');
        res.json({ success: false, status: 'failed' });
      }
    } catch (error) {
      console.error('Error verifying tip:', error);
      res.status(500).json({ error: 'Failed to verify tip' });
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

  // Protected profile creation - requires authentication
  app.post('/api/profiles', isAuthenticated, async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse({
        ...req.body,
        userId: req.session!.userId! // Ensure profile belongs to authenticated user
      });
      const profile = await storage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(400).json({ error: 'Invalid profile data' });
    }
  });

  // Protected profile update - user can only update their own profiles
  app.put('/api/profiles/:profileId', isAuthenticated, async (req, res) => {
    try {
      const { profileId } = req.params;
      const updates = insertProfileSchema.partial().parse(req.body);
      
      // Verify profile ownership by getting the profile first
      const profile = await storage.getProfile(profileId);
      if (!profile || profile.userId !== req.session!.userId) {
        return res.status(404).json({ error: 'Profile not found or access denied' });
      }
      
      const updatedProfile = await storage.updateProfile(profileId, updates);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(400).json({ error: 'Invalid profile data' });
    }
  });

  // Get authenticated user's profiles
  app.get('/api/user/profiles', isAuthenticated, async (req, res) => {
    try {
      const profiles = await storage.getUserProfiles(req.session!.userId!);
      res.json(profiles);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      res.status(500).json({ error: 'Failed to fetch profiles' });
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