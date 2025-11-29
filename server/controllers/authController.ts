import { Request, Response } from 'express';
import { storage } from '../storage';
import { Password } from '../utils/password';
import { validateRegistration, validateLogin, sanitizeEmail } from '../utils/validation';
import { insertUserSchema } from '../../shared/schema';

/**
 * Auth Controller - Handles all authentication-related operations
 * Following best practices from receipt-scanner reference project
 */

interface AuthRequest extends Request {
  session: Request['session'] & {
    userId?: string;
    userType?: string;
  };
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Validate input
    const validation = validateRegistration(req.body);
    if (!validation.valid) {
      res.status(400).json({ 
        status: 'error',
        message: validation.errors[0],
        errors: validation.errors 
      });
      return;
    }

    // Parse with Zod schema for additional validation
    const { name, email, password, teamId } = insertUserSchema.parse(req.body);
    const normalizedEmail = sanitizeEmail(email);

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(normalizedEmail);
    if (existingUser) {
      res.status(400).json({ 
        status: 'error',
        message: 'Email already registered' 
      });
      return;
    }

    // Hash password
    const hashedPassword = await Password.toHash(password);

    // Create user
    const user = await storage.createUser({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      teamId: teamId || null,
      userType: 'FAN',
    });

    // Set session
    req.session.userId = user.id;
    req.session.userType = user.userType;

    // Award signup badge
    await storage.checkAndAwardBadges(user.id);

    res.status(201).json({ 
      status: 'success',
      user: {
        id: user.id, 
        name: user.name, 
        email: user.email, 
        teamId: user.teamId, 
        userType: user.userType, 
        isInfluencer: user.isInfluencer, 
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error?.message || error);
    res.status(400).json({ 
      status: 'error',
      message: error.message || 'Error creating account' 
    });
  }
}

/**
 * Login an existing user
 * POST /api/auth/login
 */
export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Validate input
    const validation = validateLogin(req.body);
    if (!validation.valid) {
      res.status(400).json({ 
        status: 'error',
        message: validation.errors[0],
        errors: validation.errors 
      });
      return;
    }

    const { email, password } = req.body;
    const normalizedEmail = sanitizeEmail(email);

    // Find user
    const user = await storage.getUserByEmail(normalizedEmail);
    if (!user) {
      res.status(401).json({ 
        status: 'error',
        message: 'Invalid email or password' 
      });
      return;
    }

    // Verify password
    const isValidPassword = await Password.compare(user.password, password);
    if (!isValidPassword) {
      res.status(401).json({ 
        status: 'error',
        message: 'Invalid email or password' 
      });
      return;
    }

    // Set session
    req.session.userId = user.id;
    req.session.userType = user.userType;

    res.json({ 
      status: 'success',
      user: {
        id: user.id, 
        name: user.name, 
        email: user.email, 
        teamId: user.teamId, 
        userType: user.userType, 
        isInfluencer: user.isInfluencer, 
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error: any) {
    console.error('Login error:', error?.message || error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Error logging in' 
    });
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export function logout(req: AuthRequest, res: Response): void {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ 
        status: 'error',
        message: 'Error logging out' 
      });
      return;
    }
    res.json({ 
      status: 'success',
      message: 'Logout successful' 
    });
  });
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ 
      status: 'error',
      message: 'Not authenticated' 
    });
    return;
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
      return;
    }

    res.json({ 
      status: 'success',
      user: {
        id: user.id, 
        name: user.name, 
        email: user.email, 
        teamId: user.teamId, 
        userType: user.userType, 
        isInfluencer: user.isInfluencer, 
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error: any) {
    console.error('Get current user error:', error?.message || error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Error fetching user' 
    });
  }
}

