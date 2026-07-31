---
name: pages
description: "Skill for the Pages area of Order-management. 78 symbols across 21 files."
---

# Pages

78 symbols | 21 files | Cohesion: 75%

## When to Use

- Working with code in `frontend/`
- Understanding how newLineId, emptyLine, fetchNextPONum work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/pages/LandingPage.tsx` | LinkedInIcon, FooterColumn, Reveal, AnimatedWord, LogoMarquee (+7) |
| `frontend/src/pages/PackingList.tsx` | EditableTextField, cancel, commit, QtyCellInline, load (+6) |
| `frontend/src/App.tsx` | LoadingToContainer, AuthBootstrap, restoreSession, PublicRoute, ProtectedRoute (+3) |
| `frontend/src/pages/NewOrder.tsx` | NewOrder, loadNextPONum, updatePoNum, resetForm, updateItem (+2) |
| `frontend/src/pages/ProductionSchedule.tsx` | loadPage, handlePrev, handleNext, handlePageJump, isAxiosError (+2) |
| `frontend/src/pages/MyOrders.tsx` | isAxiosError, loadPage, handlePrev, handleNext, handlePageJump (+1) |
| `frontend/src/components/ui/select.tsx` | Select, SelectValue, SelectTrigger, SelectItem |
| `frontend/src/pages/LoginPage.tsx` | LoginPage, inputBorder, login, handleSubmit |
| `frontend/src/lib/apis/packingListApi.ts` | listPackingLists, deletePackingList, getPackingList |
| `frontend/src/pages/LoadingToContainer.tsx` | LoadingToContainer, handleSend, FullScreen |

## Entry Points

Start here when exploring this area:

- **`newLineId`** (Function) — `frontend/src/components/po/utils.ts:18`
- **`emptyLine`** (Function) — `frontend/src/components/po/utils.ts:20`
- **`fetchNextPONum`** (Function) — `frontend/src/lib/apis/poApi.ts:71`
- **`NewOrder`** (Function) — `frontend/src/pages/NewOrder.tsx:63`
- **`loadNextPONum`** (Function) — `frontend/src/pages/NewOrder.tsx:82`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `newLineId` | Function | `frontend/src/components/po/utils.ts` | 18 |
| `emptyLine` | Function | `frontend/src/components/po/utils.ts` | 20 |
| `fetchNextPONum` | Function | `frontend/src/lib/apis/poApi.ts` | 71 |
| `NewOrder` | Function | `frontend/src/pages/NewOrder.tsx` | 63 |
| `loadNextPONum` | Function | `frontend/src/pages/NewOrder.tsx` | 82 |
| `updatePoNum` | Function | `frontend/src/pages/NewOrder.tsx` | 98 |
| `resetForm` | Function | `frontend/src/pages/NewOrder.tsx` | 136 |
| `updateItem` | Function | `frontend/src/pages/NewOrder.tsx` | 146 |
| `addLine` | Function | `frontend/src/pages/NewOrder.tsx` | 163 |
| `removeLine` | Function | `frontend/src/pages/NewOrder.tsx` | 171 |
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

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Render → IsAxiosError` | cross_community | 5 |
| `PackingList → IsAxiosError` | cross_community | 4 |
| `NewOrder → NewLineId` | intra_community | 4 |
| `HandleConfirmSave → ListManufactureItems` | cross_community | 4 |
| `HandleConfirmSave → IsAxiosError` | cross_community | 4 |
| `HandlePageJump → ListLineItems` | cross_community | 4 |
| `HandlePageJump → IsAxiosError` | intra_community | 4 |
| `Render → ListPackingLists` | intra_community | 4 |
| `HandlePageJump → ListManufactureItems` | intra_community | 4 |
| `HandlePageJump → IsAxiosError` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 20 calls |
| Po | 3 calls |
| Apis | 2 calls |
| Packing-list | 2 calls |

## How to Explore

1. `context({name: "newLineId"})` — see callers and callees
2. `query({search_query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
