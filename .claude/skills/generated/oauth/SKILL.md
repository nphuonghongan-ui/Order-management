---
name: oauth
description: "Skill for the Oauth area of Order-management. 11 symbols across 3 files."
---

# Oauth

11 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how resolveProviderConfig, config work
- Modifying oauth-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/oauth/google.js` | base64UrlEncode, deriveCodeChallenge, requireClientId, requireRedirectUri, defaultScopesForEnv (+3) |
| `frontend/src/lib/oauth/providerEnv.ts` | envClientId, resolveProviderConfig |
| `frontend/src/components/google/GoogleSignInButton.tsx` | config |

## Entry Points

Start here when exploring this area:

- **`resolveProviderConfig`** (Function) — `frontend/src/lib/oauth/providerEnv.ts:19`
- **`config`** (Function) — `frontend/src/components/google/GoogleSignInButton.tsx:23`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `resolveProviderConfig` | Function | `frontend/src/lib/oauth/providerEnv.ts` | 19 |
| `config` | Function | `frontend/src/components/google/GoogleSignInButton.tsx` | 23 |
| `base64UrlEncode` | Function | `backend/src/oauth/google.js` | 11 |
| `deriveCodeChallenge` | Function | `backend/src/oauth/google.js` | 14 |
| `requireClientId` | Function | `backend/src/oauth/google.js` | 17 |
| `requireRedirectUri` | Function | `backend/src/oauth/google.js` | 23 |
| `defaultScopesForEnv` | Function | `backend/src/oauth/google.js` | 29 |
| `buildAuthUrl` | Function | `backend/src/oauth/google.js` | 37 |
| `exchangeCodeForTokens` | Function | `backend/src/oauth/google.js` | 53 |
| `verifyIdentity` | Function | `backend/src/oauth/google.js` | 86 |
| `envClientId` | Function | `frontend/src/lib/oauth/providerEnv.ts` | 16 |

## How to Explore

1. `context({name: "resolveProviderConfig"})` — see callers and callees
2. `query({search_query: "oauth"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
