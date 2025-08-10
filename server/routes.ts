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
      console.log('Signup request body:', req.body);
      const { email, password, firstName, lastName } = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }
      
      // Hash password
      const passwordHash = await hashPassword(password);
      console.log('Creating user with:', { email, firstName, lastName, passwordHashLength: passwordHash.length });
      
      // Create user
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
      });
      
      console.log('User created successfully:', user.id);
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      // Return user without password plus token
      const { passwordHash: _, ...userResponse } = user;
      res.status(201).json({ 
        user: userResponse,
        token: token
      });
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

  const httpServer = createServer(app);
  return httpServer;
}