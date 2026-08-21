import Account from '../models/Account.js';
import RefreshToken from '../models/RefreshToken.js';
import {
  setCookie,
  clearCookie,
  getCookie,
} from '../config/cookies.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  newId,
  refreshExpiresAt,
} from '../utils/tokens.js';
import { __verifyGoogleIdToken } from '../oauth/google.js';
import { getProvider } from '../oauth/index.js';
import {
  createOauthFlow,
  decodeFlowCookie,
  clearOauthFlowCookies,
} from '../lib/oauthState.js';
import { withRetry } from '../utils/retry.js';
import crypto from 'node:crypto';

const issueSession = async (res, account) => {
  const jti = newId();
  const familyId = newId();
  const accessToken = signAccessToken(account);
  const refreshToken = signRefreshToken({
    userId: account._id,
    jti,
    familyId,
  });

  await RefreshToken.create({
    userId: account._id,
    jti,
    familyId,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiresAt(),
  });

  setCookie(res, 'refresh', refreshToken);
  return { accessToken };
};

const revokeFamily = async (familyId) => {
  await RefreshToken.updateMany(
    { familyId, revokedAt: null },
    { revokedAt: new Date() }
  );
};

export const login = async (req, res) => {
  const { userName, password } = req.body || {};

  if (!userName || !password) {
    return res.status(400).json({ message: 'userName and password are required' });
  }

  const account = await Account.findOne({ userName }).select('+password');

  if (!account || !(await account.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { accessToken } = await issueSession(res, account);
  return res.status(200).json({
    account: Account.toProfile(account),
    accessToken,
  });
};

export const refresh = async (req, res) => {
  const presented = getCookie(req, 'refresh');

  if (!presented) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  let payload;
  try {
    payload = verifyRefreshToken(presented);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }

  const stored = await RefreshToken.findOne({ jti: payload.jti });

  if (!stored) {
    if (payload.familyId) {
      await revokeFamily(payload.familyId);
    }
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  if (stored.revokedAt) {
    await revokeFamily(stored.familyId);
    return res.status(401).json({ message: 'Refresh token reuse detected' });
  }

  if (stored.expiresAt < new Date()) {
    stored.revokedAt = new Date();
    await stored.save();
    return res.status(401).json({ message: 'Refresh token expired' });
  }

  if (stored.tokenHash !== hashToken(presented)) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const account = await Account.findById(stored.userId);
  if (!account) {
    await revokeFamily(stored.familyId);
    return res.status(401).json({ message: 'Account no longer exists' });
  }

  const newJti = newId();
  const accessToken = signAccessToken(account);
  const refreshToken = signRefreshToken({
    userId: account._id,
    jti: newJti,
    familyId: stored.familyId,
  });

  stored.revokedAt = new Date();
  stored.replacedBy = newJti;
  await stored.save();

  await RefreshToken.create({
    userId: account._id,
    jti: newJti,
    familyId: stored.familyId,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiresAt(),
  });

  setCookie(res, 'refresh', refreshToken);
  return res.status(200).json({ accessToken });
};

export const me = (req, res) => {
  return res.status(200).json({ account: req.user });
};

export const logout = async (req, res) => {
  const presented = getCookie(req, 'refresh');
  if (presented) {
    try {
      const payload = verifyRefreshToken(presented);
      await RefreshToken.updateOne(
        { jti: payload.jti },
        { revokedAt: new Date() }
      );
    } catch {
      // invalid/expired refresh token — nothing to revoke, still clear cookies
    }
  }
  clearCookie(res, 'refresh');
  return res.status(204).send();
};

const FRONTEND_ORIGIN =
  (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .find(Boolean) || 'http://localhost:5173';

const OAUTH_SUCCESS_RETURN_TO = '/dashboard/my-orders';

const upsertGoogleAccount = async (payload) => {
  let account = await Account.findOne({ email: payload.email });

  if (!account) {
    try {
      account = await withRetry(() =>
        Account.create({
          customerCustId: `B2C-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
          userName: payload.name,
          email: payload.email,
          googleSub: payload.sub,
          authProvider: 'google',
          role: 'PO',
          emailVerified: true,
          password: null,
        }),
      );
    } catch (err) {
      if (err?.code === 11000) {
        account = await Account.findOne({ email: payload.email });
      } else {
        throw err;
      }
    }
  }

  if (account.role !== 'PO') {
    const err = new Error('Google sign-in is only available for PO accounts.');
    err.status = 403;
    throw err;
  }

  let dirty = false;
  if (!account.googleSub) {
    account.googleSub = payload.sub;
    dirty = true;
  }
  if (!account.email && payload.email) {
    account.email = payload.email;
    dirty = true;
  }
  if (account.password && account.authProvider === 'local') {
    account.authProvider = 'both';
    dirty = true;
  } else if (!account.password && account.authProvider !== 'google') {
    account.authProvider = 'google';
    dirty = true;
  }
  if (dirty) {
    await account.save();
  }

  return account;
};

const issueGoogleSession = async (req, res, account) => {
  const { accessToken } = await issueSession(res, account);
  return { accessToken, account };
};

export const oauthStart = async (req, res) => {
  const intent =
    typeof req.query?.intent === 'string' ? req.query.intent : 'google';
  const provider = getProvider(intent);

  if (!provider) {
    const params = new URLSearchParams({
      error: 'unknown_provider',
      error_description: `OAuth provider "${intent}" is not configured`,
    });
    return res.redirect(
      `${FRONTEND_ORIGIN}/oauth/error?${params.toString()}`,
    );
  }

  const { state, codeVerifier, cookieValue } = createOauthFlow({
    provider: provider.intent,
  });

  setCookie(res, 'oauthState', cookieValue);
  setCookie(res, 'pkceVerifier', codeVerifier);

  const url = provider.buildAuthUrl({
    state: state,
    codeVerifier,
  });

  return res.redirect(url);
};

export const oauthCallback = async (req, res) => {
  const { code, state, error, error_description: errorDescription } = req.query || {};
  const presentedState = getCookie(req, 'oauthState');
  const presentVerifier = getCookie(req, 'pkceVerifier');

  const redirectError = (errorCode, description) => {
    const params = new URLSearchParams({
      error: errorCode,
      error_description: description || '',
    });
    return `${FRONTEND_ORIGIN}/oauth/error?${params.toString()}`;
  };

  if (error) {
    clearOauthFlowCookies(res);
    return res.redirect(
      redirectError(String(error), errorDescription ? String(errorDescription) : ''),
    );
  }

  if (!code || !state || !presentedState || !presentVerifier) {
    clearOauthFlowCookies(res);
    return res.redirect(
      redirectError(
        'invalid_state',
        'Missing or mismatched OAuth state',
      ),
    );
  }

  const flow = decodeFlowCookie(presentedState);

  if (!flow || flow.stateId !== state) {
    clearOauthFlowCookies(res);
    return res.redirect(
      redirectError(
        'invalid_state',
        'Missing or mismatched OAuth state',
      ),
    );
  }

  const provider = getProvider(flow.provider);
  if (!provider) {
    clearOauthFlowCookies(res);
    return res.redirect(
      redirectError(
        'unknown_provider',
        `OAuth provider "${flow.provider}" is not configured`,
      ),
    );
  }

  clearOauthFlowCookies(res);

  let tokens;
  try {
    tokens = await provider.exchangeCodeForTokens({
      code: String(code),
      codeVerifier: presentVerifier,
    });
  } catch (err) {
    return res.redirect(
      redirectError('token_exchange_failed', err.message || 'unknown'),
    );
  }

  let identity;
  try {
    identity = await provider.verifyIdentity({ idToken: tokens.id_token });
  } catch (err) {
    const params = new URLSearchParams({
      error: tokens.id_token ? 'id_token_invalid' : 'missing_id_token',
      error_description: err.message || 'unknown',
    });
    return res.redirect(`${FRONTEND_ORIGIN}/oauth/error?${params.toString()}`);
  }

  try {
    const account = await upsertGoogleAccount(identity);
    const { accessToken } = await issueGoogleSession(req, res, account);
    const successUrl = new URL(`${FRONTEND_ORIGIN}/oauth/success`);
    const fragment = new URLSearchParams({
      access_token: accessToken,
      returnTo: OAUTH_SUCCESS_RETURN_TO,
      provider: provider.intent,
    });
    successUrl.hash = fragment.toString();
    return res.redirect(successUrl.toString());
  } catch (err) {
    console.error('[oauthCallback] failed:', err);
    const status = err.status || 500;
    return res.redirect(
      redirectError(
        status === 403 ? 'forbidden' : 'server_error',
        err.message || 'unknown',
      ),
    );
  }
};

export const googleOnetapLogin = async (req, res) => {
  const { credential } = req.body || {};

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  let payload;
  try {
    payload = await __verifyGoogleIdToken({ idToken: credential });
  } catch (err) {
    return res.status(401).json({ message: `Invalid Google credential: ${err.message}` });
  }

  try {
    const account = await upsertGoogleAccount(payload);
    const { accessToken } = await issueGoogleSession(req, res, account);
    return res.status(200).json({
      account: Account.toProfile(account),
      accessToken,
    });
  } catch (err) {
    console.error('[googleOnetapLogin] failed:', err);
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Google login failed' });
  }
};