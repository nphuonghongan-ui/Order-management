---
name: ui
description: "Skill for the Ui area of Order-management. 99 symbols across 35 files."
---

# Ui

99 symbols | 35 files | Cohesion: 62%

## When to Use

- Working with code in `frontend/`
- Understanding how formatNumber, cn, LoadingScreen work
- Modifying ui-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/ui/command.tsx` | CommandInput, CommandSeparator, CommandShortcut, CommandDialog, Command (+4) |
| `frontend/src/components/ui/dialog.tsx` | Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent (+4) |
| `frontend/src/components/ui/card.tsx` | CardAction, CardFooter, Card, CardHeader, CardTitle (+2) |
| `frontend/src/components/ui/pagination.tsx` | Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious (+2) |
| `frontend/src/components/ui/popover.tsx` | PopoverHeader, PopoverTitle, PopoverDescription, PopoverTrigger, PopoverContent (+1) |
| `frontend/src/components/ui/select.tsx` | SelectGroup, SelectContent, SelectLabel, SelectSeparator, SelectScrollUpButton (+1) |
| `frontend/src/components/ui/input-group.tsx` | InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea, InputGroupButton |
| `frontend/src/components/packing-list/ItemPicker.tsx` | ItemPicker, promptMaxFor, openQtyPromptFor, ContextMenu, Box |
| `frontend/src/components/LoadingScreen.tsx` | DotSpinner, DecorativeIcons, rng, LoadingScreen |
| `frontend/src/components/ui/tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent |

## Entry Points

Start here when exploring this area:

- **`formatNumber`** (Function) — `frontend/src/lib/format.ts:2`
- **`cn`** (Function) — `frontend/src/lib/utils/utils.ts:3`
- **`LoadingScreen`** (Function) — `frontend/src/components/LoadingScreen.tsx:88`
- **`Logo`** (Function) — `frontend/src/components/Logo.tsx:15`
- **`QtyCell`** (Function) — `frontend/src/components/QtyCell.tsx:9`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `formatNumber` | Function | `frontend/src/lib/format.ts` | 2 |
| `cn` | Function | `frontend/src/lib/utils/utils.ts` | 3 |
| `LoadingScreen` | Function | `frontend/src/components/LoadingScreen.tsx` | 88 |
| `Logo` | Function | `frontend/src/components/Logo.tsx` | 15 |
| `QtyCell` | Function | `frontend/src/components/QtyCell.tsx` | 9 |
| `StatusBadge` | Function | `frontend/src/components/StatusBadge.tsx` | 35 |
| `listManufactureRecipients` | Function | `frontend/src/lib/apis/notificationApi.ts` | 70 |
| `ActionToolbar` | Function | `frontend/src/components/ActionToolbar.tsx` | 21 |
| `ConfirmDiscardDialog` | Function | `frontend/src/components/ConfirmDiscardDialog.tsx` | 18 |
| `NotifyManufactureDialog` | Function | `frontend/src/components/notification/NotifyManufactureDialog.tsx` | 47 |
| `load` | Function | `frontend/src/components/notification/NotifyManufactureDialog.tsx` | 65 |
| `ItemPicker` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 394 |
| `promptMaxFor` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 688 |
| `openQtyPromptFor` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 694 |
| `ProductionSchedule` | Function | `frontend/src/pages/ProductionSchedule.tsx` | 62 |
| `listMyNotifications` | Function | `frontend/src/lib/apis/notificationApi.ts` | 15 |
| `useNotificationStore` | Function | `frontend/src/stores/notificationStore.ts` | 15 |
| `Header` | Function | `frontend/src/components/Header.tsx` | 5 |
| `NotificationBell` | Function | `frontend/src/components/notification/NotificationBell.tsx` | 212 |
| `setAll` | Function | `frontend/src/components/notification/NotificationBell.tsx` | 223 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `PagePagination → Cn` | cross_community | 5 |
| `AvailableColumns → ListManufactureRecipients` | cross_community | 5 |
| `ItemPicker → ListPartNums` | cross_community | 4 |
| `ItemPicker → Cn` | cross_community | 4 |
| `AvailableColumns → BuildDefaultMessage` | cross_community | 4 |
| `AvailableColumns → Dialog` | cross_community | 4 |
| `AvailableColumns → DialogTrigger` | cross_community | 4 |
| `PickedColumns → Cn` | cross_community | 4 |
| `ConfirmDiscardDialog → Cn` | cross_community | 4 |
| `Header → ListMyNotifications` | intra_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Pages | 12 calls |
| Container-viewer | 4 calls |
| Packing-list | 3 calls |
| Notification | 1 calls |

## How to Explore

1. `context({name: "formatNumber"})` — see callers and callees
2. `query({search_query: "ui"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
