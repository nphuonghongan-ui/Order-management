---
name: config
description: "Skill for the Config area of Order-management. 11 symbols across 7 files."
---

# Config

11 symbols | 7 files | Cohesion: 87%

## When to Use

- Working with code in `backend/`
- Understanding how setCookie, oauthStart, encodeFlowCookie work
- Modifying config-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/lib/oauthState.js` | b64urlEncode, encodeFlowCookie, createOauthFlow |
| `backend/src/config/db.js` | switchingDns, connectDB |
| `backend/src/config/seed.js` | runSeedIfNeeded, autoSeed |
| `backend/src/config/cookies.js` | setCookie |
| `backend/src/controllers/authController.js` | oauthStart |
| `backend/src/oauth/index.js` | getProvider |
| `backend/src/seeds/accounts.seed.js` | main |

## Entry Points

Start here when exploring this area:

- **`setCookie`** (Function) — `backend/src/config/cookies.js:44`
- **`oauthStart`** (Function) — `backend/src/controllers/authController.js:231`
- **`encodeFlowCookie`** (Function) — `backend/src/lib/oauthState.js:16`
- **`createOauthFlow`** (Function) — `backend/src/lib/oauthState.js:31`
- **`getProvider`** (Function) — `backend/src/oauth/index.js:8`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `setCookie` | Function | `backend/src/config/cookies.js` | 44 |
| `oauthStart` | Function | `backend/src/controllers/authController.js` | 231 |
| `encodeFlowCookie` | Function | `backend/src/lib/oauthState.js` | 16 |
| `createOauthFlow` | Function | `backend/src/lib/oauthState.js` | 31 |
| `getProvider` | Function | `backend/src/oauth/index.js` | 8 |
| `connectDB` | Function | `backend/src/config/db.js` | 10 |
| `autoSeed` | Function | `backend/src/config/seed.js` | 112 |
| `b64urlEncode` | Function | `backend/src/lib/oauthState.js` | 4 |
| `switchingDns` | Function | `backend/src/config/db.js` | 6 |
| `main` | Function | `backend/src/seeds/accounts.seed.js` | 12 |
| `runSeedIfNeeded` | Function | `backend/src/config/seed.js` | 57 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `OauthStart → B64urlEncode` | intra_community | 4 |

## How to Explore

1. `context({name: "setCookie"})` — see callers and callees
2. `query({search_query: "config"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
