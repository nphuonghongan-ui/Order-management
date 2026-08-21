---
name: stores
description: "Skill for the Stores area of Order-management. 16 symbols across 3 files."
---

# Stores

16 symbols | 3 files | Cohesion: 88%

## When to Use

- Working with code in `frontend/`
- Understanding how useAuthStore, connectSocket, restoreSession work
- Modifying stores-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/App.tsx` | LoadingToContainer, AuthBootstrap, restoreSession, PublicRoute, PublicRouteAlways (+4) |
| `frontend/src/stores/authStore.ts` | useAuthStore, restoreSession, login, loginWithGoogleOneTap, logout |
| `frontend/src/lib/socket.ts` | connectSocket, disconnectSocket |

## Entry Points

Start here when exploring this area:

- **`useAuthStore`** (Function) — `frontend/src/stores/authStore.ts:33`
- **`connectSocket`** (Function) — `frontend/src/lib/socket.ts:10`
- **`restoreSession`** (Function) — `frontend/src/stores/authStore.ts:39`
- **`login`** (Function) — `frontend/src/stores/authStore.ts:67`
- **`loginWithGoogleOneTap`** (Function) — `frontend/src/stores/authStore.ts:87`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useAuthStore` | Function | `frontend/src/stores/authStore.ts` | 33 |
| `connectSocket` | Function | `frontend/src/lib/socket.ts` | 10 |
| `restoreSession` | Function | `frontend/src/stores/authStore.ts` | 39 |
| `login` | Function | `frontend/src/stores/authStore.ts` | 67 |
| `loginWithGoogleOneTap` | Function | `frontend/src/stores/authStore.ts` | 87 |
| `disconnectSocket` | Function | `frontend/src/lib/socket.ts` | 40 |
| `logout` | Function | `frontend/src/stores/authStore.ts` | 103 |
| `LoadingToContainer` | Function | `frontend/src/App.tsx` | 18 |
| `AuthBootstrap` | Function | `frontend/src/App.tsx` | 22 |
| `restoreSession` | Function | `frontend/src/App.tsx` | 23 |
| `PublicRoute` | Function | `frontend/src/App.tsx` | 30 |
| `PublicRouteAlways` | Function | `frontend/src/App.tsx` | 38 |
| `ProtectedRoute` | Function | `frontend/src/App.tsx` | 44 |
| `DashboardIndex` | Function | `frontend/src/App.tsx` | 52 |
| `RoleGuard` | Function | `frontend/src/App.tsx` | 57 |
| `App` | Function | `frontend/src/App.tsx` | 65 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `App → UseAuthStore` | intra_community | 3 |
| `App → RestoreSession` | intra_community | 3 |

## How to Explore

1. `context({name: "useAuthStore"})` — see callers and callees
2. `query({search_query: "stores"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
