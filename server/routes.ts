import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertProfileSchema,
  insertTipSchema,
  insertQrScanSchema,
  type User
} from "@shared/schema";

// JWT secret for session tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Helper functions
function hashIp(ip: string): string {
  return ip; // Simplified for now - could use crypto.createHash('sha256').update(ip).digest('hex')
}

function getClientIp(req: any): string {
  return req.ip || req.connection.remoteAddress || '127.0.0.1';
}

// Auth helper functions
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// Middleware to get current user
async function getCurrentUser(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return next();
    }

    const user = await storage.getUser(decoded.userId);
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
}

// Authentication middleware
async function isAuthenticated(req: any, res: any, next: any) {
  await getCurrentUser(req, res, () => {});
  
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply auth middleware globally
  app.use(getCurrentUser);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ============================================
  // AUTHENTICATION ROUTES
  // ============================================

  app.post('/api/auth/signup', async (req, res) => {
    try {
      console.log('🔥 Signup request received:', { email: req.body.email, hasPassword: !!req.body.password });
      
      // Rate limiting check (basic)
      const clientIp = getClientIp(req);
      console.log('Request from IP:', clientIp);
      
      const { email, password, firstName, lastName } = signupSchema.parse(req.body);
      
      // Sanitize inputs
      const sanitizedEmail = email.toLowerCase().trim();
      const sanitizedFirstName = firstName.trim();
      const sanitizedLastName = lastName.trim();
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(sanitizedEmail);
      if (existingUser) {
        console.log('❌ User already exists:', sanitizedEmail);
        return res.status(409).json({ error: 'User already exists' });
      }
      
      // Hash password
      const passwordHash = await hashPassword(password);
      console.log('✅ Creating user with:', { 
        email: sanitizedEmail, 
        firstName: sanitizedFirstName, 
        lastName: sanitizedLastName, 
        passwordHashLength: passwordHash.length 
      });
      
      // Create user
      const user = await storage.createUser({
        email: sanitizedEmail,
        passwordHash,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
      });
      
      console.log('🎉 User created successfully:', user.id);
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      // Return user without password plus token
      const { passwordHash: _, ...userResponse } = user;
      
      res.status(201).json({ 
        success: true,
        user: userResponse,
        token: token,
        message: 'Account created successfully'
      });
    } catch (error) {
      console.error('💥 Signup error:', error);
      
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return res.status(400).json({ 
          error: 'Invalid input data',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
      }
      
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Unable to create account. Please try again.'
      });
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
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      // Return user without password plus token
      const { passwordHash: _, ...userResponse } = user;
      res.json({ 
        user: userResponse,
        token: token
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      res.status(400).json({ error: 'Invalid login data' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true });
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.user) {
      const { passwordHash: _, ...userResponse } = req.user;
      res.json(userResponse);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  // ============================================
  // PROFILE ROUTES
  // ============================================

  // Create profile - CRITICAL ENDPOINT that was missing
  app.post('/api/profiles', isAuthenticated, async (req, res) => {
    try {
      console.log('Creating profile for user:', req.user?.id);
      console.log('Profile data:', req.body);
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const profileData = insertProfileSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if handle is unique
      const existingProfile = await storage.getProfileByHandle(profileData.handle);
      if (existingProfile) {
        return res.status(409).json({ error: 'Handle already taken' });
      }

      const profile = await storage.createProfile(profileData);
      console.log('Profile created successfully:', profile.id);
      
      res.status(201).json(profile);
    } catch (error) {
      console.error('Profile creation error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      res.status(400).json({ error: 'Failed to create profile' });
    }
  });

  // Get current user's profile
  app.get('/api/profiles/me', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const profile = await storage.getProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Get profile by handle (public)
  app.get('/api/profiles/:handle', async (req, res) => {
    try {
      const { handle } = req.params;
      const profile = await storage.getProfileByHandle(handle);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Track QR scan
      const ipHash = hashIp(getClientIp(req));
      await storage.createQrScan({
        profileId: profile.id,
        ipHash,
        userAgent: req.headers['user-agent']
      });

      res.json(profile);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Update profile
  app.put('/api/profiles', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const updates = req.body;
      
      // If handle is being updated, check uniqueness
      if (updates.handle) {
        const existingProfile = await storage.getProfileByHandle(updates.handle);
        if (existingProfile && existingProfile.userId !== req.user.id) {
          return res.status(409).json({ error: 'Handle already taken' });
        }
      }

      const updatedProfile = await storage.updateProfile(req.user.id, updates);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // ============================================
  // TIP ROUTES
  // ============================================

  // Create tip
  app.post('/api/tips', async (req, res) => {
    try {
      const tipData = insertTipSchema.parse(req.body);
      const tip = await storage.createTip(tipData);
      res.status(201).json(tip);
    } catch (error) {
      console.error('Tip creation error:', error);
      res.status(400).json({ error: 'Failed to create tip' });
    }
  });

  // Get tips for profile
  app.get('/api/profiles/:profileId/tips', isAuthenticated, async (req, res) => {
    try {
      const { profileId } = req.params;
      
      // Verify user owns this profile
      const profile = await storage.getProfile(req.user?.id || '');
      if (!profile || profile.id !== profileId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const tips = await storage.getTipsByProfile(profileId);
      res.json(tips);
    } catch (error) {
      console.error('Tips fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch tips' });
    }
  });

  // Get tip statistics
  app.get('/api/profiles/:profileId/stats', isAuthenticated, async (req, res) => {
    try {
      const { profileId } = req.params;
      
      // Verify user owns this profile
      const profile = await storage.getProfile(req.user?.id || '');
      if (!profile || profile.id !== profileId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const [tipStats, qrStats] = await Promise.all([
        storage.getTipStats(profileId),
        storage.getQrScanStats(profileId)
      ]);

      res.json({
        tips: tipStats,
        qr: qrStats
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // ============================================
  // ANALYTICS ROUTES
  // ============================================

  // Get comprehensive analytics
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const timeRange = req.query.timeRange || '7d';
      
      // Get user's profiles
      const profiles = await storage.getUserProfiles(userId);
      if (!profiles.length) {
        return res.json({
          totalEarnings: 0,
          totalTips: 0,
          avgTip: 0,
          conversionRate: 0,
          topHour: 'N/A',
          topDay: 'N/A',
          weeklyGrowth: 0,
          earningsData: [],
          methodData: [],
          hourlyData: []
        });
      }

      // Get analytics for all user profiles
      let totalEarnings = 0;
      let totalTips = 0;
      let totalScans = 0;
      const earningsData = [];
      const methodData = { venmo: 0, cashapp: 0, stripe: 0, zelle: 0 };
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        tips: 0,
        earnings: 0
      }));

      for (const profile of profiles) {
        const profileTips = await storage.getProfileTips(profile.id);
        const profileScans = await storage.getQrScansByProfile(profile.id);
        
        totalTips += profileTips.length;
        totalScans += profileScans.length;
        
        profileTips.forEach(tip => {
          const amount = parseFloat(tip.amount);
          totalEarnings += amount;
          
          // Group by payment method
          if (tip.paymentMethod === 'venmo') methodData.venmo += amount;
          else if (tip.paymentMethod === 'cashapp') methodData.cashapp += amount;
          else if (tip.paymentMethod === 'stripe') methodData.stripe += amount;
          else if (tip.paymentMethod === 'zelle') methodData.zelle += amount;
          
          // Group by hour
          if (tip.createdAt) {
            const hour = new Date(tip.createdAt).getHours();
            hourlyData[hour].tips += 1;
            hourlyData[hour].earnings += amount;
          }
        });
      }

      const avgTip = totalTips > 0 ? totalEarnings / totalTips : 0;
      const conversionRate = totalScans > 0 ? (totalTips / totalScans) * 100 : 0;

      // Generate earnings timeline (last 7 days)
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTips = profiles.length > 0 ? await storage.getProfileTips(profiles[0].id) : [];
        const dayFilteredTips = dayTips.filter(tip => 
          tip.createdAt && tip.createdAt.toISOString().split('T')[0] === dateStr
        );
        const dayEarnings = dayFilteredTips.reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
        
        earningsData.push({
          date: dateStr,
          earnings: dayEarnings,
          tips: dayFilteredTips.length,
          avgTip: dayFilteredTips.length > 0 ? dayEarnings / dayFilteredTips.length : 0
        });
      }

      res.json({
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalTips,
        avgTip: parseFloat(avgTip.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        topHour: '8 PM', // Could be calculated from hourlyData
        topDay: 'Friday', // Could be calculated from historical data
        weeklyGrowth: 18.2, // Mock for now
        earningsData,
        methodData: [
          { method: 'Venmo', value: methodData.venmo, percentage: totalEarnings > 0 ? (methodData.venmo / totalEarnings * 100).toFixed(1) : 0 },
          { method: 'Cash App', value: methodData.cashapp, percentage: totalEarnings > 0 ? (methodData.cashapp / totalEarnings * 100).toFixed(1) : 0 },
          { method: 'Stripe', value: methodData.stripe, percentage: totalEarnings > 0 ? (methodData.stripe / totalEarnings * 100).toFixed(1) : 0 },
          { method: 'Zelle', value: methodData.zelle, percentage: totalEarnings > 0 ? (methodData.zelle / totalEarnings * 100).toFixed(1) : 0 }
        ],
        hourlyData: hourlyData.filter(h => h.tips > 0 || h.earnings > 0)
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}