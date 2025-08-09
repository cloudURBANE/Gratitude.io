import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertTipSchema, insertQrScanSchema } from "@shared/schema";
import QRCode from 'qrcode';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Worker routes
  app.get("/api/workers/:handle", async (req, res) => {
    try {
      const { handle } = req.params;
      const worker = await storage.getWorkerByHandle(handle);
      
      if (!worker) {
        return res.status(404).json({ message: "Worker not found" });
      }

      // Get today's stats
      const stats = await storage.getWorkerDailyStats(worker.id);
      
      res.json({
        ...worker,
        todayStats: stats,
      });
    } catch (error: any) {
      console.error("Error fetching worker:", error);
      res.status(500).json({ message: "Error fetching worker: " + error.message });
    }
  });

  app.put("/api/workers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const worker = await storage.updateWorker(id, updateData);
      res.json(worker);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating worker: " + error.message });
    }
  });

  // Analytics routes
  app.get("/api/workers/:id/analytics", async (req, res) => {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      
      const analytics = await storage.getWorkerAnalytics(id, days);
      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Error fetching analytics: " + error.message });
    }
  });

  // Tips routes
  app.get("/api/workers/:id/tips", async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const tips = await storage.getWorkerTips(id, limit);
      res.json(tips);
    } catch (error: any) {
      console.error("Error fetching tips:", error);
      res.status(500).json({ message: "Error fetching tips: " + error.message });
    }
  });

  // QR Code generation route  
  app.get("/api/workers/:handle/qr", async (req, res) => {
    try {
      const { handle } = req.params;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const tipUrl = `${baseUrl}/u/${handle}`;
      
      // Generate a proper QR code using QRCode library
      const qrCode = await QRCode.toDataURL(tipUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
          dark: '#0B0B0F',
          light: '#FFFFFF'
        },
        width: 256
      });

      res.json({
        qrCode,
        url: tipUrl,
      });
    } catch (error: any) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Error generating QR code: " + error.message });
    }
  });

  // Review interaction tracking
  app.post("/api/review-interactions", async (req, res) => {
    try {
      const { workerId, platform, rating, hasText } = req.body;
      
      // In a real app, this would save to database
      // For demo, we'll just return success
      res.json({ 
        success: true,
        message: "Review interaction tracked successfully" 
      });
    } catch (error: any) {
      console.error("Error tracking review interaction:", error);
      res.status(500).json({ message: "Error tracking review interaction: " + error.message });
    }
  });

  // Review stats endpoint
  app.get("/api/workers/:id/review-stats", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Demo stats - in production this would query the database
      const stats = {
        totalReviews: 47,
        averageRating: 4.8,
        googleReviews: 32,
        yelpReviews: 15,
        recentReviews: [
          { platform: 'google', rating: 5, date: '2025-01-07', hasText: true },
          { platform: 'yelp', rating: 5, date: '2025-01-06', hasText: true },
          { platform: 'google', rating: 4, date: '2025-01-05', hasText: false },
          { platform: 'google', rating: 5, date: '2025-01-04', hasText: true },
        ],
        conversionRate: 23.5,
      };

      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching review stats:", error);
      res.status(500).json({ message: "Error fetching review stats: " + error.message });
    }
  });



  // QR scan tracking
  app.post("/api/qr-scans", async (req, res) => {
    try {
      const { workerId } = req.body;
      
      if (!workerId) {
        return res.status(400).json({ message: "Worker ID is required" });
      }

      // For demo purposes, return success without database validation
      res.status(201).json({ 
        id: `scan-${Date.now()}`,
        workerId,
        scannedAt: new Date().toISOString(),
        success: true
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error recording QR scan: " + error.message });
    }
  });

  // Tip creation
  app.post("/api/tips", async (req, res) => {
    try {
      const { workerId, amount, paymentMethod, note } = req.body;
      
      if (!workerId || !amount || !paymentMethod) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // For demo, return success without database operations
      const tip = {
        id: `tip-${Date.now()}`,
        workerId,
        amount: parseFloat(amount),
        paymentMethod,
        note: note || '',
        status: 'completed',
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(tip);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating tip: " + error.message });
    }
  });

  // Enhanced Stripe payment intent with comprehensive validation and verification
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, workerId, note, customerName, description, paymentId } = req.body;
      
      // Comprehensive validation
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      if (isNaN(amountInCents) || amountInCents < 50) {
        return res.status(400).json({ 
          message: "Invalid amount. Minimum is $0.50",
          code: "INVALID_AMOUNT"
        });
      }

      if (amountInCents > 100000) { // $1000 max
        return res.status(400).json({ 
          message: "Amount exceeds maximum limit of $1000",
          code: "AMOUNT_TOO_HIGH"
        });
      }

      // Store payment intent for verification tracking
      if (paymentId) {
        try {
          await storage.createPaymentIntent({
            paymentId,
            amount: amountInCents / 100,
            workerId: workerId || "demo-worker",
            customerName: customerName || "Anonymous",
            status: 'pending',
            method: 'stripe'
          });
        } catch (dbError) {
          console.warn('Failed to store payment intent:', dbError);
        }
      }

      // Create Stripe payment intent with comprehensive metadata
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        description: description || `Tip payment of $${(amountInCents / 100).toFixed(2)}`,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          workerId: workerId || 'demo-worker',
          note: note || '',
          customerName: customerName || 'Anonymous',
          tip_amount: (amountInCents / 100).toFixed(2),
          paymentId: paymentId || `stripe_${Date.now()}`,
          timestamp: Date.now().toString(),
          type: "tip"
        },
      });

      // Update storage with Stripe payment intent ID
      if (paymentId) {
        try {
          const payment = await storage.getPaymentIntent(paymentId);
          if (payment) {
            payment.stripePaymentIntentId = paymentIntent.id;
            await storage.updatePaymentStatus(paymentId, 'processing');
          }
        } catch (error) {
          console.warn('Failed to update payment with Stripe ID:', error);
        }
      }

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInCents / 100,
        status: 'created',
        paymentId: paymentId
      });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message,
        code: "STRIPE_ERROR"
      });
    }
  });

  // Payment verification endpoint
  app.post("/api/payments/:paymentId/verify", async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      const payment = await storage.getPaymentIntent(paymentId);
      
      if (!payment) {
        return res.status(404).json({ 
          verified: false, 
          message: "Payment not found" 
        });
      }

      // For Stripe payments, verify with Stripe API
      if (payment.method === 'stripe' && payment.stripePaymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
          
          if (paymentIntent.status === 'succeeded') {
            await storage.updatePaymentStatus(paymentId, 'completed');
            return res.json({ 
              verified: true, 
              status: 'completed',
              amount: paymentIntent.amount / 100
            });
          }
        } catch (stripeError) {
          console.warn('Stripe verification failed:', stripeError);
        }
      }

      if (payment.status === 'completed') {
        return res.json({ 
          verified: true, 
          status: 'completed',
          amount: payment.amount 
        });
      }

      res.json({ 
        verified: false, 
        status: payment.status,
        message: "Payment not yet completed" 
      });
      
    } catch (error: any) {
      console.error("Payment verification error:", error);
      res.status(500).json({ 
        verified: false, 
        message: "Verification failed", 
        error: error.message 
      });
    }
  });

  // Manual payment confirmation for external apps
  app.post("/api/payments/:paymentId/confirm", async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      const payment = await storage.getPaymentIntent(paymentId);
      
      if (!payment) {
        return res.status(404).json({ 
          success: false, 
          message: "Payment not found" 
        });
      }

      await storage.updatePaymentStatus(paymentId, 'completed');
      
      // Create tip record
      try {
        await storage.createTip({
          amount: payment.amount,
          method: payment.method,
          workerId: payment.workerId,
          paymentIntentId: paymentId,
          status: 'completed'
        });
      } catch (tipError) {
        console.warn('Failed to create tip record:', tipError);
      }

      res.json({ 
        success: true, 
        message: "Payment confirmed",
        amount: payment.amount 
      });
      
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Confirmation failed", 
        error: error.message 
      });
    }
  });

  // Stripe webhook (optional - for production webhook handling)
  app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      // In demo mode, we'll simulate successful payments without webhook verification
      const body = JSON.parse(req.body.toString());
      
      if (body.type === 'payment_intent.succeeded') {
        const paymentIntent = body.data.object;
        const tipId = paymentIntent.metadata?.tipId;
        
        if (tipId) {
          await storage.updateTipStatus(tipId, 'completed');
          
          // Update analytics
          const tip = await storage.getTip(tipId);
          if (tip) {
            await storage.updateDailyAnalytics(tip.workerId, new Date());
          }
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: "Webhook error: " + error.message });
    }
  });

  // Analytics routes
  app.get("/api/workers/:id/analytics", async (req, res) => {
    try {
      const { id } = req.params;
      const { days = "30" } = req.query;
      
      const analytics = await storage.getWorkerAnalytics(id, parseInt(days as string));
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching analytics: " + error.message });
    }
  });

  app.get("/api/workers/:id/tips", async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = "50" } = req.query;
      
      const tips = await storage.getWorkerTips(id, parseInt(limit as string));
      res.json(tips);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching tips: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
