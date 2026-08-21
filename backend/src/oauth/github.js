// GitHub OAuth strategy.
//
// Configure a GitHub OAuth App at https://github.com/settings/applications/new
// with the Authorization callback URL set to `GITHUB_REDIRECT_URI` from the
// backend `.env`. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
//
// GitHub's OAuth flow differs from Google's in two ways:
//   1. No PKCE — the `codeVerifier` argument is accepted for shared contract
//      parity but ignored.
//   2. The token endpoint returns an opaque `access_token`, not an `id_token`.
//      Identity is fetched separately via
//      `GET https://api.github.com/user` (and `GET /user/emails` for the
//      primary verified email when the public profile email is hidden).

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_EMAILS_URL = 'https://api.github.com/user/emails';

const USER_AGENT = 'axonlog';

const requireClientId = () => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) throw new Error('GITHUB_CLIENT_ID is not configured');
  return clientId;
};

const requireClientSecret = () => {
  const secret = process.env.GITHUB_CLIENT_SECRET;
  if (!secret) throw new Error('GITHUB_CLIENT_SECRET is not configured');
  return secret;
};

const requireRedirectUri = () => {
  const uri = process.env.GITHUB_REDIRECT_URI;
  if (!uri) throw new Error('GITHUB_REDIRECT_URI is not configured');
  return uri;
};

const defaultScopesForEnv = () => {
  const raw = process.env.GITHUB_OAUTH_SCOPES || 'read:user user:email';
  return raw
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const buildAuthUrl = ({ state, codeVerifier, redirectUri, scopes }) => {
  const params = new URLSearchParams({
    client_id: requireClientId(),
    redirect_uri: redirectUri || requireRedirectUri(),
    scope: (scopes && scopes.length ? scopes : defaultScopesForEnv()).join(' '),
    state,
    allow_signup: 'true',
  });
  return `${GITHUB_AUTH_URL}?${params.toString()}`;
};

const fetchJson = async (url, init = {}) => {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': USER_AGENT,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`GitHub returned a non-JSON response from ${url}`);
  }
  if (!res.ok) {
    const msg =
      payload?.error_description ||
      payload?.message ||
      payload?.error ||
      `HTTP ${res.status}`;
    throw new Error(`GitHub request failed (${url}): ${msg}`);
  }
  return payload;
};

const exchangeCodeForTokens = async ({ code, redirectUri }) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Missing authorization code');
  }

  const body = new URLSearchParams({
    client_id: requireClientId(),
    client_secret: requireClientSecret(),
    code,
    redirect_uri: redirectUri || requireRedirectUri(),
  });

  const res = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: body.toString(),
  });

  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('GitHub token endpoint returned a non-JSON response');
  }

  if (!res.ok || payload.error) {
    const msg = payload.error_description || payload.error || 'token exchange failed';
    throw new Error(`GitHub token exchange failed: ${msg}`);
  }

  if (!payload.access_token) {
    throw new Error('GitHub token exchange returned no access_token');
  }

  return payload;
};

const fetchUser = async (accessToken) =>
  fetchJson(GITHUB_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

const fetchPrimaryEmail = async (accessToken, fallbackEmail) => {
  try {
    const emails = await fetchJson(GITHUB_EMAILS_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (Array.isArray(emails)) {
      const primary = emails.find((e) => e && e.primary && e.verified && e.email);
      if (primary) return primary.email;
    }
  } catch {
    // /user/emails may 403 if scope not granted — fall through to fallback.
  }
  return fallbackEmail || null;
};

const verifyIdentity = async ({ accessToken }) => {
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('Missing access_token');
  }

  const user = await fetchUser(accessToken);

  if (!user || !user.id) {
    throw new Error('GitHub /user returned no id');
  }

  const email = await fetchPrimaryEmail(
    accessToken,
    typeof user.email === 'string' && user.email.length ? user.email : null,
  );

  return {
    sub: String(user.id),
    email: email || null,
    name: user.name || user.login || null,
    picture: user.avatar_url || null,
    emailVerified: true,
  };
};

export const github = {
  intent: 'github',
  defaultScopes: ['read:user', 'user:email'],
  buildAuthUrl,
  exchangeCodeForTokens,
  verifyIdentity,
  async completeLogin({ code, redirectUri }) {
    const tokens = await exchangeCodeForTokens({ code, redirectUri });
    const identity = await verifyIdentity({ accessToken: tokens.access_token });
    return { identity, tokens };
  },
};

export const __verifyGitHubIdentity = verifyIdentity;