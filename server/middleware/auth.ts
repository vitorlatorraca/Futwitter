import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Extended Request interface with session data
 */
export interface AuthRequest extends Request {
  session: Request['session'] & {
    userId?: string;
    userType?: string;
  };
}

/**
 * Middleware to check if user is authenticated
 * Returns 401 if not authenticated
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Not authenticated' 
    });
  }
  next();
}

/**
 * Middleware to check if user is a journalist or influencer
 * Must be used after requireAuth
 */
export async function requireJournalistOrInfluencer(req: AuthRequest, res: Response, next: NextFunction) {
  // Check if journalist
  if (req.session.userType === 'JOURNALIST') {
    return next();
  }

  // Check if influencer
  if (req.session.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.isInfluencer) {
        return next();
      }
    } catch (error) {
      console.error('Error checking influencer status:', error);
    }
  }

  return res.status(403).json({ 
    status: 'error',
    message: 'Access denied. Only journalists or influencers allowed.' 
  });
}

/**
 * Middleware to check if user is an admin
 * Must be used after requireAuth
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.session.userType !== 'ADMIN') {
    return res.status(403).json({ 
      status: 'error',
      message: 'Access denied. Admin only.' 
    });
  }
  next();
}

/**
 * Middleware to optionally attach user to request
 * Does not return error if not authenticated
 */
export async function attachUser(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.session.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        (req as any).user = user;
      }
    } catch (error) {
      // Silently fail - user just won't be attached
    }
  }
  next();
}

/**
 * Rate limiting helper - simple in-memory implementation
 * For production, use Redis-based rate limiting
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: { 
  windowMs: number; 
  max: number;
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs });
      return next();
    }
    
    if (record.count >= options.max) {
      return res.status(429).json({
        status: 'error',
        message: options.message || 'Too many requests, please try again later'
      });
    }
    
    record.count++;
    next();
  };
}

/**
 * Clean up expired rate limit records periodically
 */
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Clean up every minute

