const secure = process.env.COOKIE_SECURE === 'true';
const sameSite = (process.env.COOKIE_SAMESITE || 'strict').toLowerCase();

if (sameSite === 'none' && !secure) {
  console.warn(
    '[WARN] COOKIE_SAMESITE=none requires COOKIE_SECURE=true. Browsers will reject the cookie.'
  );
}

export const refreshCookieOptions = {
  httpOnly: true,
  sameSite,
  secure,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};