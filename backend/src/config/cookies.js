const DEFAULT_TTL_SECONDS = 600;

const sameSite = (process.env.COOKIE_SAMESITE || 'strict').toLowerCase();

const ttlSeconds = () => {
  const raw = Number(process.env.GOOGLE_OAUTH_STATE_TTL_SECONDS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TTL_SECONDS;
};

// RULES.md §15.1: every cookie name follows __Host-<function>-<name>
const hostCookieName = (fn, name) => `__Host-${fn}-${name}`;

const baseCookieOptions = (overrides = {}) => ({
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  ...overrides,
});

const REFRESH_COOKIE_NAME = hostCookieName('auth', 'refresh');
const STATE_COOKIE_NAME = hostCookieName('oauth', 'state');
const PKCE_COOKIE_NAME = hostCookieName('oauth', 'pkce-verifier');

const oauthStateCookieOptions = baseCookieOptions({
  maxAge: ttlSeconds() * 1000,
});
const pkceVerifierCookieOptions = baseCookieOptions({
  maxAge: ttlSeconds() * 1000,
});
const refreshCookieOptions = baseCookieOptions({
  sameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const COOKIES = {
  refresh: { name: REFRESH_COOKIE_NAME, options: refreshCookieOptions },
  oauthState: { name: STATE_COOKIE_NAME, options: oauthStateCookieOptions },
  pkceVerifier: {
    name: PKCE_COOKIE_NAME,
    options: pkceVerifierCookieOptions,
  },
};

export const setCookie = (res, key, value) => {
  const cookie = COOKIES[key];
  res.cookie(cookie.name, value, cookie.options);
};

export const clearCookie = (res, key) => {
  const cookie = COOKIES[key];
  res.clearCookie(cookie.name, cookie.options);
};

export const getCookie = (req, key) => req.cookies?.[COOKIES[key].name];
