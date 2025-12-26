import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string | number };
      cookies?: { [key: string]: string };
    }
  }
}

/**
 * Simple cookie parser helper
 * Parses the Cookie header and returns an object with cookie key-value pairs
 */
function parseCookies(cookieHeader: string | undefined): { [key: string]: string } {
  const cookies: { [key: string]: string } = {};
  
  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.trim().split('=');
    if (parts.length === 2) {
      const key = parts[0].trim();
      const value = parts[1].trim();
      cookies[key] = value;
    }
  });

  return cookies;
}

/**
 * Optional authentication middleware
 * Parses the JWT cookie and sets req.user if a valid token is present.
 * If no token or invalid token, req.user remains undefined.
 */
export function authenticateOptional(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Parse cookies from header
  if (!req.cookies) {
    req.cookies = parseCookies(req.headers.cookie);
  }
  
  const token = req.cookies.auth_token;

  if (!token) {
    return next();
  }

  const payload = verifyToken(token);
  if (payload) {
    req.user = { id: payload.userId };
  }

  next();
}

/**
 * Required authentication middleware
 * Parses the JWT cookie and sets req.user if a valid token is present.
 * Returns 401 if no token or invalid token.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Parse cookies from header
  if (!req.cookies) {
    req.cookies = parseCookies(req.headers.cookie);
  }
  
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }

  req.user = { id: payload.userId };
  next();
}

