import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'brasileirao-jwt-secret-change-in-production';
const COOKIE_NAME = 'auth_token';

export interface JWTPayload {
    userId: string;
    userType: string;
}

export interface AuthenticatedRequest extends VercelRequest {
    auth?: JWTPayload;
}

/**
 * Generate JWT token and return as HTTP-only cookie
 */
export function generateAuthCookie(userId: string, userType: string): string {
    const token = jwt.sign({ userId, userType }, JWT_SECRET, {
        expiresIn: '30d',
    });

    return serialize(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
    });
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(): string {
    return serialize(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });
}

/**
 * Verify and decode JWT token from request cookies
 */
export function verifyAuthToken(req: VercelRequest): JWTPayload | null {
    try {
        const cookies = parse(req.headers.cookie || '');
        const token = cookies[COOKIE_NAME];

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error('JWT verification error:', error);
        return null;
    }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(
    handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void
) {
    return async (req: AuthenticatedRequest, res: VercelResponse) => {
        const auth = verifyAuthToken(req);

        if (!auth) {
            return res.status(401).json({ message: 'Não autenticado' });
        }

        req.auth = auth;
        return handler(req, res);
    };
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(
    handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void
) {
    return requireAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
        if (req.auth?.userType !== 'ADMIN') {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
        }

        return handler(req, res);
    });
}

/**
 * Middleware to require journalist or influencer
 */
export function requireJournalistOrInfluencer(
    handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void
) {
    return requireAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
        // Import storage here to avoid circular dependency
        const { storage } = await import('../../server/storage');

        if (req.auth?.userType === 'JOURNALIST') {
            return handler(req, res);
        }

        // Check if user is an influencer
        const user = await storage.getUser(req.auth!.userId);
        if (user?.isInfluencer) {
            return handler(req, res);
        }

        return res.status(403).json({ message: 'Acesso negado. Apenas jornalistas ou influencers.' });
    });
}
