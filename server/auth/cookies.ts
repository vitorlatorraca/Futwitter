import type { Response } from "express";
import { getCookieMaxAge } from "./jwt";

/**
 * Determine if cookies should be set for cross-origin requests
 * In production with separate frontend/backend, use "none" with secure
 */
function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  const frontendUrl = process.env.FRONTEND_URL;
  const backendUrl = process.env.BACKEND_URL || process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RENDER_EXTERNAL_URL;
  
  // If frontend and backend URLs are different, we need cross-origin cookies
  const isCrossOrigin = isProduction && frontendUrl && backendUrl && 
    new URL(frontendUrl).origin !== new URL(backendUrl).origin;
  
  return {
    httpOnly: true,
    secure: isProduction || isCrossOrigin, // Secure required for sameSite: "none"
    sameSite: (isCrossOrigin ? "none" : "lax") as "none" | "lax" | "strict",
    path: "/",
    maxAge: getCookieMaxAge(),
  };
}

/**
 * Set the auth_token cookie with JWT token
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie("auth_token", token, getCookieOptions());
}

/**
 * Clear the auth_token cookie
 */
export function clearAuthCookie(res: Response): void {
  const options = getCookieOptions();
  res.cookie("auth_token", "", {
    ...options,
    maxAge: 0, // Immediate expiry
  });
}

