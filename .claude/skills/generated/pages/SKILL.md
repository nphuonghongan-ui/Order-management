---
name: pages
description: "Skill for the Pages area of Order-management. 80 symbols across 19 files."
---

# Pages

80 symbols | 19 files | Cohesion: 78%

## When to Use

- Working with code in `frontend/`
- Understanding how useAuthStore, Sidebar, LoginPage work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/pages/PackingList.tsx` | enqueueOp, commitCustomer, commitDelivery, commitItemQty, commitItemRemove (+10) |
| `frontend/src/pages/LandingPage.tsx` | LinkedInIcon, FooterColumn, Reveal, AnimatedWord, LogoMarquee (+7) |
| `frontend/src/App.tsx` | LoadingToContainer, AuthBootstrap, restoreSession, PublicRoute, ProtectedRoute (+3) |
| `frontend/src/pages/PartNumbers.tsx` | loadPage, handlePrev, handleNext, handlePageJump, refresh (+3) |
| `frontend/src/pages/ProductionSchedule.tsx` | loadPage, handlePrev, handleNext, handlePageJump, isAxiosError (+2) |
| `frontend/src/pages/MyOrders.tsx` | isAxiosError, loadPage, handlePrev, handleNext, handlePageJump (+1) |
| `frontend/src/pages/CLPViewer.tsx` | runOptimize, handleContainerChange, handleCalculate, CLPViewer, handleSendEasyCargo |
| `frontend/src/pages/LoginPage.tsx` | LoginPage, inputBorder, login, handleSubmit |
| `frontend/src/lib/apis/packingListApi.ts` | listPackingLists, deletePackingList, getPackingList |
| `frontend/src/lib/apis/manufactureApi.ts` | listManufactureItems, patchManufactureItem |

## Entry Points

Start here when exploring this area:

- **`useAuthStore`** (Function) — `frontend/src/stores/authStore.ts:28`
- **`Sidebar`** (Function) — `frontend/src/components/Sidebar.tsx:25`
- **`LoginPage`** (Function) — `frontend/src/pages/LoginPage.tsx:9`
- **`inputBorder`** (Function) — `frontend/src/pages/LoginPage.tsx:33`
- **`LandingPage`** (Function) — `frontend/src/pages/LandingPage.tsx:427`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useAuthStore` | Function | `frontend/src/stores/authStore.ts` | 28 |
| `Sidebar` | Function | `frontend/src/components/Sidebar.tsx` | 25 |
| `LoginPage` | Function | `frontend/src/pages/LoginPage.tsx` | 9 |
| `inputBorder` | Function | `frontend/src/pages/LoginPage.tsx` | 33 |
| `LandingPage` | Function | `frontend/src/pages/LandingPage.tsx` | 427 |
| `enqueueOp` | Function | `frontend/src/pages/PackingList.tsx` | 391 |
| `commitCustomer` | Function | `frontend/src/pages/PackingList.tsx` | 415 |
| `commitDelivery` | Function | `frontend/src/pages/PackingList.tsx` | 426 |
| `commitItemQty` | Function | `frontend/src/pages/PackingList.tsx` | 437 |
| `commitItemRemove` | Function | `frontend/src/pages/PackingList.tsx` | 451 |
| `requestRemoveItem` | Function | `frontend/src/pages/PackingList.tsx` | 465 |
| `confirmRemoveLast` | Function | `frontend/src/pages/PackingList.tsx` | 474 |
| `handleAddItemsConfirm` | Function | `frontend/src/pages/PackingList.tsx` | 481 |
| `DirtyChip` | Function | `frontend/src/components/DirtyChip.tsx` | 8 |
| `listPackingLists` | Function | `frontend/src/lib/apis/packingListApi.ts` | 31 |
| `deletePackingList` | Function | `frontend/src/lib/apis/packingListApi.ts` | 59 |
| `ExportButtons` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 14 |
| `load` | Function | `frontend/src/pages/PackingList.tsx` | 295 |
| `handleDelete` | Function | `frontend/src/pages/PackingList.tsx` | 338 |
| `render` | Function | `frontend/src/pages/PackingList.tsx` | 581 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Render → IsAxiosError` | cross_community | 5 |
| `HandlePageJump → IsAxiosError` | cross_community | 5 |
| `ConfirmDelete → IsAxiosError` | cross_community | 5 |
| `OnCreated → IsAxiosError` | cross_community | 5 |
| `OnImported → IsAxiosError` | cross_community | 5 |
| `PackingList → IsAxiosError` | cross_community | 4 |
| `PartNumbers → IsAxiosError` | cross_community | 4 |
| `HandleConfirmSave → ListManufactureItems` | cross_community | 4 |
| `HandleConfirmSave → IsAxiosError` | cross_community | 4 |
| `HandlePageJump → ListLineItems` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 12 calls |
| Apis | 4 calls |
| Po | 1 calls |
| Packing-list | 1 calls |

## How to Explore

1. `context({name: "useAuthStore"})` — see callers and callees
2. `query({search_query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
