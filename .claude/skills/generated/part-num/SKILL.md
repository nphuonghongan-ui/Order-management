---
name: part-num
description: "Skill for the Part-num area of Order-management. 15 symbols across 3 files."
---

# Part-num

15 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `frontend/`
- Understanding how handleFile, createPartNum, validate work
- Modifying part-num-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/part-num/ImportPartNumDialog.tsx` | toNumberOrNull, toIntOrNull, toStrOrEmpty, normalizeHeader, resolveColumn (+5) |
| `frontend/src/components/part-num/AddPartNumDialog.tsx` | toNumberOrNull, validate, handleSubmit |
| `frontend/src/lib/apis/partNumApi.ts` | createPartNum, importPartNums |

## Entry Points

Start here when exploring this area:

- **`handleFile`** (Function) — `frontend/src/components/part-num/ImportPartNumDialog.tsx:222`
- **`createPartNum`** (Function) — `frontend/src/lib/apis/partNumApi.ts:82`
- **`validate`** (Function) — `frontend/src/components/part-num/AddPartNumDialog.tsx:85`
- **`handleSubmit`** (Function) — `frontend/src/components/part-num/AddPartNumDialog.tsx:105`
- **`importPartNums`** (Function) — `frontend/src/lib/apis/partNumApi.ts:89`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `handleFile` | Function | `frontend/src/components/part-num/ImportPartNumDialog.tsx` | 222 |
| `createPartNum` | Function | `frontend/src/lib/apis/partNumApi.ts` | 82 |
| `validate` | Function | `frontend/src/components/part-num/AddPartNumDialog.tsx` | 85 |
| `handleSubmit` | Function | `frontend/src/components/part-num/AddPartNumDialog.tsx` | 105 |
| `importPartNums` | Function | `frontend/src/lib/apis/partNumApi.ts` | 89 |
| `buildPayload` | Function | `frontend/src/components/part-num/ImportPartNumDialog.tsx` | 259 |
| `handleImport` | Function | `frontend/src/components/part-num/ImportPartNumDialog.tsx` | 271 |
| `toNumberOrNull` | Function | `frontend/src/components/part-num/ImportPartNumDialog.tsx` | 62 |
| `toIntOrNull` | Function | `frontend/src/components/part-num/ImportPartNumDialog.tsx` | 69 |
| `toStrOrEmpty` | Function | `frontend/src/components/part-num/ImportPartNumDialog.tsx` | 76 |
| `normalizeHeader` | Function | `frontend/src/components/part-num/ImportPartNumDialog.tsx` | 79 |
| `resolveColumn` | Function | `frontend/src/components/part-num/ImportPartNumDialog.tsx` | 82 |
| `findHeaderRow` | Function | `frontend/src/components/part-num/ImportPartNumDialog.tsx` | 95 |
| `parseSheet` | Function | `frontend/src/components/part-num/ImportPartNumDialog.tsx` | 116 |
| `toNumberOrNull` | Function | `frontend/src/components/part-num/AddPartNumDialog.tsx` | 54 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandleFile → ToStrOrEmpty` | intra_community | 4 |
| `HandleFile → NormalizeHeader` | intra_community | 4 |
| `HandleFile → ToNumberOrNull` | intra_community | 4 |
| `HandleSubmit → ToNumberOrNull` | intra_community | 3 |

## How to Explore

1. `context({name: "handleFile"})` — see callers and callees
2. `query({search_query: "part-num"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
