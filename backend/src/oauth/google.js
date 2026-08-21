import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';

const ALLOWED_ISSUERS = new Set([
  'accounts.google.com',
  'https://accounts.google.com',
]);

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

const base64UrlEncode = (buffer) =>
  Buffer.from(buffer).toString('base64url');

const deriveCodeChallenge = (verifier) =>
  base64UrlEncode(crypto.createHash('sha256').update(verifier).digest());

const requireClientId = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not configured');
  return clientId;
};

const requireRedirectUri = () => {
  const uri = process.env.GOOGLE_REDIRECT_URI;
  if (!uri) throw new Error('GOOGLE_REDIRECT_URI is not configured');
  return uri;
};

const defaultScopesForEnv = () => {
  const raw = process.env.GOOGLE_OAUTH_SCOPES || 'openid email profile';
  return raw
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const buildAuthUrl = ({ state, codeVerifier, scopes, redirectUri }) => {
  const params = new URLSearchParams({
    client_id: requireClientId(),
    redirect_uri: redirectUri || requireRedirectUri(),
    response_type: 'code',
    scope: (scopes && scopes.length ? scopes : defaultScopesForEnv()).join(' '),
    access_type: 'online',
    include_granted_scopes: 'true',
    state,
    code_challenge: deriveCodeChallenge(codeVerifier),
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

const exchangeCodeForTokens = async ({ code, codeVerifier, redirectUri }) => {
  const clientId = requireClientId();
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: redirectUri || requireRedirectUri(),
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error('Google token endpoint returned a non-JSON response');
  }

  if (!res.ok) {
    const msg = payload?.error_description || payload?.error || 'token exchange failed';
    throw new Error(`Google token exchange failed: ${msg}`);
  }

  return payload;
};

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
  };
};

export const google = {
  intent: 'google',
  defaultScopes: ['openid', 'email', 'profile'],
  buildAuthUrl,
  exchangeCodeForTokens,
  verifyIdentity,
  async completeLogin({ code, codeVerifier, redirectUri }) {
    const tokens = await exchangeCodeForTokens({ code, codeVerifier, redirectUri });
    if (!tokens.id_token) {
      throw new Error('Google token response missing id_token');
    }
    const identity = await verifyIdentity({ idToken: tokens.id_token });
    return { identity, tokens };
  },
};

export const __verifyGoogleIdToken = verifyIdentity;
