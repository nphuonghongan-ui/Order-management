// Strategy-stub for future GitHub OAuth integration.
//
// To enable:
//   1. Configure a GitHub OAuth App at https://github.com/settings/applications
//      with `Authorization callback URL` matching the value of
//      `GITHUB_REDIRECT_URI` in the backend `.env`.
//   2. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`.
//   3. Implement `buildAuthUrl`, `exchangeCodeForTokens`, and `verifyIdentity`
//      following the contract used in `./google.js`. Note GitHub OAuth uses a
//      `code` without PKCE, and identity is fetched separately via
//      `GET https://api.github.com/user` (and `GET /user/emails` for the
//      primary email).
//   4. Register `github` in `./index.js`'s `providers` map.

export const github = {
  intent: 'github',
  defaultScopes: ['read:user', 'user:email'],
  buildAuthUrl: () => {
    throw new Error('GitHub OAuth is not yet implemented');
  },
  exchangeCodeForTokens: async () => {
    throw new Error('GitHub OAuth is not yet implemented');
  },
  verifyIdentity: async () => {
    throw new Error('GitHub OAuth is not yet implemented');
  },
};
