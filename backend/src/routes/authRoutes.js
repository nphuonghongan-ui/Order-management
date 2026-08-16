import { Router } from 'express';
import { googleLogin, login, logout, me, refresh } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate an account
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
 * /auth/google:
 *   post:
 *     summary: Authenticate with a Google One Tap ID token
 *     description: |
 *       Verifies the Google ID token (JWT) and issues an AxonLog session.
 *       Looks up an existing account by `email`. If no account matches,
 *       auto-creates a new PO account with synthetic IDs (`B2C-...`,
 *       `b2c-{googleSub}`), empty password, `authProvider: 'google'`,
 *       and `emailVerified: true` (Google has already verified the email).
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
router.post('/google', googleLogin);

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
