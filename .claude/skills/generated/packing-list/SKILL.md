---
name: packing-list
description: "Skill for the Packing-list area of Order-management. 53 symbols across 15 files."
---

# Packing-list

53 symbols | 15 files | Cohesion: 70%

## When to Use

- Working with code in `frontend/`
- Understanding how fmt, ItemPicker, promptMaxFor work
- Modifying packing-list-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/packing-list/ItemPicker.tsx` | QtyCell, clamp, ItemPicker, promptMaxFor, openQtyPromptFor (+20) |
| `frontend/src/components/packing-list/PackingListPDF.tsx` | fmtCurrency, fmtNumber, fmtDimension, fmtCbm, formatDate (+2) |
| `frontend/src/components/ui/card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent |
| `frontend/src/components/packing-list/exportPackingListExcel.ts` | fmtCurrency, formatDate, exportPackingListToExcel |
| `frontend/src/components/packing-list/ExportButtons.tsx` | isAxiosError, handlePdf, handleExcel |
| `frontend/src/components/po/utils.ts` | fmt |
| `frontend/src/components/ui/input-group.tsx` | InputGroupInput |
| `frontend/src/components/ui/input.tsx` | Input |
| `frontend/src/pages/NewPackingList.tsx` | NewPackingList |
| `frontend/src/components/packing-list/exportEnrichment.ts` | getPartNumDimensions |

## Entry Points

Start here when exploring this area:

- **`fmt`** (Function) — `frontend/src/components/po/utils.ts:2`
- **`ItemPicker`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:396`
- **`promptMaxFor`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:692`
- **`openQtyPromptFor`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:698`
- **`NewPackingList`** (Function) — `frontend/src/pages/NewPackingList.tsx:60`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `fmt` | Function | `frontend/src/components/po/utils.ts` | 2 |
| `ItemPicker` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 396 |
| `promptMaxFor` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 692 |
| `openQtyPromptFor` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 698 |
| `NewPackingList` | Function | `frontend/src/pages/NewPackingList.tsx` | 60 |
| `getPartNumDimensions` | Function | `frontend/src/components/packing-list/exportEnrichment.ts` | 9 |
| `exportPackingListToExcel` | Function | `frontend/src/components/packing-list/exportPackingListExcel.ts` | 29 |
| `handlePdf` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 18 |
| `handleExcel` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 35 |
| `exportPackingListToPDF` | Function | `frontend/src/components/packing-list/exportPackingListPdf.tsx` | 4 |
| `calcCbm` | Function | `frontend/src/components/packing-list/types.ts` | 5 |
| `packableLineMax` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 489 |
| `availableColumns` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 526 |
| `setPickedQtyForLine` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 539 |
| `pickedColumns` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 558 |
| `remainingFor` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 481 |
| `filteredAvailable` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 495 |
| `addPickedQty` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 612 |
| `moveSelRight` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 645 |
| `moveAllRight` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 659 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandlePageJump → ListLineItems` | cross_community | 4 |
| `ItemPicker → ListPartNums` | cross_community | 4 |
| `ItemPicker → Cn` | cross_community | 4 |
| `PickedColumns → Cn` | cross_community | 4 |
| `HandlePdf → CalcContainersNeeded` | cross_community | 4 |
| `HandlePdf → CalcCbm` | cross_community | 4 |
| `HandlePdf → FormatDate` | cross_community | 4 |
| `HandlePdf → Field` | cross_community | 4 |
| `MoveSelRight → CalcCbm` | cross_community | 4 |
| `MoveAllRight → CalcCbm` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 18 calls |
| Po | 4 calls |
| Pages | 1 calls |
| Stores | 1 calls |

## How to Explore

1. `context({name: "fmt"})` — see callers and callees
2. `query({search_query: "packing-list"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
