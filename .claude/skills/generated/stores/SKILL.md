---
name: stores
description: "Skill for the Stores area of Order-management. 5 symbols across 2 files."
---

# Stores

5 symbols | 2 files | Cohesion: 100%

## When to Use

- Working with code in `frontend/`
- Understanding how connectSocket, restoreSession, login work
- Modifying stores-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/stores/authStore.ts` | restoreSession, login, logout |
| `frontend/src/lib/socket.ts` | connectSocket, disconnectSocket |

## Entry Points

Start here when exploring this area:

- **`connectSocket`** (Function) — `frontend/src/lib/socket.ts:10`
- **`restoreSession`** (Function) — `frontend/src/stores/authStore.ts:34`
- **`login`** (Function) — `frontend/src/stores/authStore.ts:45`
- **`disconnectSocket`** (Function) — `frontend/src/lib/socket.ts:40`
- **`logout`** (Function) — `frontend/src/stores/authStore.ts:65`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `connectSocket` | Function | `frontend/src/lib/socket.ts` | 10 |
| `restoreSession` | Function | `frontend/src/stores/authStore.ts` | 34 |
| `login` | Function | `frontend/src/stores/authStore.ts` | 45 |
| `disconnectSocket` | Function | `frontend/src/lib/socket.ts` | 40 |
| `logout` | Function | `frontend/src/stores/authStore.ts` | 65 |

## How to Explore

1. `context({name: "connectSocket"})` — see callers and callees
2. `query({search_query: "stores"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
