# Diagnostic Report: 500 Internal Server Errors
## Endpoints: `/api/auth/me` and `/api/auth/register`

---

## ROOT CAUSES

### 1. Session Store Database Connection Failure
**Location:** `server/routes.ts:45-66`
- Session middleware configured with `connect-pg-simple` using `sessionPool` from `server/db.ts:27`
- Session store attempts to auto-create `user_sessions` table via `createTableIfMissing: true` (line 52)
- In Vercel serverless, if `sessionPool` fails to connect or lacks CREATE TABLE permissions, session operations fail silently, causing 500 errors

### 2. Database Pool Connection Issues (Serverless Environment)
**Location:** `server/db.ts:17-27`
- Two pools created at module load time:
  - `pool` (Neon serverless) - line 17-22
  - `sessionPool` (standard pg Pool) - line 27
- In serverless, persistent connections may not work; pools may fail to establish/retain connections between invocations
- No connection error handling/retry logic visible

### 3. Neon WebSocket Configuration Mismatch
**Location:** `server/db.ts:7`
- `neonConfig.webSocketConstructor = ws` set globally
- In Vercel serverless functions, WebSocket support may be limited or require different configuration, causing connection failures

### 4. Unhandled Session Save Errors
**Location:** `server/routes.ts:109-112` (register), `server/routes.ts:292` (me)
- Session properties set synchronously without explicit `req.session.save()` in register route
- Session middleware may fail to save to database store, causing downstream failures
- No error handling around session assignment

### 5. Incorrect Error Status Codes
**Location:** `server/routes.ts:142`
- `/api/auth/register` catch block returns `400` for ALL errors (line 142)
- Database connection/schema errors should return `500`, not `400`
- Masks actual production database failures

---

## FILES AND LINE NUMBERS

### Primary Error Sources:
1. **`server/db.ts:7`** - WebSocket constructor configuration
2. **`server/db.ts:17-27`** - Database pool initialization (both pools)
3. **`server/routes.ts:45-66`** - Session middleware configuration
4. **`server/routes.ts:52`** - `createTableIfMissing: true` - potential permission/connection failure
5. **`server/routes.ts:109-112`** - Session assignment without explicit save/error handling
6. **`server/routes.ts:142`** - Generic 400 error response (should be 500 for DB failures)
7. **`server/routes.ts:292`** - Database query without connection validation

---

## ISSUE CATEGORY

**Primary:** Database Connection + Session Store Configuration
**Secondary:** Runtime Assumptions (serverless environment behavior)
**Tertiary:** Environment Variables (DATABASE_URL may be misconfigured/inaccessible in Vercel)

---

## PRODUCTION vs LOCAL BEHAVIOR

**Works Locally, Fails in Production:**
- Local: Persistent database connections work; `sessionPool` can create tables; WebSocket connections function normally
- Production (Vercel): 
  - Serverless functions have cold starts; database connections may timeout/fail
  - Session store may not have CREATE TABLE permissions in production database
  - WebSocket connections may not be supported or configured differently in serverless environment
  - Connection pools may be reset between function invocations

**Specific Failures:**
1. Session middleware fails to initialize/store sessions → `/api/auth/me` cannot retrieve session → 500
2. Session store connection fails during registration → session cannot be saved after user creation → 500
3. Database queries (`storage.getUser`, `storage.getUserByEmail`, `storage.createUser`) fail due to pool connection issues → 500

---

## ADDITIONAL NOTES

- Error handling in routes exists but doesn't distinguish between validation errors (400) and infrastructure errors (500)
- No connection health checks before database operations
- Session middleware errors may occur before route handler executes, bypassing route-level try-catch blocks
