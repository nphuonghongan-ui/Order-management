import crypto from 'node:crypto';

import { clearCookie } from '../config/cookies.js';

const b64urlEncode = (value) =>
  Buffer.from(String(value), 'utf8').toString('base64url');

const b64urlDecode = (segment) => {
  if (typeof segment !== 'string' || segment.length === 0) return null;
  try {
    return Buffer.from(segment, 'base64url').toString('utf8');
  } catch {
    return null;
  }
};

export const encodeFlowCookie = ({ state, provider }) =>
  `${b64urlEncode(state)}.${b64urlEncode(provider)}`;

export const decodeFlowCookie = (raw) => {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  const segments = raw.split('.');
  if (segments.length !== 2) return null;
  const [stateIdB64, providerB64] = segments;
  if (!stateIdB64 || !providerB64) return null;
  const stateId = b64urlDecode(stateIdB64);
  const provider = b64urlDecode(providerB64);
  if (!stateId || !provider) return null;
  return { stateId, provider };
};

export const createOauthFlow = ({ provider }) => {
  if (typeof provider !== 'string' || provider.length === 0) {
    throw new Error('createOauthFlow: provider is required');
  }
  const state = crypto.randomBytes(32).toString('base64url');
  const codeVerifier = crypto.randomBytes(48).toString('base64url');
  return {
    state,
    codeVerifier,
    cookieValue: encodeFlowCookie({ state, provider }),
  };
};

export const clearOauthFlowCookies = (res) => {
  clearCookie(res, 'oauthState');
  clearCookie(res, 'pkceVerifier');
};