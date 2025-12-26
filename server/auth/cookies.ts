import type { Response } from "express";
import { getCookieMaxAge } from "./jwt";

/**
 * Set the auth_token cookie with JWT token
 */
export function setAuthCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: getCookieMaxAge(),
  });
}

/**
 * Clear the auth_token cookie
 */
export function clearAuthCookie(res: Response): void {
  res.cookie("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Immediate expiry
  });
}

