---
name: pages
description: "Skill for the Pages area of Order-management. 66 symbols across 17 files."
---

# Pages

66 symbols | 17 files | Cohesion: 77%

## When to Use

- Working with code in `frontend/`
- Understanding how useAuthStore, Sidebar, LoginPage work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/pages/LandingPage.tsx` | LinkedInIcon, FooterColumn, Reveal, AnimatedWord, LogoMarquee (+7) |
| `frontend/src/pages/PackingList.tsx` | EditableTextField, cancel, commit, QtyCellInline, load (+6) |
| `frontend/src/App.tsx` | LoadingToContainer, AuthBootstrap, restoreSession, PublicRoute, ProtectedRoute (+3) |
| `frontend/src/pages/ProductionSchedule.tsx` | loadPage, handlePrev, handleNext, handlePageJump, isAxiosError (+2) |
| `frontend/src/pages/MyOrders.tsx` | isAxiosError, loadPage, handlePrev, handleNext, handlePageJump (+1) |
| `frontend/src/pages/CLPViewer.tsx` | runOptimize, handleContainerChange, handleCalculate, CLPViewer, handleSendEasyCargo |
| `frontend/src/pages/LoginPage.tsx` | LoginPage, inputBorder, login, handleSubmit |
| `frontend/src/lib/apis/packingListApi.ts` | listPackingLists, deletePackingList, getPackingList |
| `frontend/src/lib/apis/manufactureApi.ts` | listManufactureItems, patchManufactureItem |
| `frontend/src/stores/authStore.ts` | useAuthStore |

## Entry Points

Start here when exploring this area:

- **`useAuthStore`** (Function) — `frontend/src/stores/authStore.ts:28`
- **`Sidebar`** (Function) — `frontend/src/components/Sidebar.tsx:23`
- **`LoginPage`** (Function) — `frontend/src/pages/LoginPage.tsx:9`
- **`inputBorder`** (Function) — `frontend/src/pages/LoginPage.tsx:33`
- **`LandingPage`** (Function) — `frontend/src/pages/LandingPage.tsx:427`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useAuthStore` | Function | `frontend/src/stores/authStore.ts` | 28 |
| `Sidebar` | Function | `frontend/src/components/Sidebar.tsx` | 23 |
| `LoginPage` | Function | `frontend/src/pages/LoginPage.tsx` | 9 |
| `inputBorder` | Function | `frontend/src/pages/LoginPage.tsx` | 33 |
| `LandingPage` | Function | `frontend/src/pages/LandingPage.tsx` | 427 |
| `DirtyChip` | Function | `frontend/src/components/DirtyChip.tsx` | 8 |
| `listPackingLists` | Function | `frontend/src/lib/apis/packingListApi.ts` | 19 |
| `deletePackingList` | Function | `frontend/src/lib/apis/packingListApi.ts` | 47 |
| `ExportButtons` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 14 |
| `load` | Function | `frontend/src/pages/PackingList.tsx` | 285 |
| `handleDelete` | Function | `frontend/src/pages/PackingList.tsx` | 328 |
| `render` | Function | `frontend/src/pages/PackingList.tsx` | 499 |
| `loadPage` | Function | `frontend/src/pages/MyOrders.tsx` | 77 |
| `handlePrev` | Function | `frontend/src/pages/MyOrders.tsx` | 139 |
| `handleNext` | Function | `frontend/src/pages/MyOrders.tsx` | 147 |
| `handlePageJump` | Function | `frontend/src/pages/MyOrders.tsx` | 153 |
| `refresh` | Function | `frontend/src/pages/MyOrders.tsx` | 169 |
| `listManufactureItems` | Function | `frontend/src/lib/apis/manufactureApi.ts` | 20 |
| `loadPage` | Function | `frontend/src/pages/ProductionSchedule.tsx` | 79 |
| `handlePrev` | Function | `frontend/src/pages/ProductionSchedule.tsx` | 132 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Render → IsAxiosError` | cross_community | 5 |
| `PackingList → IsAxiosError` | cross_community | 4 |
| `HandleConfirmSave → ListManufactureItems` | cross_community | 4 |
| `HandleConfirmSave → IsAxiosError` | cross_community | 4 |
| `HandlePageJump → ListLineItems` | cross_community | 4 |
| `HandlePageJump → IsAxiosError` | intra_community | 4 |
| `Render → ListPackingLists` | intra_community | 4 |
| `HandlePageJump → ListManufactureItems` | intra_community | 4 |
| `HandlePageJump → IsAxiosError` | cross_community | 4 |
| `PickedColumns → Cn` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 12 calls |
| Apis | 2 calls |
| Po | 1 calls |
| Packing-list | 1 calls |

## How to Explore

1. `context({name: "useAuthStore"})` — see callers and callees
2. `query({search_query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
