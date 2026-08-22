// Shared OAuth helpers and factories used by every provider strategy.
//
// Each provider supplies its own `verifyIdentity` (since the source of truth
// differs — GitHub hits /user, Google validates a JWT id_token), but the
// surrounding plumbing — env requirement, PKCE derivation, auth URL building,
// token exchange, and the completeLogin orchestration — is identical.
//
// Provider files should import the `create*` factories below and pass in
// provider-specific config rather than re-implementing these primitives.

import crypto from 'node:crypto';

const base64UrlEncode = (buffer) =>
  Buffer.from(buffer).toString('base64url');

const deriveCodeChallenge = (verifier) =>
  base64UrlEncode(crypto.createHash('sha256').update(verifier).digest());

const createEnvRequirement = (envKey) => () => {
  const value = process.env[envKey];
  if (!value) throw new Error(`${envKey} is not configured`);
  return value;
};

const createDefaultScopesReader = (providerKey, fallbackScopes) => () => {
  const envKey = `${providerKey.toUpperCase()}_OAUTH_SCOPES`;
  const raw = process.env[envKey];
  if (!raw) return [...fallbackScopes];
  return raw
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const createBuildAuthUrl = ({
  authUrl,
  requireClientId,
  requireRedirectUri,
  defaultScopesForEnv,
  extraParams = {},
  requirePkce = true,
}) => ({ state, codeVerifier, redirectUri, scopes }) => {
  const params = new URLSearchParams({
    client_id: requireClientId(),
    redirect_uri: redirectUri || requireRedirectUri(),
    scope: (scopes && scopes.length ? scopes : defaultScopesForEnv()).join(' '),
    state,
    ...extraParams,
  });
  if (requirePkce) {
    params.set('code_challenge', deriveCodeChallenge(codeVerifier));
    params.set('code_challenge_method', 'S256');
  }
  return `${authUrl}?${params.toString()}`;
};

const fetchJson = async (url, { init = {}, defaultHeaders = {}, providerName = 'Provider', errorFrom } = {}) => {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${providerName} returned a non-JSON response from ${url}`);
  }
  if (!res.ok) {
    const msg = errorFrom ? errorFrom(payload) : defaultErrorFrom(payload, res.status);
    throw new Error(`${providerName} request failed (${url}): ${msg}`);
  }
  return payload;
};

const defaultErrorFrom = (payload, status) =>
  payload?.error_description || payload?.error || `HTTP ${status}`;

const createExchangeCodeForTokens = ({
  tokenUrl,
  providerName,
  requireClientId,
  requireClientSecret,
  requireRedirectUri,
  requirePkce = true,
  extraBody = () => ({}),
  validateResponse,
  userAgent,
}) => async ({ code, codeVerifier, redirectUri }) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Missing authorization code');
  }

  const body = new URLSearchParams({
    client_id: requireClientId(),
    client_secret: requireClientSecret(),
    code,
    redirect_uri: redirectUri || requireRedirectUri(),
    ...extraBody({ code, codeVerifier, redirectUri }),
  });

  if (requirePkce) {
    body.set('code_verifier', codeVerifier);
  }

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };
  if (userAgent) headers['User-Agent'] = userAgent;

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers,
    body: body.toString(),
  });

  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`${providerName} token endpoint returned a non-JSON response`);
  }

  if (!res.ok || payload.error) {
    const msg = payload.error_description || payload.error || 'token exchange failed';
    throw new Error(`${providerName} token exchange failed: ${msg}`);
  }

  if (typeof validateResponse === 'function') {
    validateResponse(payload);
  }

  return payload;
};

const createCompleteLogin = ({
  exchangeCodeForTokens,
  verifyIdentity,
  extractIdentityInput,
}) => async (params) => {
  const tokens = await exchangeCodeForTokens(params);
  const identity = await verifyIdentity(extractIdentityInput(tokens));
  return { identity, tokens };
};

export {
  createEnvRequirement,
  createDefaultScopesReader,
  createBuildAuthUrl,
  createExchangeCodeForTokens,
  createCompleteLogin,
  fetchJson,
};