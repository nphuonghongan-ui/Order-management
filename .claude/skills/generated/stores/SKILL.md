---
name: stores
description: "Skill for the Stores area of Order-management. 18 symbols across 3 files."
---

# Stores

18 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `frontend/`
- Understanding how setContainerType, setBoxes, updateBoxPosition work
- Modifying stores-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/stores/useContainerStore.ts` | snap, setContainerType, setBoxes, updateBoxPosition, commitHistory (+8) |
| `frontend/src/stores/authStore.ts` | restoreSession, login, logout |
| `frontend/src/lib/socket.ts` | connectSocket, disconnectSocket |

## Entry Points

Start here when exploring this area:

- **`setContainerType`** (Function) — `frontend/src/stores/useContainerStore.ts:81`
- **`setBoxes`** (Function) — `frontend/src/stores/useContainerStore.ts:91`
- **`updateBoxPosition`** (Function) — `frontend/src/stores/useContainerStore.ts:117`
- **`commitHistory`** (Function) — `frontend/src/stores/useContainerStore.ts:145`
- **`redo`** (Function) — `frontend/src/stores/useContainerStore.ts:162`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `setContainerType` | Function | `frontend/src/stores/useContainerStore.ts` | 81 |
| `setBoxes` | Function | `frontend/src/stores/useContainerStore.ts` | 91 |
| `updateBoxPosition` | Function | `frontend/src/stores/useContainerStore.ts` | 117 |
| `commitHistory` | Function | `frontend/src/stores/useContainerStore.ts` | 145 |
| `redo` | Function | `frontend/src/stores/useContainerStore.ts` | 162 |
| `setBoxPositionXYZ` | Function | `frontend/src/stores/useContainerStore.ts` | 181 |
| `setBoxRotation90` | Function | `frontend/src/stores/useContainerStore.ts` | 199 |
| `resetBoxTransform` | Function | `frontend/src/stores/useContainerStore.ts` | 208 |
| `recenterBox` | Function | `frontend/src/stores/useContainerStore.ts` | 219 |
| `connectSocket` | Function | `frontend/src/lib/socket.ts` | 10 |
| `restoreSession` | Function | `frontend/src/stores/authStore.ts` | 34 |
| `login` | Function | `frontend/src/stores/authStore.ts` | 45 |
| `disconnectSocket` | Function | `frontend/src/lib/socket.ts` | 40 |
| `logout` | Function | `frontend/src/stores/authStore.ts` | 65 |
| `updateBoxRotation` | Function | `frontend/src/stores/useContainerStore.ts` | 135 |
| `snap` | Function | `frontend/src/stores/useContainerStore.ts` | 50 |
| `pushHistory` | Function | `frontend/src/stores/useContainerStore.ts` | 231 |
| `snapRotation` | Function | `frontend/src/stores/useContainerStore.ts` | 55 |

## How to Explore

1. `context({name: "setContainerType"})` — see callers and callees
2. `query({search_query: "stores"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
