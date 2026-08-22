// GitHub OAuth strategy.

import {
  createBuildAuthUrl,
  createCompleteLogin,
  createDefaultScopesReader,
  createEnvRequirement,
  createExchangeCodeForTokens,
  fetchJson,
} from './base.js';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_EMAILS_URL = 'https://api.github.com/user/emails';

const USER_AGENT = 'axonlog';

const requireClientId = createEnvRequirement('GITHUB_CLIENT_ID');
const requireClientSecret = createEnvRequirement('GITHUB_CLIENT_SECRET');
const requireRedirectUri = createEnvRequirement('GITHUB_REDIRECT_URI');

const defaultScopesForEnv = createDefaultScopesReader('github', [
  'read:user',
  'user:email',
]);

const buildAuthUrl = createBuildAuthUrl({
  authUrl: GITHUB_AUTH_URL,
  requireClientId,
  requireRedirectUri,
  defaultScopesForEnv,
  extraParams: { allow_signup: 'true' },
  requirePkce: true,
});

const exchangeCodeForTokens = createExchangeCodeForTokens({
  tokenUrl: GITHUB_TOKEN_URL,
  providerName: 'GitHub',
  requireClientId,
  requireClientSecret,
  requireRedirectUri,
  requirePkce: true,
  userAgent: USER_AGENT,
  validateResponse: (payload) => {
    if (!payload.access_token) {
      throw new Error('GitHub token exchange returned no access_token');
    }
  },
});

const githubFetchJson = (url, init) =>
  fetchJson(url, {
    init,
    providerName: 'GitHub',
    defaultHeaders: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': USER_AGENT,
    },
    errorFrom: (payload) =>
      payload?.error_description || payload?.message || payload?.error,
  });

const fetchUser = async (accessToken) =>
  githubFetchJson(GITHUB_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

const fetchPrimaryEmail = async (accessToken, fallbackEmail) => {
  try {
    const emails = await githubFetchJson(GITHUB_EMAILS_URL, {
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

const completeLogin = createCompleteLogin({
  exchangeCodeForTokens,
  verifyIdentity,
  extractIdentityInput: (tokens) => ({ accessToken: tokens.access_token }),
});

export const github = {
  intent: 'github',
  defaultScopes: ['read:user', 'user:email'],
  buildAuthUrl,
  exchangeCodeForTokens,
  verifyIdentity,
  completeLogin,
};

export const __verifyGitHubIdentity = verifyIdentity;