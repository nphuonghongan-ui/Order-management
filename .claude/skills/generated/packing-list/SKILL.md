---
name: packing-list
description: "Skill for the Packing-list area of Order-management. 37 symbols across 8 files."
---

# Packing-list

37 symbols | 8 files | Cohesion: 80%

## When to Use

- Working with code in `frontend/`
- Understanding how packableLineMax, availableColumns, setPickedQtyForLine work
- Modifying packing-list-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/packing-list/ItemPicker.tsx` | QtyCell, clamp, AwaitingManufactureFlag, buildColumns, packableLineMax (+15) |
| `frontend/src/components/packing-list/PackingListPDF.tsx` | fmtCurrency, fmtNumber, fmtDimension, fmtCbm, formatDate (+2) |
| `frontend/src/components/packing-list/exportPackingListExcel.ts` | fmtCurrency, formatDate, exportPackingListToExcel |
| `frontend/src/components/packing-list/ExportButtons.tsx` | isAxiosError, handlePdf, handleExcel |
| `frontend/src/components/packing-list/exportPackingListPdf.tsx` | exportPackingListToPDF |
| `frontend/src/lib/apis/lineItemApi.ts` | listLineItems |
| `frontend/src/lib/apis/partNumApi.ts` | listPartNums |
| `frontend/src/pages/NewOrder.tsx` | loadPartNums |

## Entry Points

Start here when exploring this area:

- **`packableLineMax`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:487`
- **`availableColumns`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:524`
- **`setPickedQtyForLine`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:537`
- **`pickedColumns`** (Function) — `frontend/src/components/packing-list/ItemPicker.tsx:556`
- **`exportPackingListToExcel`** (Function) — `frontend/src/components/packing-list/exportPackingListExcel.ts:28`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `packableLineMax` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 487 |
| `availableColumns` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 524 |
| `setPickedQtyForLine` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 537 |
| `pickedColumns` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 556 |
| `exportPackingListToExcel` | Function | `frontend/src/components/packing-list/exportPackingListExcel.ts` | 28 |
| `handlePdf` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 18 |
| `handleExcel` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 35 |
| `exportPackingListToPDF` | Function | `frontend/src/components/packing-list/exportPackingListPdf.tsx` | 4 |
| `remainingFor` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 479 |
| `filteredAvailable` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 493 |
| `addPickedQty` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 608 |
| `moveSelRight` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 641 |
| `moveAllRight` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 655 |
| `submitQtyPrompt` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 716 |
| `PackingListDocument` | Function | `frontend/src/components/packing-list/PackingListPDF.tsx` | 223 |
| `listLineItems` | Function | `frontend/src/lib/apis/lineItemApi.ts` | 19 |
| `listPartNums` | Function | `frontend/src/lib/apis/partNumApi.ts` | 8 |
| `load` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 429 |
| `loadPartNums` | Function | `frontend/src/pages/NewOrder.tsx` | 111 |
| `pickedAsLines` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 506 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `AvailableColumns → ListManufactureRecipients` | cross_community | 5 |
| `ContainerViewer → ListPartNums` | cross_community | 4 |
| `LoadingToContainer → ListPartNums` | cross_community | 4 |
| `ItemPicker → ListPartNums` | cross_community | 4 |
| `HandlePageJump → ListLineItems` | cross_community | 4 |
| `HandlePdf → CalcContainersNeeded` | cross_community | 4 |
| `HandlePdf → FormatDate` | cross_community | 4 |
| `HandlePdf → Field` | cross_community | 4 |
| `HandlePdf → FmtNumber` | cross_community | 4 |
| `AvailableColumns → BuildDefaultMessage` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Po | 3 calls |
| Pages | 3 calls |
| Ui | 1 calls |

## How to Explore

1. `context({name: "packableLineMax"})` — see callers and callees
2. `query({search_query: "packing-list"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
