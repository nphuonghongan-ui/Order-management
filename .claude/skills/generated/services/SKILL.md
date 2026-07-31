---
name: services
description: "Skill for the Services area of Order-management. 7 symbols across 2 files."
---

# Services

7 symbols | 2 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how createShipment, getShipment, createShipmentFromPackingList work
- Modifying services-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/services/easycargoService.js` | readCredentials, authenticate, easycargoFetch, buildItems, getShipment (+1) |
| `backend/src/controllers/easycargoController.js` | createShipment |

## Entry Points

Start here when exploring this area:

- **`createShipment`** (Function) — `backend/src/controllers/easycargoController.js:18`
- **`getShipment`** (Function) — `backend/src/services/easycargoService.js:145`
- **`createShipmentFromPackingList`** (Function) — `backend/src/services/easycargoService.js:154`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `createShipment` | Function | `backend/src/controllers/easycargoController.js` | 18 |
| `getShipment` | Function | `backend/src/services/easycargoService.js` | 145 |
| `createShipmentFromPackingList` | Function | `backend/src/services/easycargoService.js` | 154 |
| `readCredentials` | Function | `backend/src/services/easycargoService.js` | 32 |
| `authenticate` | Function | `backend/src/services/easycargoService.js` | 43 |
| `easycargoFetch` | Function | `backend/src/services/easycargoService.js` | 66 |
| `buildItems` | Function | `backend/src/services/easycargoService.js` | 106 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateShipment → ReadCredentials` | intra_community | 6 |
| `CreateShipment → BuildItems` | intra_community | 3 |

## How to Explore

1. `context({name: "createShipment"})` — see callers and callees
2. `query({search_query: "services"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
