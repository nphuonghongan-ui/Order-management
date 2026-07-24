---
name: pages
description: "Skill for the Pages area of Order-management. 109 symbols across 32 files."
---

# Pages

109 symbols | 32 files | Cohesion: 72%

## When to Use

- Working with code in `frontend/`
- Understanding how fmt, useSaveShortcut, IconField work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/pages/PackingList.tsx` | PackingList, handleSheetOpenChange, EditableTextField, cancel, commit (+8) |
| `frontend/src/pages/LandingPage.tsx` | LinkedInIcon, FooterColumn, Reveal, AnimatedWord, LogoMarquee (+7) |
| `frontend/src/pages/ContainerViewer.tsx` | load, seedBoxes, ContainerViewer, setBoxes, reset (+4) |
| `frontend/src/pages/MyOrders.tsx` | MyOrders, buildColumns, isAxiosError, loadPage, handlePrev (+3) |
| `frontend/src/App.tsx` | ContainerViewer, AuthBootstrap, restoreSession, PublicRoute, ProtectedRoute (+3) |
| `frontend/src/pages/NewOrder.tsx` | NewOrder, loadNextPONum, updatePoNum, resetForm, updateItem (+2) |
| `frontend/src/pages/ProductionSchedule.tsx` | loadPage, handlePrev, handleNext, handlePageJump, isAxiosError (+2) |
| `frontend/src/components/ui/sheet.tsx` | Sheet, SheetClose, SheetOverlay, SheetContent, SheetHeader (+1) |
| `frontend/src/pages/LoadingToContainer.tsx` | copyToClipboard, LoadingToContainer, handleCopy, handleDownload, load (+1) |
| `frontend/src/pages/LoginPage.tsx` | LoginPage, inputBorder, login, handleSubmit |

## Entry Points

Start here when exploring this area:

- **`fmt`** (Function) — `frontend/src/components/po/utils.ts:2`
- **`useSaveShortcut`** (Function) — `frontend/src/lib/hooks/useSaveShortcut.ts:2`
- **`IconField`** (Function) — `frontend/src/components/Detail/IconField.tsx:2`
- **`MetaField`** (Function) — `frontend/src/components/Detail/MetaField.tsx:2`
- **`SectionCard`** (Function) — `frontend/src/components/Detail/SectionCard.tsx:3`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `fmt` | Function | `frontend/src/components/po/utils.ts` | 2 |
| `useSaveShortcut` | Function | `frontend/src/lib/hooks/useSaveShortcut.ts` | 2 |
| `IconField` | Function | `frontend/src/components/Detail/IconField.tsx` | 2 |
| `MetaField` | Function | `frontend/src/components/Detail/MetaField.tsx` | 2 |
| `SectionCard` | Function | `frontend/src/components/Detail/SectionCard.tsx` | 3 |
| `EmptyState` | Function | `frontend/src/components/EmptyState.tsx` | 26 |
| `PageShell` | Function | `frontend/src/components/PageShell.tsx` | 3 |
| `SectionHeader` | Function | `frontend/src/components/SectionHeader.tsx` | 12 |
| `SkeletonRow` | Function | `frontend/src/components/SkeletonRow.tsx` | 10 |
| `SkeletonTable` | Function | `frontend/src/components/SkeletonRow.tsx` | 36 |
| `StatBar` | Function | `frontend/src/components/StatBar.tsx` | 36 |
| `LoadingToContainer` | Function | `frontend/src/pages/LoadingToContainer.tsx` | 41 |
| `handleCopy` | Function | `frontend/src/pages/LoadingToContainer.tsx` | 92 |
| `handleDownload` | Function | `frontend/src/pages/LoadingToContainer.tsx` | 106 |
| `MyOrders` | Function | `frontend/src/pages/MyOrders.tsx` | 60 |
| `buildColumns` | Function | `frontend/src/pages/MyOrders.tsx` | 209 |
| `PackingList` | Function | `frontend/src/pages/PackingList.tsx` | 238 |
| `handleSheetOpenChange` | Function | `frontend/src/pages/PackingList.tsx` | 433 |
| `useAuthStore` | Function | `frontend/src/stores/authStore.ts` | 28 |
| `Sidebar` | Function | `frontend/src/components/Sidebar.tsx` | 23 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Render → IsAxiosError` | cross_community | 5 |
| `PackingList → IsAxiosError` | cross_community | 4 |
| `NewOrder → NewLineId` | intra_community | 4 |
| `ContainerViewer → ListPartNums` | cross_community | 4 |
| `LoadingToContainer → ListPartNums` | cross_community | 4 |
| `HandleConfirmSave → ListManufactureItems` | cross_community | 4 |
| `HandleConfirmSave → IsAxiosError` | cross_community | 4 |
| `HandlePageJump → ListLineItems` | cross_community | 4 |
| `HandlePageJump → IsAxiosError` | intra_community | 4 |
| `Render → ListPackingLists` | intra_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 30 calls |
| Container-viewer | 9 calls |
| Po | 3 calls |
| Packing-list | 3 calls |
| Apis | 2 calls |

## How to Explore

1. `context({name: "fmt"})` — see callers and callees
2. `query({search_query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
