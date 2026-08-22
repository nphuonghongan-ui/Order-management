import { OAuth2Client } from 'google-auth-library';
import {
  createBuildAuthUrl,
  createCompleteLogin,
  createDefaultScopesReader,
  createEnvRequirement,
  createExchangeCodeForTokens,
} from './base.js';

const ALLOWED_ISSUERS = new Set([
  'accounts.google.com',
  'https://accounts.google.com',
]);

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

const requireClientId = createEnvRequirement('GOOGLE_CLIENT_ID');
const requireClientSecret = createEnvRequirement('GOOGLE_CLIENT_SECRET');
const requireRedirectUri = createEnvRequirement('GOOGLE_REDIRECT_URI');

const defaultScopesForEnv = createDefaultScopesReader('google', [
  'openid',
  'email',
  'profile',
]);

const buildAuthUrl = createBuildAuthUrl({
  authUrl: GOOGLE_AUTH_URL,
  requireClientId,
  requireRedirectUri,
  defaultScopesForEnv,
  extraParams: {
    response_type: 'code',
    access_type: 'online',
    include_granted_scopes: 'true',
    prompt: 'select_account',
  },
  requirePkce: true,
});

const exchangeCodeForTokens = createExchangeCodeForTokens({
  tokenUrl: GOOGLE_TOKEN_URL,
  providerName: 'Google',
  requireClientId,
  requireClientSecret,
  requireRedirectUri,
  requirePkce: true,
  extraBody: () => ({ grant_type: 'authorization_code' }),
});

const verifyIdentity = async ({ idToken }) => {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing id_token');
  }
  const clientId = requireClientId();
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload) throw new Error('Empty ID token payload');
  if (!ALLOWED_ISSUERS.has(payload.iss)) {
    throw new Error('Invalid token issuer');
  }
  if (payload.aud !== clientId) {
    throw new Error('Invalid token audience');
  }
  if (!payload.email_verified) {
    throw new Error('Google email is not verified');
  }
  if (!payload.sub || !payload.email) {
    throw new Error('ID token missing sub or email');
  }
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || null,
    picture: payload.picture || null,
    emailVerified: true,
  };
};

const completeLogin = createCompleteLogin({
  exchangeCodeForTokens,
  verifyIdentity,
  extractIdentityInput: (tokens) => {
    if (!tokens.id_token) {
      throw new Error('Google token response missing id_token');
    }
    return { idToken: tokens.id_token };
  },
});

export const google = {
  intent: 'google',
  defaultScopes: ['openid', 'email', 'profile'],
  buildAuthUrl,
  exchangeCodeForTokens,
  verifyIdentity,
  completeLogin,
};

export const __verifyGoogleIdToken = verifyIdentity;