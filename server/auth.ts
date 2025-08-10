import bcrypt from 'bcrypt';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage';

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl / 1000, // Convert to seconds
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'tipvault-dev-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
      sameSite: 'lax',
      domain: undefined, // Don't set domain for localhost
    },
  });
}

// Setup authentication middleware
export function setupAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(getSession());
  
  // Enable CORS for session cookies
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    const origin = req.headers.origin || 'http://localhost:5000';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authentication middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Get current user from session
export const getCurrentUser: RequestHandler = async (req, res, next) => {
  console.log('getCurrentUser middleware - session ID:', req.sessionID);
  console.log('getCurrentUser middleware - session userId:', req.session?.userId);
  console.log('getCurrentUser middleware - session data:', JSON.stringify(req.session, null, 2));
  
  if (req.session && req.session.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      req.user = user;
      console.log('User loaded from session:', user?.email);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }
  next();
};

// Types for session
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}