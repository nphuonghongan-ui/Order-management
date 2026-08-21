---
name: pages
description: "Skill for the Pages area of Order-management. 77 symbols across 19 files."
---

# Pages

77 symbols | 19 files | Cohesion: 76%

## When to Use

- Working with code in `frontend/`
- Understanding how LandingPage, useNavigation, Sidebar work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/pages/PackingList.tsx` | enqueueOp, commitCustomer, commitDelivery, commitItemQty, commitItemRemove (+10) |
| `frontend/src/pages/LandingPage.tsx` | LinkedInIcon, FooterColumn, Reveal, AnimatedWord, LogoMarquee (+9) |
| `frontend/src/pages/PartNumbers.tsx` | loadPage, handlePrev, handleNext, handlePageJump, refresh (+3) |
| `frontend/src/pages/ProductionSchedule.tsx` | loadPage, handlePrev, handleNext, handlePageJump, isAxiosError (+2) |
| `frontend/src/pages/MyOrders.tsx` | isAxiosError, loadPage, handlePrev, handleNext, handlePageJump (+1) |
| `frontend/src/pages/CLPViewer.tsx` | runOptimize, handleContainerChange, handleCalculate, CLPViewer, handleSendEasyCargo |
| `frontend/src/pages/LoginPage.tsx` | LoginPage, inputBorder, login, handleSubmit |
| `frontend/src/lib/apis/packingListApi.ts` | listPackingLists, deletePackingList, getPackingList |
| `frontend/src/pages/OAuthError.tsx` | friendly, OAuthError |
| `frontend/src/pages/OAuthSuccess.tsx` | isSafePath, OAuthSuccess |

## Entry Points

Start here when exploring this area:

- **`LandingPage`** (Function) — `frontend/src/pages/LandingPage.tsx:430`
- **`useNavigation`** (Function) — `frontend/src/lib/hooks/useNavigation.ts:3`
- **`Sidebar`** (Function) — `frontend/src/components/Sidebar.tsx:26`
- **`OAuthSignInButton`** (Function) — `frontend/src/components/oauth/OAuthSignInButton.tsx:24`
- **`LoginPage`** (Function) — `frontend/src/pages/LoginPage.tsx:11`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `LandingPage` | Function | `frontend/src/pages/LandingPage.tsx` | 430 |
| `useNavigation` | Function | `frontend/src/lib/hooks/useNavigation.ts` | 3 |
| `Sidebar` | Function | `frontend/src/components/Sidebar.tsx` | 26 |
| `OAuthSignInButton` | Function | `frontend/src/components/oauth/OAuthSignInButton.tsx` | 24 |
| `LoginPage` | Function | `frontend/src/pages/LoginPage.tsx` | 11 |
| `inputBorder` | Function | `frontend/src/pages/LoginPage.tsx` | 35 |
| `OAuthError` | Function | `frontend/src/pages/OAuthError.tsx` | 29 |
| `OAuthSuccess` | Function | `frontend/src/pages/OAuthSuccess.tsx` | 9 |
| `enqueueOp` | Function | `frontend/src/pages/PackingList.tsx` | 392 |
| `commitCustomer` | Function | `frontend/src/pages/PackingList.tsx` | 416 |
| `commitDelivery` | Function | `frontend/src/pages/PackingList.tsx` | 427 |
| `commitItemQty` | Function | `frontend/src/pages/PackingList.tsx` | 438 |
| `commitItemRemove` | Function | `frontend/src/pages/PackingList.tsx` | 452 |
| `requestRemoveItem` | Function | `frontend/src/pages/PackingList.tsx` | 466 |
| `confirmRemoveLast` | Function | `frontend/src/pages/PackingList.tsx` | 475 |
| `handleAddItemsConfirm` | Function | `frontend/src/pages/PackingList.tsx` | 482 |
| `listPackingLists` | Function | `frontend/src/lib/apis/packingListApi.ts` | 31 |
| `deletePackingList` | Function | `frontend/src/lib/apis/packingListApi.ts` | 59 |
| `ExportButtons` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 14 |
| `load` | Function | `frontend/src/pages/PackingList.tsx` | 296 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Render → IsAxiosError` | cross_community | 5 |
| `HandlePageJump → IsAxiosError` | cross_community | 5 |
| `ConfirmDelete → IsAxiosError` | cross_community | 5 |
| `OnCreated → IsAxiosError` | cross_community | 5 |
| `OnImported → IsAxiosError` | cross_community | 5 |
| `PackingList → IsAxiosError` | cross_community | 4 |
| `LandingPage → LoadGisScript` | cross_community | 4 |
| `PartNumbers → IsAxiosError` | cross_community | 4 |
| `HandleConfirmSave → ListManufactureItems` | cross_community | 4 |
| `HandleConfirmSave → IsAxiosError` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 10 calls |
| Apis | 4 calls |
| Packing-list | 3 calls |
| Stores | 3 calls |
| Po | 1 calls |
| Google | 1 calls |

## How to Explore

1. `context({name: "LandingPage"})` — see callers and callees
2. `query({search_query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
