# Vercel Deploy Checklist

## Required Environment Variables

Set these in your Vercel project settings:

1. **JWT_SECRET** (NEW - REQUIRED)
   - Generate a strong random secret: `openssl rand -base64 32` or use any secure random string generator
   - Minimum 32 characters recommended
   - This secret is used to sign/verify JWT tokens
   - Application will fail to start if this is missing

2. **DATABASE_URL** (EXISTING - REQUIRED)
   - Your Neon PostgreSQL connection string
   - Still required for user data, but NOT for sessions anymore

3. **NODE_ENV** (EXISTING - OPTIONAL)
   - Should be set to `"production"` in Vercel
   - If not set, defaults to development mode
   - Controls: cookie secure flag, CORS behavior

4. **FRONTEND_URL** (OPTIONAL)
   - If using cross-origin requests, set this to your frontend domain
   - Used for CORS configuration
   - If not set, uses request origin

5. **COOKIE_DOMAIN** (REMOVED - NO LONGER NEEDED)
   - Removed from cookie configuration
   - Cookies now use default domain behavior

## Cookie Behavior in Production

- **Secure**: `true` (only sent over HTTPS)
- **HttpOnly**: `true` (not accessible via JavaScript)
- **SameSite**: `"lax"` (prevents CSRF, allows same-site navigation)
- **Path**: `"/"` (available on all paths)
- **MaxAge**: 7 days (604800 seconds)

## Testing Steps (using curl)

### 1. Register a new user
```bash
curl -X POST https://your-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}' \
  -c cookies.txt \
  -v
```
**Expected**: 
- Status: 200
- Cookie: `auth_token=...` (HttpOnly, Secure in production)
- Response: User object with id, name, email, etc. (no password)

### 2. Login
```bash
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -c cookies.txt \
  -v
```
**Expected**:
- Status: 200
- Cookie: `auth_token=...` (HttpOnly, Secure in production)
- Response: User object

### 3. Get current user (requires auth)
```bash
curl -X GET https://your-domain.vercel.app/api/auth/me \
  -b cookies.txt \
  -v
```
**Expected**:
- Status: 200
- Response: User object

**Without cookie (should fail)**:
```bash
curl -X GET https://your-domain.vercel.app/api/auth/me \
  -v
```
**Expected**:
- Status: 401
- Response: `{"message":"Não autenticado"}`

### 4. Logout
```bash
curl -X POST https://your-domain.vercel.app/api/auth/logout \
  -b cookies.txt \
  -v
```
**Expected**:
- Status: 200
- Cookie: `auth_token=` (empty, maxAge=0, expires immediately)
- Response: `{"ok":true}`

**After logout, /me should fail**:
```bash
curl -X GET https://your-domain.vercel.app/api/auth/me \
  -b cookies.txt \
  -v
```
**Expected**:
- Status: 401

## Frontend Configuration

If your frontend is on a different domain (cross-origin):

1. Ensure `credentials: 'include'` is set in fetch/axios calls
2. Verify CORS configuration allows your frontend origin
3. Check that `Access-Control-Allow-Credentials: true` is set (already configured)

Example fetch:
```javascript
fetch('https://your-api.vercel.app/api/auth/me', {
  credentials: 'include'
})
```

## Verification Checklist

- [ ] JWT_SECRET is set in Vercel environment variables
- [ ] DATABASE_URL is set and working
- [ ] NODE_ENV is set to "production" (optional but recommended)
- [ ] Register endpoint works and sets cookie
- [ ] Login endpoint works and sets cookie
- [ ] /me endpoint works with cookie
- [ ] /me endpoint returns 401 without cookie
- [ ] Logout endpoint clears cookie
- [ ] Cookie has Secure flag in production
- [ ] Cookie has HttpOnly flag
- [ ] Frontend can access protected routes
- [ ] No session-related errors in logs

