---
name: components
description: "Skill for the Components area of Order-management. 14 symbols across 5 files."
---

# Components

14 symbols | 5 files | Cohesion: 88%

## When to Use

- Working with code in `frontend/`
- Understanding how useAuthStore, Header, Sidebar work
- Modifying components-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/App.tsx` | AuthBootstrap, restoreSession, PublicRoute, ProtectedRoute, DashboardIndex (+2) |
| `frontend/src/components/Sidebar.tsx` | Sidebar, logout, handleLogout |
| `frontend/src/pages/LoginPage.tsx` | LoginPage, inputBorder |
| `frontend/src/stores/authStore.ts` | useAuthStore |
| `frontend/src/components/Header.tsx` | Header |

## Entry Points

Start here when exploring this area:

- **`useAuthStore`** (Function) — `frontend/src/stores/authStore.ts:28`
- **`Header`** (Function) — `frontend/src/components/Header.tsx:5`
- **`Sidebar`** (Function) — `frontend/src/components/Sidebar.tsx:23`
- **`LoginPage`** (Function) — `frontend/src/pages/LoginPage.tsx:9`
- **`inputBorder`** (Function) — `frontend/src/pages/LoginPage.tsx:33`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useAuthStore` | Function | `frontend/src/stores/authStore.ts` | 28 |
| `Header` | Function | `frontend/src/components/Header.tsx` | 5 |
| `Sidebar` | Function | `frontend/src/components/Sidebar.tsx` | 23 |
| `LoginPage` | Function | `frontend/src/pages/LoginPage.tsx` | 9 |
| `inputBorder` | Function | `frontend/src/pages/LoginPage.tsx` | 33 |
| `logout` | Function | `frontend/src/components/Sidebar.tsx` | 25 |
| `handleLogout` | Function | `frontend/src/components/Sidebar.tsx` | 31 |
| `AuthBootstrap` | Function | `frontend/src/App.tsx` | 16 |
| `restoreSession` | Function | `frontend/src/App.tsx` | 17 |
| `PublicRoute` | Function | `frontend/src/App.tsx` | 24 |
| `ProtectedRoute` | Function | `frontend/src/App.tsx` | 32 |
| `DashboardIndex` | Function | `frontend/src/App.tsx` | 40 |
| `RoleGuard` | Function | `frontend/src/App.tsx` | 45 |
| `App` | Function | `frontend/src/App.tsx` | 53 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Header → ListMyNotifications` | cross_community | 4 |
| `Header → SetAll` | cross_community | 4 |
| `Header → UseNotificationStore` | cross_community | 3 |
| `Header → Popover` | cross_community | 3 |
| `Header → PopoverTrigger` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 2 calls |

## How to Explore

1. `context({name: "useAuthStore"})` — see callers and callees
2. `query({search_query: "components"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
