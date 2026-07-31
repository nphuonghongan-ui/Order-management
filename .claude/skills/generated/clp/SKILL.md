---
name: clp
description: "Skill for the Clp area of Order-management. 6 symbols across 2 files."
---

# Clp

6 symbols | 2 files | Cohesion: 91%

## When to Use

- Working with code in `backend/`
- Understanding how aabbOverlap, inBounds, fitsAt work
- Modifying clp-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/lib/clp/geometry.js` | aabbOverlap, inBounds, fitsAt, getOrientations |
| `backend/src/services/clpOptimizer.js` | placementAtPoint, findPlacementForBox |

## Entry Points

Start here when exploring this area:

- **`aabbOverlap`** (Function) — `backend/src/lib/clp/geometry.js:2`
- **`inBounds`** (Function) — `backend/src/lib/clp/geometry.js:13`
- **`fitsAt`** (Function) — `backend/src/lib/clp/geometry.js:24`
- **`getOrientations`** (Function) — `backend/src/lib/clp/geometry.js:32`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `aabbOverlap` | Function | `backend/src/lib/clp/geometry.js` | 2 |
| `inBounds` | Function | `backend/src/lib/clp/geometry.js` | 13 |
| `fitsAt` | Function | `backend/src/lib/clp/geometry.js` | 24 |
| `getOrientations` | Function | `backend/src/lib/clp/geometry.js` | 32 |
| `placementAtPoint` | Function | `backend/src/services/clpOptimizer.js` | 45 |
| `findPlacementForBox` | Function | `backend/src/services/clpOptimizer.js` | 56 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `OptimizePackingList → InBounds` | cross_community | 5 |
| `OptimizePackingList → AabbOverlap` | cross_community | 5 |
| `OptimizePackingList → GetOrientations` | cross_community | 4 |
| `OptimizePackingList → PlacementAtPoint` | cross_community | 4 |

## How to Explore

1. `context({name: "aabbOverlap"})` — see callers and callees
2. `query({search_query: "clp"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
