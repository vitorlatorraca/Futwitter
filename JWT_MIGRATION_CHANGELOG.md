# JWT Migration Changelog

## Summary
Migrated from express-session + connect-pg-simple (database-backed sessions) to JWT-based authentication with HttpOnly cookies. This change eliminates session store/database connection issues in serverless environments.

## Files Created
- `server/auth/jwt.ts` - JWT token signing and verification utilities
- `server/auth/middleware.ts` - Authentication middleware (authenticateOptional, requireAuth)
- `server/auth/cookies.ts` - Cookie management utilities (setAuthCookie, clearAuthCookie)

## Files Modified
- `server/routes.ts`
  - Removed: express-session, connect-pg-simple imports and session middleware
  - Removed: session-based requireAuth, requireAdmin, requireJournalistOrInfluencer
  - Added: JWT imports and cookie utilities
  - Added: authenticateOptional middleware applied globally
  - Updated: All auth routes (/register, /login, /logout, /me) to use JWT cookies
  - Updated: All middleware (requireAuth, requireAdmin, requireJournalistOrInfluencer) to use req.user
  - Updated: All routes using req.session.userId → req.user.id
  - Updated: Error handling in /register to return 500 for infrastructure errors

- `server/db.ts`
  - Removed: sessionPool export and pg Pool import (no longer needed)

- `package.json`
  - Added: @types/jsonwebtoken (dev dependency)

## Files Deleted
- None (session-related code removed but files remain)

## Key Behavioral Changes

### Authentication Flow
1. **Registration (/api/auth/register)**
   - Issues JWT token in HttpOnly cookie instead of creating session
   - Returns user object with public fields (no password)
   - Returns 500 for DB/infrastructure errors (not 400)

2. **Login (/api/auth/login)**
   - Issues JWT token in HttpOnly cookie instead of creating session
   - Returns user object with public fields (no password)
   - No longer uses req.session.save() callback pattern

3. **Me (/api/auth/me)**
   - Uses requireAuth middleware (checks JWT cookie)
   - Returns user object with public fields (no password)

4. **Logout (/api/auth/logout)**
   - Clears auth_token cookie (sets empty value + immediate expiry)
   - Returns { ok: true } instead of session destroy callback

### Middleware Changes
- **authenticateOptional**: Applied globally, parses JWT cookie, sets req.user if valid token present
- **requireAuth**: Verifies JWT cookie, sets req.user, returns 401 if missing/invalid
- **requireAdmin**: Now async, fetches user from DB to check userType
- **requireJournalistOrInfluencer**: Now async, fetches user from DB to check userType/isInfluencer

### Request Object Changes
- `req.session.userId` → `req.user.id` (string | number)
- `req.session.userType` → fetched from DB via `storage.getUser(req.user.id)`

### Cookie Configuration
- **Name**: `auth_token`
- **HttpOnly**: true
- **Secure**: true in production, false in development
- **SameSite**: "lax"
- **Path**: "/"
- **MaxAge**: 7 days (604800 seconds)

### JWT Configuration
- **Algorithm**: HS256
- **Secret**: JWT_SECRET environment variable (required, fails fast if missing)
- **Payload**: { userId: string|number, iat, exp }
- **Expiry**: 7 days

## Breaking Changes
- **None** - API endpoints maintain same request/response format
- Frontend compatibility maintained (same response structure)
- Cookie is automatically sent/received with credentials: 'include'

## Dependencies Removed
- express-session (still in package.json but no longer used)
- connect-pg-simple (still in package.json but no longer used)
- sessionPool from db.ts

## Environment Variables
- **Removed**: SESSION_SECRET (no longer needed)
- **Added**: JWT_SECRET (required, fails fast on boot if missing)
- **Existing**: DATABASE_URL (still required, but not for sessions)

