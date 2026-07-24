---
name: po
description: "Skill for the Po area of Order-management. 15 symbols across 7 files."
---

# Po

15 symbols | 7 files | Cohesion: 82%

## When to Use

- Working with code in `frontend/`
- Understanding how calcContainersNeeded, formatCurrency, MoneyCell work
- Modifying po-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/po/lineItemColumns.tsx` | partNumCell, monoCell, currencyCell, modePill, exWorkDateCell |
| `frontend/src/pages/ProductionSchedule.tsx` | toDateInput, updatePending, sortValue, render |
| `frontend/src/components/packing-list/ItemPicker.tsx` | render, sortValue |
| `frontend/src/components/po/utils.ts` | calcContainersNeeded |
| `frontend/src/lib/format.ts` | formatCurrency |
| `frontend/src/components/MoneyCell.tsx` | MoneyCell |
| `frontend/src/pages/MyOrders.tsx` | render |

## Entry Points

Start here when exploring this area:

- **`calcContainersNeeded`** (Function) — `frontend/src/components/po/utils.ts:8`
- **`formatCurrency`** (Function) — `frontend/src/lib/format.ts:4`
- **`MoneyCell`** (Function) — `frontend/src/components/MoneyCell.tsx:11`
- **`partNumCell`** (Function) — `frontend/src/components/po/lineItemColumns.tsx:17`
- **`monoCell`** (Function) — `frontend/src/components/po/lineItemColumns.tsx:25`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `calcContainersNeeded` | Function | `frontend/src/components/po/utils.ts` | 8 |
| `formatCurrency` | Function | `frontend/src/lib/format.ts` | 4 |
| `MoneyCell` | Function | `frontend/src/components/MoneyCell.tsx` | 11 |
| `partNumCell` | Function | `frontend/src/components/po/lineItemColumns.tsx` | 17 |
| `monoCell` | Function | `frontend/src/components/po/lineItemColumns.tsx` | 25 |
| `currencyCell` | Function | `frontend/src/components/po/lineItemColumns.tsx` | 29 |
| `modePill` | Function | `frontend/src/components/po/lineItemColumns.tsx` | 47 |
| `exWorkDateCell` | Function | `frontend/src/components/po/lineItemColumns.tsx` | 57 |
| `render` | Function | `frontend/src/pages/MyOrders.tsx` | 214 |
| `updatePending` | Function | `frontend/src/pages/ProductionSchedule.tsx` | 168 |
| `sortValue` | Function | `frontend/src/pages/ProductionSchedule.tsx` | 285 |
| `render` | Function | `frontend/src/pages/ProductionSchedule.tsx` | 286 |
| `render` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 243 |
| `sortValue` | Function | `frontend/src/components/packing-list/ItemPicker.tsx` | 249 |
| `toDateInput` | Function | `frontend/src/pages/ProductionSchedule.tsx` | 51 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandlePdf → CalcContainersNeeded` | cross_community | 4 |
| `Render → Cn` | cross_community | 3 |
| `Render → Cn` | cross_community | 3 |
| `Render → FormatCurrency` | intra_community | 3 |
| `Render → Cn` | cross_community | 3 |
| `Render → FormatCurrency` | cross_community | 3 |
| `HandleExcel → CalcContainersNeeded` | cross_community | 3 |
| `Render → Cn` | cross_community | 3 |
| `Render → FormatCurrency` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 3 calls |
| Pages | 1 calls |

## How to Explore

1. `context({name: "calcContainersNeeded"})` — see callers and callees
2. `query({search_query: "po"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
