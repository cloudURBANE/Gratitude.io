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
  apiVersion: "2025-01-27.acacia",
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

  // QR Code generation
  app.get("/api/workers/:handle/qr", async (req, res) => {
    try {
      const { handle } = req.params;
      const worker = await storage.getWorkerByHandle(handle);
      
      if (!worker) {
        return res.status(404).json({ message: "Worker not found" });
      }

      const tipUrl = `${req.protocol}://${req.get('host')}/u/${handle}`;
      const qrCode = await QRCode.toDataURL(tipUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#0B0B0F',
          light: '#FFFFFF'
        },
        width: 256
      });

      res.json({ qrCode, url: tipUrl });
    } catch (error: any) {
      res.status(500).json({ message: "Error generating QR code: " + error.message });
    }
  });

  // QR scan tracking
  app.post("/api/qr-scans", async (req, res) => {
    try {
      const scanData = insertQrScanSchema.parse(req.body);
      const scan = await storage.recordQrScan({
        ...scanData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        referrer: req.get('Referer') || '',
      });
      
      res.json(scan);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid scan data: " + error.message });
    }
  });

  // Tip creation
  app.post("/api/tips", async (req, res) => {
    try {
      const tipData = insertTipSchema.parse(req.body);
      const tip = await storage.createTip(tipData);
      
      // Update analytics
      await storage.updateDailyAnalytics(tip.workerId, new Date());
      
      res.json(tip);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid tip data: " + error.message });
    }
  });

  // Stripe payment intent creation
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, workerId, note, customerName } = req.body;
      
      if (!amount || amount < 1) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Create tip record first
      const tip = await storage.createTip({
        workerId,
        amount: amount.toString(),
        paymentMethod: 'stripe',
        customerName,
        note,
        status: 'pending',
      });

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          tipId: tip.id,
          workerId,
        },
      });

      // Update tip with payment intent ID
      await storage.updateTipStatus(tip.id, 'pending', paymentIntent.id);

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        tipId: tip.id,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
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
