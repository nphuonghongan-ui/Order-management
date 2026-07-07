import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

if (!process.env.JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET is not set. Access tokens will fail.');
}
if (!process.env.JWT_REFRESH_SECRET) {
  console.warn(
    '[WARN] JWT_REFRESH_SECRET is not set. Falling back to JWT_SECRET for refresh tokens (not recommended).'
  );
}

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const newId = () => crypto.randomUUID();

export const signAccessToken = (account) =>
  jwt.sign(
    {
      userName: account.userName,
      role: account.role,
      customerCustId: account.customerCustId,
      typ: 'access',
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );

export const signRefreshToken = ({ userId, jti, familyId }) =>
  jwt.sign(
    {
      sub: String(userId),
      jti,
      familyId,
      typ: 'refresh',
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );

export const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, REFRESH_SECRET);
  if (payload.typ !== 'refresh') {
    throw new Error('Not a refresh token');
  }
  return payload;
};

export const refreshExpiresAt = () => {
  const ms = msFromExpiry(REFRESH_EXPIRES_IN);
  return new Date(Date.now() + ms);
};

function msFromExpiry(exp) {
  const match = /^(\d+)\s*([smhd])$/.exec(String(exp));
  if (!match) return 60 * 60 * 1000;
  const num = Number(match[1]);
  const unit = match[2];
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return num * mult;
}