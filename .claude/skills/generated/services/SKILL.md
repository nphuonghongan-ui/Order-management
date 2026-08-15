---
name: services
description: "Skill for the Services area of Order-management. 31 symbols across 6 files."
---

# Services

31 symbols | 6 files | Cohesion: 92%

## When to Use

- Working with code in `backend/`
- Understanding how optimizePackingList, makeExtremePoint, emitPointsFor work
- Modifying services-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/services/clpOptimizer.js` | toMmBox, expandToIndividualBoxes, groupByPartNum, totalVolumeOfGroup, optimize (+8) |
| `backend/src/lib/clp/geometry.js` | volumeOf, aabbOverlap, inBounds, fitsAt, fullySupported (+1) |
| `backend/src/services/easycargoService.js` | readCredentials, authenticate, easycargoFetch, buildItems, getShipment (+1) |
| `backend/src/lib/clp/extremePoints.js` | makeExtremePoint, emitPointsFor, pruneDominated, addPoints |
| `backend/src/controllers/clpController.js` | optimizePackingList |
| `backend/src/controllers/easycargoController.js` | createShipment |

## Entry Points

Start here when exploring this area:

- **`optimizePackingList`** (Function) — `backend/src/controllers/clpController.js:10`
- **`makeExtremePoint`** (Function) — `backend/src/lib/clp/extremePoints.js:0`
- **`emitPointsFor`** (Function) — `backend/src/lib/clp/extremePoints.js:4`
- **`pruneDominated`** (Function) — `backend/src/lib/clp/extremePoints.js:33`
- **`addPoints`** (Function) — `backend/src/lib/clp/extremePoints.js:56`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `optimizePackingList` | Function | `backend/src/controllers/clpController.js` | 10 |
| `makeExtremePoint` | Function | `backend/src/lib/clp/extremePoints.js` | 0 |
| `emitPointsFor` | Function | `backend/src/lib/clp/extremePoints.js` | 4 |
| `pruneDominated` | Function | `backend/src/lib/clp/extremePoints.js` | 33 |
| `addPoints` | Function | `backend/src/lib/clp/extremePoints.js` | 56 |
| `volumeOf` | Function | `backend/src/lib/clp/geometry.js` | 66 |
| `optimize` | Function | `backend/src/services/clpOptimizer.js` | 232 |
| `buildItemsFromPackingList` | Function | `backend/src/services/clpOptimizer.js` | 302 |
| `aabbOverlap` | Function | `backend/src/lib/clp/geometry.js` | 2 |
| `inBounds` | Function | `backend/src/lib/clp/geometry.js` | 13 |
| `fitsAt` | Function | `backend/src/lib/clp/geometry.js` | 24 |
| `fullySupported` | Function | `backend/src/lib/clp/geometry.js` | 33 |
| `getOrientations` | Function | `backend/src/lib/clp/geometry.js` | 54 |
| `createShipment` | Function | `backend/src/controllers/easycargoController.js` | 18 |
| `getShipment` | Function | `backend/src/services/easycargoService.js` | 147 |
| `createShipmentFromPackingList` | Function | `backend/src/services/easycargoService.js` | 156 |
| `toMmBox` | Function | `backend/src/services/clpOptimizer.js` | 5 |
| `expandToIndividualBoxes` | Function | `backend/src/services/clpOptimizer.js` | 16 |
| `groupByPartNum` | Function | `backend/src/services/clpOptimizer.js` | 34 |
| `totalVolumeOfGroup` | Function | `backend/src/services/clpOptimizer.js` | 43 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateShipment → ReadCredentials` | intra_community | 6 |
| `OptimizePackingList → ToMmBox` | intra_community | 4 |
| `OptimizePackingList → GroupByPartNum` | intra_community | 3 |
| `OptimizePackingList → TotalVolumeOfGroup` | intra_community | 3 |
| `OptimizePackingList → MakeExtremePoint` | intra_community | 3 |

## How to Explore

1. `context({name: "optimizePackingList"})` — see callers and callees
2. `query({search_query: "services"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
