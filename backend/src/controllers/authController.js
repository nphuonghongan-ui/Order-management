import Account from '../models/Account.js';
import RefreshToken from '../models/RefreshToken.js';
import { refreshCookieOptions } from '../config/cookies.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  newId,
  refreshExpiresAt,
} from '../utils/tokens.js';

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refresh_token', refreshToken, refreshCookieOptions);
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refresh_token', refreshCookieOptions);
};

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

  setRefreshCookie(res, refreshToken);
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
  const presented = req.cookies?.refresh_token;

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

  setRefreshCookie(res, refreshToken);
  return res.status(200).json({ accessToken });
};

export const me = (req, res) => {
  return res.status(200).json({ account: req.user });
};

export const logout = async (req, res) => {
  const presented = req.cookies?.refresh_token;
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
  clearRefreshCookie(res);
  return res.status(204).send();
};