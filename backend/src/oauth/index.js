import { google } from './google.js';
import { github } from './github.js';

export const providers = {
  google,
  github,
};

export const getProvider = (intent) => {
  if (!intent || typeof intent !== 'string') return null;
  return providers[intent] || null;
};

export const listProviders = () => Object.keys(providers);
