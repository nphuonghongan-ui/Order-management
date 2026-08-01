---
name: ui
description: "Skill for the Ui area of Order-management. 130 symbols across 51 files."
---

# Ui

130 symbols | 51 files | Cohesion: 63%

## When to Use

- Working with code in `frontend/`
- Understanding how cn, ActionToolbar, LoadingScreen work
- Modifying ui-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/ui/select.tsx` | SelectGroup, SelectLabel, SelectSeparator, Select, SelectValue (+5) |
| `frontend/src/components/ui/dialog.tsx` | DialogOverlay, DialogTrigger, Dialog, DialogPortal, DialogContent (+4) |
| `frontend/src/components/ui/sheet.tsx` | SheetFooter, SheetDescription, Sheet, SheetClose, SheetOverlay (+3) |
| `frontend/src/components/ui/card.tsx` | CardAction, CardFooter, Card, CardHeader, CardTitle (+2) |
| `frontend/src/pages/NewOrder.tsx` | NewOrder, loadNextPONum, updatePoNum, resetForm, updateItem (+2) |
| `frontend/src/components/ui/pagination.tsx` | Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious (+2) |
| `frontend/src/components/ui/popover.tsx` | PopoverHeader, PopoverTitle, PopoverDescription, Popover, PopoverTrigger (+1) |
| `frontend/src/components/ui/input-group.tsx` | InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea |
| `frontend/src/components/packing-list/ItemPicker.tsx` | ItemPicker, promptMaxFor, openQtyPromptFor, ContextMenu, Box |
| `frontend/src/components/LoadingScreen.tsx` | DotSpinner, DecorativeIcons, rng, LoadingScreen |

## Entry Points

Start here when exploring this area:

- **`cn`** (Function) — `frontend/src/lib/utils/utils.ts:3`
- **`ActionToolbar`** (Function) — `frontend/src/components/ActionToolbar.tsx:23`
- **`LoadingScreen`** (Function) — `frontend/src/components/LoadingScreen.tsx:88`
- **`Logo`** (Function) — `frontend/src/components/Logo.tsx:15`
- **`SkeletonRow`** (Function) — `frontend/src/components/SkeletonRow.tsx:10`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `cn` | Function | `frontend/src/lib/utils/utils.ts` | 3 |
| `ActionToolbar` | Function | `frontend/src/components/ActionToolbar.tsx` | 23 |
| `LoadingScreen` | Function | `frontend/src/components/LoadingScreen.tsx` | 88 |
| `Logo` | Function | `frontend/src/components/Logo.tsx` | 15 |
| `SkeletonRow` | Function | `frontend/src/components/SkeletonRow.tsx` | 10 |
| `SkeletonTable` | Function | `frontend/src/components/SkeletonRow.tsx` | 36 |
| `StatusBadge` | Function | `frontend/src/components/StatusBadge.tsx` | 35 |
| `newLineId` | Function | `frontend/src/components/po/utils.ts` | 18 |
| `emptyLine` | Function | `frontend/src/components/po/utils.ts` | 20 |
| `listManufactureRecipients` | Function | `frontend/src/lib/apis/notificationApi.ts` | 70 |
| `fetchNextPONum` | Function | `frontend/src/lib/apis/poApi.ts` | 71 |
| `TopBar` | Function | `frontend/src/components/container-viewer/TopBar.tsx` | 23 |
| `NotifyManufactureDialog` | Function | `frontend/src/components/notification/NotifyManufactureDialog.tsx` | 47 |
| `load` | Function | `frontend/src/components/notification/NotifyManufactureDialog.tsx` | 65 |
| `NewOrder` | Function | `frontend/src/pages/NewOrder.tsx` | 63 |
| `loadNextPONum` | Function | `frontend/src/pages/NewOrder.tsx` | 82 |
| `updatePoNum` | Function | `frontend/src/pages/NewOrder.tsx` | 98 |
| `resetForm` | Function | `frontend/src/pages/NewOrder.tsx` | 136 |
| `updateItem` | Function | `frontend/src/pages/NewOrder.tsx` | 146 |
| `addLine` | Function | `frontend/src/pages/NewOrder.tsx` | 163 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `PagePagination → Cn` | cross_community | 5 |
| `PackingList → IsAxiosError` | cross_community | 4 |
| `NewOrder → NewLineId` | intra_community | 4 |
| `PartNumbers → IsAxiosError` | cross_community | 4 |
| `AddPartNumDialog → Cn` | cross_community | 4 |
| `ImportPartNumDialog → Cn` | cross_community | 4 |
| `ItemPicker → ListPartNums` | cross_community | 4 |
| `ItemPicker → Cn` | cross_community | 4 |
| `TopBar → Cn` | cross_community | 4 |
| `PickedColumns → Cn` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Pages | 19 calls |
| Packing-list | 4 calls |
| Po | 4 calls |
| Container-viewer | 3 calls |
| Notification | 1 calls |

## How to Explore

1. `context({name: "cn"})` — see callers and callees
2. `query({search_query: "ui"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
