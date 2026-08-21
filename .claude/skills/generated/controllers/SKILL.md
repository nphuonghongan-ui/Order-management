---
name: controllers
description: "Skill for the Controllers area of Order-management. 85 symbols across 12 files."
---

# Controllers

85 symbols | 12 files | Cohesion: 98%

## When to Use

- Working with code in `backend/`
- Understanding how listPackingLists, getPackingList, createPackingList work
- Modifying controllers-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/controllers/packingListController.js` | toStr, toUpper, toPositiveInt, toNonNegNumber, toDate (+11) |
| `backend/src/controllers/authController.js` | setRefreshCookie, clearRefreshCookie, issueSession, revokeFamily, login (+9) |
| `backend/src/controllers/partNumController.js` | toPositiveInt, toNonNegNumber, toUpperTrimmed, validatePartNumInput, sanitizePayload (+6) |
| `backend/src/lib/oauthState.js` | b64urlDecode, decodeFlowCookie, clearOauthStateCookie, clearPkceVerifierCookie, clearOauthFlowCookies (+3) |
| `backend/src/utils/tokens.js` | hashToken, newId, signAccessToken, signRefreshToken, verifyRefreshToken (+2) |
| `backend/src/controllers/poController.js` | toPositiveInt, toNonNegNumber, toDate, upper, validateLine (+2) |
| `backend/src/controllers/notificationController.js` | sendUrgeUpdate, sanitizeRiskLines, notifyManufactureQtyMismatch, encodeCursor, decodeCursor (+1) |
| `backend/src/controllers/lineItemController.js` | encodeCursor, decodeCursor, escapeRegex, listLineItems, toOptionalDate (+1) |
| `backend/src/controllers/manufactureController.js` | encodeCursor, decodeCursor, escapeRegex, listManufactureItems, toOptionalDate (+1) |
| `backend/src/lib/socket.js` | getIO, roomFor |

## Entry Points

Start here when exploring this area:

- **`listPackingLists`** (Function) — `backend/src/controllers/packingListController.js:108`
- **`getPackingList`** (Function) — `backend/src/controllers/packingListController.js:127`
- **`createPackingList`** (Function) — `backend/src/controllers/packingListController.js:143`
- **`updatePackingList`** (Function) — `backend/src/controllers/packingListController.js:375`
- **`login`** (Function) — `backend/src/controllers/authController.js:70`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `listPackingLists` | Function | `backend/src/controllers/packingListController.js` | 108 |
| `getPackingList` | Function | `backend/src/controllers/packingListController.js` | 127 |
| `createPackingList` | Function | `backend/src/controllers/packingListController.js` | 143 |
| `updatePackingList` | Function | `backend/src/controllers/packingListController.js` | 375 |
| `login` | Function | `backend/src/controllers/authController.js` | 70 |
| `refresh` | Function | `backend/src/controllers/authController.js` | 90 |
| `logout` | Function | `backend/src/controllers/authController.js` | 162 |
| `hashToken` | Function | `backend/src/utils/tokens.js` | 17 |
| `newId` | Function | `backend/src/utils/tokens.js` | 20 |
| `signAccessToken` | Function | `backend/src/utils/tokens.js` | 22 |
| `signRefreshToken` | Function | `backend/src/utils/tokens.js` | 35 |
| `verifyRefreshToken` | Function | `backend/src/utils/tokens.js` | 47 |
| `refreshExpiresAt` | Function | `backend/src/utils/tokens.js` | 55 |
| `oauthCallback` | Function | `backend/src/controllers/authController.js` | 276 |
| `redirectError` | Function | `backend/src/controllers/authController.js` | 281 |
| `googleOnetapLogin` | Function | `backend/src/controllers/authController.js` | 377 |
| `decodeFlowCookie` | Function | `backend/src/lib/oauthState.js` | 38 |
| `clearOauthStateCookie` | Function | `backend/src/lib/oauthState.js` | 63 |
| `clearPkceVerifierCookie` | Function | `backend/src/lib/oauthState.js` | 67 |
| `clearOauthFlowCookies` | Function | `backend/src/lib/oauthState.js` | 71 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `OauthStart → B64urlEncode` | intra_community | 4 |
| `GoogleOnetapLogin → NewId` | cross_community | 4 |
| `GoogleOnetapLogin → SignAccessToken` | cross_community | 4 |
| `GoogleOnetapLogin → SignRefreshToken` | cross_community | 4 |
| `GoogleOnetapLogin → HashToken` | cross_community | 4 |
| `CreatePackingList → ToStr` | intra_community | 3 |
| `CreatePackingList → ToDate` | intra_community | 3 |
| `UpdatePackingList → ToStr` | intra_community | 3 |
| `UpdatePackingList → ToDate` | intra_community | 3 |
| `OauthCallback → ClearOauthStateCookie` | intra_community | 3 |

## How to Explore

1. `context({name: "listPackingLists"})` — see callers and callees
2. `query({search_query: "controllers"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
