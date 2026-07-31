---
name: packing-list
description: "Skill for the Packing-list area of Order-management. 39 symbols across 10 files."
---

# Packing-list

39 symbols | 10 files | Cohesion: 77%

## When to Use

- Working with code in `frontend/`
- Understanding how calcCbm, packableLineMax, availableColumns work
- Modifying packing-list-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/packing-list/ItemPicker.tsx` | QtyCell, clamp, AwaitingManufactureFlag, buildColumns, packableLineMax (+15) |
| `frontend/src/components/packing-list/PackingListPDF.tsx` | fmtCurrency, fmtNumber, fmtDimension, fmtCbm, formatDate (+2) |
| `frontend/src/components/packing-list/exportPackingListExcel.ts` | fmtCurrency, formatDate, exportPackingListToExcel |
| `frontend/src/components/packing-list/ExportButtons.tsx` | isAxiosError, handlePdf, handleExcel |
| `frontend/src/components/packing-list/types.ts` | calcCbm |
| `frontend/src/components/packing-list/exportEnrichment.ts` | getPartNumDimensions |
| `frontend/src/components/packing-list/exportPackingListPdf.tsx` | exportPackingListToPDF |
| `frontend/src/lib/apis/lineItemApi.ts` | listLineItems |
| `frontend/src/lib/apis/partNumApi.ts` | listPartNums |
| `frontend/src/pages/NewOrder.tsx` | loadPartNums |

## Entry Points

Start here when exploring this area:

- **`calcCbm`** (Function) — `frontend/src/components/packing-list/types.ts:5`
- **`packableLineMax`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:488`
- **`availableColumns`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:525`
- **`setPickedQtyForLine`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:538`
- **`pickedColumns`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:557`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `calcCbm` | Function | `frontend/src/components/packing-list/types.ts` | 5 |
| `packableLineMax` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 488 |
| `availableColumns` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 525 |
| `setPickedQtyForLine` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 538 |
| `pickedColumns` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 557 |
| `getPartNumDimensions` | Function | `frontend/src/components/packing-list/exportEnrichment.ts` | 9 |
| `exportPackingListToExcel` | Function | `frontend/src/components/packing-list/exportPackingListExcel.ts` | 29 |
| `handlePdf` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 18 |
| `handleExcel` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 35 |
| `exportPackingListToPDF` | Function | `frontend/src/components/packing-list/exportPackingListPdf.tsx` | 4 |
| `remainingFor` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 480 |
| `filteredAvailable` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 494 |
| `addPickedQty` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 611 |
| `moveSelRight` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 644 |
| `moveAllRight` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 658 |
| `submitQtyPrompt` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 719 |
| `PackingListDocument` | Function | `frontend/src/components/packing-list/PackingListPDF.tsx` | 224 |
| `listLineItems` | Function | `frontend/src/lib/apis/lineItemApi.ts` | 19 |
| `listPartNums` | Function | `frontend/src/lib/apis/partNumApi.ts` | 13 |
| `load` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 430 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `ItemPicker → ListPartNums` | cross_community | 4 |
| `HandlePageJump → ListLineItems` | cross_community | 4 |
| `PickedColumns → Cn` | cross_community | 4 |
| `HandlePdf → CalcContainersNeeded` | cross_community | 4 |
| `HandlePdf → CalcCbm` | cross_community | 4 |
| `HandlePdf → FormatDate` | cross_community | 4 |
| `HandlePdf → Field` | cross_community | 4 |
| `MoveSelRight → CalcCbm` | cross_community | 4 |
| `MoveAllRight → CalcCbm` | cross_community | 4 |
| `SubmitQtyPrompt → CalcCbm` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Po | 3 calls |
| Pages | 1 calls |
| Ui | 1 calls |

## How to Explore

1. `context({name: "calcCbm"})` — see callers and callees
2. `query({search_query: "packing-list"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
