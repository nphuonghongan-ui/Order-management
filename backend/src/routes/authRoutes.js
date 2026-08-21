import { Router } from 'express';
import {
  googleOnetapLogin,
  oauthCallback,
  oauthStart,
  login,
  logout,
  me,
  refresh,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate with userName/password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing userName or password
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @openapi
 * /auth/google/onetap:
 *   post:
 *     summary: Authenticate with a Google One Tap ID token
 *     description: |
 *       Verifies the Google ID token (JWT) and issues an AxonLog session.
 *       Looks up an existing account by `email`. If no account matches,
 *       auto-creates a new PO account with synthetic IDs (`B2C-...`,
 *       `b2c-{googleSub}`), empty password, `authProvider: 'google'`,
 *       and `emailVerified: true` (Google has already verified the email).
 *
 *       This path stays One-Tap-only and does NOT grant any Google API
 *       scopes. Use `/auth/oauth?intent=<provider>` for the OAuth
 *       authorization-code flow.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google ID token (JWT) returned by `google.accounts.id`.
 *     responses:
 *       200:
 *         description: Login successful (existing or newly-created account)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing credential
 *       401:
 *         description: Invalid, expired, or unverified Google ID token
 */
router.post('/google/onetap', googleOnetapLogin);

/**
 * @openapi
 * /auth/oauth:
 *   get:
 *     summary: Begin OAuth 2.0 authorization code flow
 *     description: |
 *       Provider-agnostic OAuth start endpoint. The provider is selected via
 *       the `intent` query parameter (default `google`). Supported intents are
 *       the keys of the `providers` map in `src/oauth/index.js`.
 *
   *       Sets short-lived `__Host-oauth-state` and `__Host-oauth-pkce-verifier`
   *       cookies (HttpOnly, Secure, SameSite=Lax). The state cookie carries an
 *       opaque state id used for double-submit CSRF protection. The PKCE
 *       verifier is delivered to Google's token endpoint out-of-band, never
 *       in the URL. After consent, the provider redirects back to
 *       `/auth/oauth/callback?code=...&state=...`.
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: intent
 *         required: false
 *         schema: { type: string, enum: [google, github] }
 *         description: OAuth provider to start. Defaults to `google`.
 *     responses:
 *       302:
 *         description: Redirect to the provider's consent screen
 *         headers:
 *           Set-Cookie:
   *             description: __Host-oauth-state and __Host-oauth-pkce-verifier (HttpOnly, Secure, SameSite=Lax)
 *             schema: { type: string }
 *           Location:
 *             description: Provider authorization endpoint URL
 *             schema: { type: string, format: uri }
 */
router.get('/oauth', oauthStart);

/**
 * @openapi
 * /auth/oauth/callback:
 *   get:
 *     summary: OAuth 2.0 callback (provider-agnostic)
 *     description: |
   *       Single callback endpoint for ALL configured OAuth providers.
   *       The provider is recovered from the `__Host-oauth-state` cookie
   *       set by `/auth/oauth`, then:
 *         1. Compares `state` query parameter against the `stateId` carried
 *            in the cookie.
 *         2. Calls `provider.exchangeCodeForTokens({ code, codeVerifier })`.
 *         3. Calls `provider.verifyIdentity({ idToken })`.
   *         4. Upserts the Account and issues AxonLog's own `accessToken`
   *            and `__Host-auth-refresh` cookie. Provider access/refresh tokens
   *            are NEVER stored.
 *         5. Redirects to `/oauth/success#access_token=...&returnTo=...&role=...&provider=...`
 *            with `returnTo` always set to `/dashboard/my-orders`.
 *
 *       Browser-swapping attack mitigation: when the `state` cookie is
 *       missing or mismatched, the backend **never** accepts the supplied
 *       `code` and instead redirects to the SPA's error page without
 *       performing any token exchange or setting any cookies. The error
 *       redirect carries only `error` and `error_description` query
 *       parameters (no `code`, no `state`, no AxonLog tokens).
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema: { type: string }
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *       - in: query
 *         name: error
 *         schema: { type: string }
 *       - in: query
 *         name: error_description
 *         schema: { type: string }
 *     responses:
 *       302:
 *         description: |
   *           Redirect to `/oauth/success` (Set-Cookie: __Host-auth-refresh)
 *           or to `/oauth/error` (consent denied / state mismatch /
 *           token exchange failure / unknown provider).
 */
router.get('/oauth/callback', oauthCallback);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token and issue a new access token
 *     tags: [Auth]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: New access token issued; rotated refresh token set via Set-Cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid, expired, or reused refresh token
 */
router.post('/refresh', refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoke the refresh token and clear the refresh cookie
 *     tags: [Auth]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       204:
 *         description: Logged out
 */
router.post('/logout', logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated account
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', requireAuth, me);

export default router;
