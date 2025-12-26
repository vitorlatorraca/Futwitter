import jwt from "jsonwebtoken";

// Fail fast if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. Please set it in your .env file."
  );
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY_DAYS = 7;
const JWT_EXPIRY_SECONDS = JWT_EXPIRY_DAYS * 24 * 60 * 60;

export interface JWTPayload {
  userId: string | number;
  iat?: number;
  exp?: number;
}

/**
 * Sign a JWT token with userId
 * @param userId - The user ID to include in the token
 * @returns Signed JWT token
 */
export function signToken(userId: string | number): string {
  const payload: JWTPayload = {
    userId,
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: JWT_EXPIRY_SECONDS,
  });
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns Decoded payload if valid, null otherwise
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    // Token is invalid, expired, or malformed
    return null;
  }
}

/**
 * Get the cookie maxAge in milliseconds (for cookie expiry)
 */
export function getCookieMaxAge(): number {
  return JWT_EXPIRY_SECONDS * 1000;
}

