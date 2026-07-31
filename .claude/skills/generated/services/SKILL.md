---
name: services
description: "Skill for the Services area of Order-management. 19 symbols across 6 files."
---

# Services

19 symbols | 6 files | Cohesion: 97%

## When to Use

- Working with code in `backend/`
- Understanding how optimizePackingList, makeExtremePoint, emitPointsFor work
- Modifying services-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/services/clpOptimizer.js` | toMmBox, expandToIndividualBoxes, sortBoxes, colorForPartNum, optimize (+1) |
| `backend/src/services/easycargoService.js` | readCredentials, authenticate, easycargoFetch, buildItems, getShipment (+1) |
| `backend/src/lib/clp/extremePoints.js` | makeExtremePoint, emitPointsFor, pruneDominated, addPoints |
| `backend/src/controllers/clpController.js` | optimizePackingList |
| `backend/src/lib/clp/geometry.js` | volumeOf |
| `backend/src/controllers/easycargoController.js` | createShipment |

## Entry Points

Start here when exploring this area:

- **`optimizePackingList`** (Function) — `backend/src/controllers/clpController.js:10`
- **`makeExtremePoint`** (Function) — `backend/src/lib/clp/extremePoints.js:0`
- **`emitPointsFor`** (Function) — `backend/src/lib/clp/extremePoints.js:4`
- **`pruneDominated`** (Function) — `backend/src/lib/clp/extremePoints.js:30`
- **`addPoints`** (Function) — `backend/src/lib/clp/extremePoints.js:53`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `optimizePackingList` | Function | `backend/src/controllers/clpController.js` | 10 |
| `makeExtremePoint` | Function | `backend/src/lib/clp/extremePoints.js` | 0 |
| `emitPointsFor` | Function | `backend/src/lib/clp/extremePoints.js` | 4 |
| `pruneDominated` | Function | `backend/src/lib/clp/extremePoints.js` | 30 |
| `addPoints` | Function | `backend/src/lib/clp/extremePoints.js` | 53 |
| `volumeOf` | Function | `backend/src/lib/clp/geometry.js` | 44 |
| `optimize` | Function | `backend/src/services/clpOptimizer.js` | 102 |
| `buildItemsFromPackingList` | Function | `backend/src/services/clpOptimizer.js` | 165 |
| `createShipment` | Function | `backend/src/controllers/easycargoController.js` | 18 |
| `getShipment` | Function | `backend/src/services/easycargoService.js` | 145 |
| `createShipmentFromPackingList` | Function | `backend/src/services/easycargoService.js` | 154 |
| `toMmBox` | Function | `backend/src/services/clpOptimizer.js` | 5 |
| `expandToIndividualBoxes` | Function | `backend/src/services/clpOptimizer.js` | 16 |
| `sortBoxes` | Function | `backend/src/services/clpOptimizer.js` | 34 |
| `colorForPartNum` | Function | `backend/src/services/clpOptimizer.js` | 93 |
| `readCredentials` | Function | `backend/src/services/easycargoService.js` | 32 |
| `authenticate` | Function | `backend/src/services/easycargoService.js` | 43 |
| `easycargoFetch` | Function | `backend/src/services/easycargoService.js` | 66 |
| `buildItems` | Function | `backend/src/services/easycargoService.js` | 106 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateShipment → ReadCredentials` | intra_community | 6 |
| `OptimizePackingList → InBounds` | cross_community | 5 |
| `OptimizePackingList → AabbOverlap` | cross_community | 5 |
| `OptimizePackingList → ToMmBox` | intra_community | 4 |
| `OptimizePackingList → GetOrientations` | cross_community | 4 |
| `OptimizePackingList → PlacementAtPoint` | cross_community | 4 |
| `OptimizePackingList → SortBoxes` | intra_community | 3 |
| `OptimizePackingList → MakeExtremePoint` | intra_community | 3 |
| `CreateShipment → BuildItems` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Clp | 1 calls |

## How to Explore

1. `context({name: "optimizePackingList"})` — see callers and callees
2. `query({search_query: "services"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
