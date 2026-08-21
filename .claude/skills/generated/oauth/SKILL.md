---
name: oauth
description: "Skill for the Oauth area of Order-management. 19 symbols across 6 files."
---

# Oauth

19 symbols | 6 files | Cohesion: 100%

## When to Use

- Working with code in `frontend/`
- Understanding how resolveProviderConfig, config, href work
- Modifying oauth-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/oauth/google.js` | base64UrlEncode, deriveCodeChallenge, requireClientId, requireRedirectUri, defaultScopesForEnv (+3) |
| `frontend/src/components/oauth/OAuthSignInButton.tsx` | config, buildStartUrl, href, google, github (+1) |
| `frontend/src/lib/oauth/providerEnv.ts` | envClientId, resolveProviderConfig |
| `frontend/src/components/oauth/icons/GoogleMark.tsx` | GoogleMark |
| `frontend/src/components/oauth/icons/GitHubMark.tsx` | GitHubMark |
| `frontend/src/components/oauth/icons/DiscordMark.tsx` | DiscordMark |

## Entry Points

Start here when exploring this area:

- **`resolveProviderConfig`** (Function) — `frontend/src/lib/oauth/providerEnv.ts:60`
- **`config`** (Function) — `frontend/src/components/oauth/OAuthSignInButton.tsx:30`
- **`href`** (Function) — `frontend/src/components/oauth/OAuthSignInButton.tsx:31`
- **`GoogleMark`** (Function) — `frontend/src/components/oauth/icons/GoogleMark.tsx:2`
- **`GitHubMark`** (Function) — `frontend/src/components/oauth/icons/GitHubMark.tsx:2`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `resolveProviderConfig` | Function | `frontend/src/lib/oauth/providerEnv.ts` | 60 |
| `config` | Function | `frontend/src/components/oauth/OAuthSignInButton.tsx` | 30 |
| `href` | Function | `frontend/src/components/oauth/OAuthSignInButton.tsx` | 31 |
| `GoogleMark` | Function | `frontend/src/components/oauth/icons/GoogleMark.tsx` | 2 |
| `GitHubMark` | Function | `frontend/src/components/oauth/icons/GitHubMark.tsx` | 2 |
| `DiscordMark` | Function | `frontend/src/components/oauth/icons/DiscordMark.tsx` | 2 |
| `base64UrlEncode` | Function | `backend/src/oauth/google.js` | 11 |
| `deriveCodeChallenge` | Function | `backend/src/oauth/google.js` | 14 |
| `requireClientId` | Function | `backend/src/oauth/google.js` | 17 |
| `requireRedirectUri` | Function | `backend/src/oauth/google.js` | 23 |
| `defaultScopesForEnv` | Function | `backend/src/oauth/google.js` | 29 |
| `buildAuthUrl` | Function | `backend/src/oauth/google.js` | 37 |
| `exchangeCodeForTokens` | Function | `backend/src/oauth/google.js` | 53 |
| `verifyIdentity` | Function | `backend/src/oauth/google.js` | 86 |
| `envClientId` | Function | `frontend/src/lib/oauth/providerEnv.ts` | 27 |
| `buildStartUrl` | Function | `frontend/src/components/oauth/OAuthSignInButton.tsx` | 6 |
| `google` | Function | `frontend/src/components/oauth/OAuthSignInButton.tsx` | 19 |
| `github` | Function | `frontend/src/components/oauth/OAuthSignInButton.tsx` | 20 |
| `discord` | Function | `frontend/src/components/oauth/OAuthSignInButton.tsx` | 21 |

## How to Explore

1. `context({name: "resolveProviderConfig"})` — see callers and callees
2. `query({search_query: "oauth"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
