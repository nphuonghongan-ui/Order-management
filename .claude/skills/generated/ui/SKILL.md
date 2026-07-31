---
name: ui
description: "Skill for the Ui area of Order-management. 124 symbols across 46 files."
---

# Ui

124 symbols | 46 files | Cohesion: 63%

## When to Use

- Working with code in `frontend/`
- Understanding how cn, LoadingScreen, Logo work
- Modifying ui-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/ui/select.tsx` | SelectGroup, SelectLabel, SelectSeparator, Select, SelectValue (+5) |
| `frontend/src/components/ui/dialog.tsx` | Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent (+4) |
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
- **`LoadingScreen`** (Function) — `frontend/src/components/LoadingScreen.tsx:88`
- **`Logo`** (Function) — `frontend/src/components/Logo.tsx:15`
- **`SkeletonRow`** (Function) — `frontend/src/components/SkeletonRow.tsx:10`
- **`SkeletonTable`** (Function) — `frontend/src/components/SkeletonRow.tsx:36`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `cn` | Function | `frontend/src/lib/utils/utils.ts` | 3 |
| `LoadingScreen` | Function | `frontend/src/components/LoadingScreen.tsx` | 88 |
| `Logo` | Function | `frontend/src/components/Logo.tsx` | 15 |
| `SkeletonRow` | Function | `frontend/src/components/SkeletonRow.tsx` | 10 |
| `SkeletonTable` | Function | `frontend/src/components/SkeletonRow.tsx` | 36 |
| `StatusBadge` | Function | `frontend/src/components/StatusBadge.tsx` | 35 |
| `listManufactureRecipients` | Function | `frontend/src/lib/apis/notificationApi.ts` | 70 |
| `ActionToolbar` | Function | `frontend/src/components/ActionToolbar.tsx` | 21 |
| `ConfirmDiscardDialog` | Function | `frontend/src/components/ConfirmDiscardDialog.tsx` | 18 |
| `NotifyManufactureDialog` | Function | `frontend/src/components/notification/NotifyManufactureDialog.tsx` | 47 |
| `load` | Function | `frontend/src/components/notification/NotifyManufactureDialog.tsx` | 65 |
| `ItemPicker` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 395 |
| `promptMaxFor` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 691 |
| `openQtyPromptFor` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 697 |
| `ProductionSchedule` | Function | `frontend/src/pages/ProductionSchedule.tsx` | 62 |
| `fmt` | Function | `frontend/src/components/po/utils.ts` | 2 |
| `useSaveShortcut` | Function | `frontend/src/lib/hooks/useSaveShortcut.ts` | 2 |
| `IconField` | Function | `frontend/src/components/Detail/IconField.tsx` | 2 |
| `MetaField` | Function | `frontend/src/components/Detail/MetaField.tsx` | 2 |
| `SectionCard` | Function | `frontend/src/components/Detail/SectionCard.tsx` | 3 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `PagePagination → Cn` | cross_community | 5 |
| `PackingList → IsAxiosError` | cross_community | 4 |
| `NewOrder → NewLineId` | intra_community | 4 |
| `ItemPicker → ListPartNums` | cross_community | 4 |
| `ItemPicker → Cn` | cross_community | 4 |
| `TopBar → Cn` | cross_community | 4 |
| `PickedColumns → Cn` | cross_community | 4 |
| `ConfirmDiscardDialog → Cn` | cross_community | 4 |
| `Header → ListMyNotifications` | intra_community | 4 |
| `Header → SetAll` | intra_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Pages | 16 calls |
| Packing-list | 4 calls |
| Po | 4 calls |
| Container-viewer | 2 calls |
| Notification | 1 calls |

## How to Explore

1. `context({name: "cn"})` — see callers and callees
2. `query({search_query: "ui"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
