# JWT Migration Risk Assessment

## Low Risk - Already Addressed

### 1. Session Store Issues ✅ RESOLVED
- **Previous**: Database-backed sessions causing 500 errors in serverless
- **Current**: Stateless JWT tokens, no database dependency for auth
- **Risk**: None (this was the primary issue being solved)

### 2. Cookie Security ✅ IMPLEMENTED
- HttpOnly cookies prevent XSS attacks
- Secure flag in production prevents MITM attacks
- SameSite: "lax" prevents CSRF while allowing navigation
- **Risk**: Low (standard security practices implemented)

### 3. Token Expiry ✅ CONFIGURED
- 7-day expiry (configurable via code)
- Automatic expiry via JWT exp claim
- **Risk**: Low (reasonable default, can be adjusted)

## Medium Risk - Requires Monitoring

### 4. Token Revocation
- **Issue**: JWT tokens cannot be revoked until expiry (7 days)
- **Impact**: If a token is compromised, user must wait for expiry or change password
- **Mitigation**: 
  - Short token expiry (7 days is reasonable)
  - User can logout (clears cookie, but token remains valid if stolen)
  - Consider implementing refresh tokens for long-lived sessions (future enhancement)
- **Risk**: Medium (standard JWT limitation, acceptable for most use cases)

### 5. Response Format Compatibility
- **Issue**: Frontend expects user object directly, not wrapped in `{ user: ... }`
- **Status**: ✅ Maintained compatibility - endpoints return user object directly
- **Risk**: None (compatibility maintained)

### 6. Error Response Codes
- **Issue**: Some endpoints may return different error codes
- **Status**: ✅ Updated /register to return 500 for infrastructure errors (was 400)
- **Risk**: Low (improved error handling)

## Potential Issues - Requires Testing

### 7. Cross-Origin Cookie Handling
- **Current Setup**: CORS configured with `credentials: true`
- **Potential Issue**: Cookies may not be sent/received in cross-origin scenarios
- **Detection**: 
  - Test with frontend on different domain
  - Check browser DevTools → Network → Request Headers (should include Cookie)
  - Check Response Headers (Set-Cookie should be present)
- **Mitigation**: 
  - Ensure frontend uses `credentials: 'include'` in fetch/axios
  - Verify CORS allows frontend origin
  - Test in production environment
- **Risk**: Medium (needs verification in deployment)

### 8. Cookie Domain/Path Issues
- **Current**: No explicit domain set (uses default)
- **Potential Issue**: Cookies may not be sent if frontend/backend on different subdomains
- **Detection**: Test cookie is present in browser DevTools → Application → Cookies
- **Mitigation**: If needed, set explicit domain in cookie configuration
- **Risk**: Low (default behavior works for same domain)

### 9. Middleware Order
- **Current**: authenticateOptional applied globally before routes
- **Potential Issue**: Routes that don't need auth still parse cookies (minimal overhead)
- **Risk**: Very Low (minimal performance impact)

## Endpoints Verified

### ✅ All Routes Updated
- `/api/auth/register` - Uses JWT, returns user object
- `/api/auth/login` - Uses JWT, returns user object
- `/api/auth/logout` - Clears cookie
- `/api/auth/me` - Uses requireAuth, returns user object
- `/api/news` - Uses authenticateOptional (optional auth)
- `/api/news/my-news` - Uses requireAuth + requireJournalistOrInfluencer
- `/api/news` (POST) - Uses requireAuth + requireJournalistOrInfluencer
- `/api/players/:id/ratings` (POST) - Uses requireAuth
- `/api/profile/*` - Uses requireAuth
- `/api/badges/*` - Uses requireAuth
- `/api/admin/*` - Uses requireAuth + requireAdmin
- `/api/influencer/*` - Uses requireAuth

### ✅ All Middleware Updated
- requireAuth - Uses JWT, sets req.user
- requireAdmin - Uses req.user, fetches user from DB
- requireJournalistOrInfluencer - Uses req.user, fetches user from DB

## No Session Dependencies Remaining

### ✅ Verified Cleanup
- No `req.session` references in codebase
- No `express-session` usage
- No `connect-pg-simple` usage
- No `sessionPool` usage
- Session middleware removed

## Testing Recommendations

### Before Deployment
1. Test all auth endpoints locally
2. Test cookie is set correctly (check browser DevTools)
3. Test logout clears cookie
4. Test protected routes require authentication
5. Test admin/journalist role checks still work

### After Deployment
1. Test registration flow end-to-end
2. Test login flow end-to-end
3. Test logout flow
4. Test protected routes (dashboard, profile, etc.)
5. Test admin/journalist routes
6. Monitor error logs for any JWT-related errors
7. Verify no session-related errors in logs

## Rollback Plan

If issues arise, rollback steps:

1. Revert code changes (git revert)
2. Restore SESSION_SECRET environment variable
3. Re-deploy previous version
4. No database schema changes required (user_sessions table can remain)

## Success Criteria

✅ No 500 errors on /api/auth/me
✅ No 500 errors on /api/auth/register
✅ Cookies are set correctly (HttpOnly, Secure in production)
✅ Authentication works for all protected routes
✅ Role-based access control works (admin, journalist, influencer)
✅ No session store connection errors
✅ Stateless authentication (serverless-friendly)

