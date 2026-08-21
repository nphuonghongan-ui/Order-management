---
name: controllers
description: "Skill for the Controllers area of Order-management. 77 symbols across 12 files."
---

# Controllers

77 symbols | 12 files | Cohesion: 91%

## When to Use

- Working with code in `backend/`
- Understanding how listPackingLists, getPackingList, createPackingList work
- Modifying controllers-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/controllers/packingListController.js` | toStr, toUpper, toPositiveInt, toNonNegNumber, toDate (+11) |
| `backend/src/controllers/partNumController.js` | toPositiveInt, toNonNegNumber, toUpperTrimmed, validatePartNumInput, sanitizePayload (+6) |
| `backend/src/controllers/authController.js` | upsertGoogleAccount, issueGoogleSession, oauthCallback, redirectError, googleOnetapLogin (+5) |
| `backend/src/utils/tokens.js` | hashToken, newId, signAccessToken, refreshExpiresAt, msFromExpiry (+2) |
| `backend/src/controllers/poController.js` | toPositiveInt, toNonNegNumber, toDate, upper, validateLine (+2) |
| `backend/src/controllers/notificationController.js` | sendUrgeUpdate, sanitizeRiskLines, notifyManufactureQtyMismatch, encodeCursor, decodeCursor (+1) |
| `backend/src/controllers/lineItemController.js` | encodeCursor, decodeCursor, escapeRegex, listLineItems, toOptionalDate (+1) |
| `backend/src/controllers/manufactureController.js` | encodeCursor, decodeCursor, escapeRegex, listManufactureItems, toOptionalDate (+1) |
| `backend/src/lib/oauthState.js` | b64urlDecode, decodeFlowCookie, clearOauthFlowCookies |
| `backend/src/config/cookies.js` | clearCookie, getCookie |

## Entry Points

Start here when exploring this area:

- **`listPackingLists`** (Function) — `backend/src/controllers/packingListController.js:108`
- **`getPackingList`** (Function) — `backend/src/controllers/packingListController.js:127`
- **`createPackingList`** (Function) — `backend/src/controllers/packingListController.js:143`
- **`updatePackingList`** (Function) — `backend/src/controllers/packingListController.js:375`
- **`clearCookie`** (Function) — `backend/src/config/cookies.js:49`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `listPackingLists` | Function | `backend/src/controllers/packingListController.js` | 108 |
| `getPackingList` | Function | `backend/src/controllers/packingListController.js` | 127 |
| `createPackingList` | Function | `backend/src/controllers/packingListController.js` | 143 |
| `updatePackingList` | Function | `backend/src/controllers/packingListController.js` | 375 |
| `clearCookie` | Function | `backend/src/config/cookies.js` | 49 |
| `oauthCallback` | Function | `backend/src/controllers/authController.js` | 261 |
| `redirectError` | Function | `backend/src/controllers/authController.js` | 266 |
| `googleOnetapLogin` | Function | `backend/src/controllers/authController.js` | 362 |
| `decodeFlowCookie` | Function | `backend/src/lib/oauthState.js` | 19 |
| `clearOauthFlowCookies` | Function | `backend/src/lib/oauthState.js` | 44 |
| `withRetry` | Function | `backend/src/utils/retry.js` | 0 |
| `login` | Function | `backend/src/controllers/authController.js` | 54 |
| `hashToken` | Function | `backend/src/utils/tokens.js` | 17 |
| `newId` | Function | `backend/src/utils/tokens.js` | 20 |
| `signAccessToken` | Function | `backend/src/utils/tokens.js` | 22 |
| `refreshExpiresAt` | Function | `backend/src/utils/tokens.js` | 55 |
| `createPartNum` | Function | `backend/src/controllers/partNumController.js` | 126 |
| `importPartNums` | Function | `backend/src/controllers/partNumController.js` | 169 |
| `createPO` | Function | `backend/src/controllers/poController.js` | 49 |
| `pairKey` | Function | `backend/src/controllers/poController.js` | 94 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `GoogleOnetapLogin → NewId` | cross_community | 4 |
| `GoogleOnetapLogin → SignAccessToken` | cross_community | 4 |
| `GoogleOnetapLogin → SignRefreshToken` | cross_community | 4 |
| `GoogleOnetapLogin → HashToken` | cross_community | 4 |
| `CreatePackingList → ToStr` | intra_community | 3 |
| `CreatePackingList → ToDate` | intra_community | 3 |
| `UpdatePackingList → ToStr` | intra_community | 3 |
| `UpdatePackingList → ToDate` | intra_community | 3 |
| `OauthCallback → ClearCookie` | intra_community | 3 |
| `OauthCallback → B64urlDecode` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Config | 3 calls |

## How to Explore

1. `context({name: "listPackingLists"})` — see callers and callees
2. `query({search_query: "controllers"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
