import { OAuth2Client } from 'google-auth-library';

const ALLOWED_ISSUERS = new Set([
  'accounts.google.com',
  'https://accounts.google.com',
]);

const getClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }
  return new OAuth2Client(clientId);
};

export const verifyGoogleIdToken = async (credential) => {
  if (!credential || typeof credential !== 'string') {
    throw new Error('Missing ID token');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const client = getClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Empty ID token payload');
  }

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
