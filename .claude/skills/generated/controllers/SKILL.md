---
name: controllers
description: "Skill for the Controllers area of Order-management. 56 symbols across 8 files."
---

# Controllers

56 symbols | 8 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how listPackingLists, getPackingList, createPackingList work
- Modifying controllers-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/controllers/packingListController.js` | toStr, toUpper, toPositiveInt, toNonNegNumber, toDate (+10) |
| `backend/src/controllers/authController.js` | setRefreshCookie, clearRefreshCookie123, issueSession, revokeFamily, login (+2) |
| `backend/src/utils/tokens.js` | hashToken, newId, signAccessToken, signRefreshToken, verifyRefreshToken (+2) |
| `backend/src/controllers/poController.js` | toPositiveInt, toNonNegNumber, toDate, upper, validateLine (+2) |
| `backend/src/controllers/notificationController.js` | sendUrgeUpdate, sanitizeRiskLines, notifyManufactureQtyMismatch, encodeCursor, decodeCursor (+1) |
| `backend/src/controllers/lineItemController.js` | encodeCursor, decodeCursor, escapeRegex, listLineItems, toOptionalDate (+1) |
| `backend/src/controllers/manufactureController.js` | encodeCursor, decodeCursor, escapeRegex, listManufactureItems, toOptionalDate (+1) |
| `backend/src/lib/socket.js` | getIO, roomFor |

## Entry Points

Start here when exploring this area:

- **`listPackingLists`** (Function) — `backend/src/controllers/packingListController.js:92`
- **`getPackingList`** (Function) — `backend/src/controllers/packingListController.js:103`
- **`createPackingList`** (Function) — `backend/src/controllers/packingListController.js:113`
- **`updatePackingList`** (Function) — `backend/src/controllers/packingListController.js:339`
- **`login`** (Function) — `backend/src/controllers/authController.js:49`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `listPackingLists` | Function | `backend/src/controllers/packingListController.js` | 92 |
| `getPackingList` | Function | `backend/src/controllers/packingListController.js` | 103 |
| `createPackingList` | Function | `backend/src/controllers/packingListController.js` | 113 |
| `updatePackingList` | Function | `backend/src/controllers/packingListController.js` | 339 |
| `login` | Function | `backend/src/controllers/authController.js` | 49 |
| `refresh` | Function | `backend/src/controllers/authController.js` | 69 |
| `logout` | Function | `backend/src/controllers/authController.js` | 141 |
| `hashToken` | Function | `backend/src/utils/tokens.js` | 17 |
| `newId` | Function | `backend/src/utils/tokens.js` | 20 |
| `signAccessToken` | Function | `backend/src/utils/tokens.js` | 22 |
| `signRefreshToken` | Function | `backend/src/utils/tokens.js` | 34 |
| `verifyRefreshToken` | Function | `backend/src/utils/tokens.js` | 46 |
| `refreshExpiresAt` | Function | `backend/src/utils/tokens.js` | 54 |
| `createPO` | Function | `backend/src/controllers/poController.js` | 49 |
| `pairKey` | Function | `backend/src/controllers/poController.js` | 94 |
| `sendUrgeUpdate` | Function | `backend/src/controllers/notificationController.js` | 61 |
| `notifyManufactureQtyMismatch` | Function | `backend/src/controllers/notificationController.js` | 195 |
| `getIO` | Function | `backend/src/lib/socket.js` | 43 |
| `roomFor` | Function | `backend/src/lib/socket.js` | 45 |
| `listLineItems` | Function | `backend/src/controllers/lineItemController.js` | 32 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreatePackingList → ToStr` | intra_community | 3 |
| `CreatePackingList → ToDate` | intra_community | 3 |
| `UpdatePackingList → ToStr` | intra_community | 3 |
| `UpdatePackingList → ToDate` | intra_community | 3 |
| `Login → NewId` | intra_community | 3 |
| `Login → SignAccessToken` | intra_community | 3 |

## How to Explore

1. `context({name: "listPackingLists"})` — see callers and callees
2. `query({search_query: "controllers"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
