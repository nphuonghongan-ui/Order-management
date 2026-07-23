---
name: packing-list
description: "Skill for the Packing-list area of Order-management. 42 symbols across 12 files."
---

# Packing-list

42 symbols | 12 files | Cohesion: 82%

## When to Use

- Working with code in `frontend/`
- Understanding how getPartNumDimensions, exportPackingListToExcel, getPackingList work
- Modifying packing-list-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/packing-list/ItemPicker.tsx` | QtyCell, clamp, AwaitingManufactureFlag, buildColumns, packableLineMax (+15) |
| `frontend/src/components/packing-list/PackingListPDF.tsx` | fmtCurrency, fmtNumber, fmtDimension, fmtCbm, formatDate (+2) |
| `frontend/src/components/packing-list/exportPackingListExcel.ts` | fmtCurrency, formatDate, exportPackingListToExcel |
| `frontend/src/components/packing-list/ExportButtons.tsx` | isAxiosError, handlePdf, handleExcel |
| `frontend/src/pages/LoadingToContainer.tsx` | load, text |
| `frontend/src/components/packing-list/exportEnrichment.ts` | getPartNumDimensions |
| `frontend/src/lib/apis/packingListApi.ts` | getPackingList |
| `frontend/src/components/packing-list/exportPackingListPdf.tsx` | exportPackingListToPDF |
| `frontend/src/lib/apis/lineItemApi.ts` | listLineItems |
| `frontend/src/lib/apis/partNumApi.ts` | listPartNums |

## Entry Points

Start here when exploring this area:

- **`getPartNumDimensions`** (Function) — `frontend/src/components/packing-list/exportEnrichment.ts:2`
- **`exportPackingListToExcel`** (Function) — `frontend/src/components/packing-list/exportPackingListExcel.ts:28`
- **`getPackingList`** (Function) — `frontend/src/lib/apis/packingListApi.ts:24`
- **`handlePdf`** (Function) — `frontend/src/components/packing-list/ExportButtons.tsx:18`
- **`handleExcel`** (Function) — `frontend/src/components/packing-list/ExportButtons.tsx:35`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getPartNumDimensions` | Function | `frontend/src/components/packing-list/exportEnrichment.ts` | 2 |
| `exportPackingListToExcel` | Function | `frontend/src/components/packing-list/exportPackingListExcel.ts` | 28 |
| `getPackingList` | Function | `frontend/src/lib/apis/packingListApi.ts` | 24 |
| `handlePdf` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 18 |
| `handleExcel` | Function | `frontend/src/components/packing-list/ExportButtons.tsx` | 35 |
| `exportPackingListToPDF` | Function | `frontend/src/components/packing-list/exportPackingListPdf.tsx` | 4 |
| `load` | Function | `frontend/src/pages/LoadingToContainer.tsx` | 54 |
| `packableLineMax` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 486 |
| `availableColumns` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 523 |
| `setPickedQtyForLine` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 536 |
| `pickedColumns` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 555 |
| `remainingFor` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 478 |
| `filteredAvailable` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 492 |
| `addPickedQty` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 607 |
| `moveSelRight` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 640 |
| `moveAllRight` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 654 |
| `submitQtyPrompt` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 715 |
| `PackingListDocument` | Function | `frontend/src/components/packing-list/PackingListPDF.tsx` | 223 |
| `listLineItems` | Function | `frontend/src/lib/apis/lineItemApi.ts` | 19 |
| `listPartNums` | Function | `frontend/src/lib/apis/partNumApi.ts` | 8 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `AvailableColumns → ListManufactureRecipients` | cross_community | 5 |
| `LoadingToContainer → ListPartNums` | cross_community | 4 |
| `ItemPicker → ListPartNums` | cross_community | 4 |
| `HandlePageJump → ListLineItems` | cross_community | 4 |
| `HandlePdf → CalcContainersNeeded` | cross_community | 4 |
| `HandlePdf → FormatDate` | cross_community | 4 |
| `HandlePdf → Field` | cross_community | 4 |
| `HandlePdf → FmtNumber` | cross_community | 4 |
| `AvailableColumns → BuildDefaultMessage` | cross_community | 4 |
| `AvailableColumns → Dialog` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Po | 3 calls |
| Pages | 1 calls |
| Ui | 1 calls |

## How to Explore

1. `context({name: "getPartNumDimensions"})` — see callers and callees
2. `query({search_query: "packing-list"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
