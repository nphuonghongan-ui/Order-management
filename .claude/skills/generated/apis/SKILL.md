---
name: apis
description: "Skill for the Apis area of Order-management. 18 symbols across 9 files."
---

# Apis

18 symbols | 9 files | Cohesion: 94%

## When to Use

- Working with code in `frontend/`
- Understanding how validateItem, validateHeader, toSubmitPayload work
- Modifying apis-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/lib/apis/poApi.ts` | toSubmitPayload, submitPO, extractSubmitError |
| `frontend/src/components/po/utils.ts` | validateItem, validateHeader |
| `frontend/src/pages/NewOrder.tsx` | validate, handleSubmit |
| `frontend/src/lib/apis/api.ts` | isAxiosError, extractErrorMessage |
| `frontend/src/lib/apis/packingListApi.ts` | submitPackingList, updatePackingList |
| `frontend/src/pages/PackingList.tsx` | applyUpdated, handleSave |
| `frontend/src/lib/apis/notificationApi.ts` | sendUrgeUpdate, notifyManufactureQtyMismatch |
| `frontend/src/components/notification/NotifyManufactureDialog.tsx` | reset, handleSend |
| `frontend/src/pages/NewPackingList.tsx` | handleSubmit |

## Entry Points

Start here when exploring this area:

- **`validateItem`** (Function) — `frontend/src/components/po/utils.ts:36`
- **`validateHeader`** (Function) — `frontend/src/components/po/utils.ts:48`
- **`toSubmitPayload`** (Function) — `frontend/src/lib/apis/poApi.ts:46`
- **`submitPO`** (Function) — `frontend/src/lib/apis/poApi.ts:64`
- **`extractSubmitError`** (Function) — `frontend/src/lib/apis/poApi.ts:76`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `validateItem` | Function | `frontend/src/components/po/utils.ts` | 36 |
| `validateHeader` | Function | `frontend/src/components/po/utils.ts` | 48 |
| `toSubmitPayload` | Function | `frontend/src/lib/apis/poApi.ts` | 46 |
| `submitPO` | Function | `frontend/src/lib/apis/poApi.ts` | 64 |
| `extractSubmitError` | Function | `frontend/src/lib/apis/poApi.ts` | 76 |
| `validate` | Function | `frontend/src/pages/NewOrder.tsx` | 180 |
| `handleSubmit` | Function | `frontend/src/pages/NewOrder.tsx` | 219 |
| `isAxiosError` | Function | `frontend/src/lib/apis/api.ts` | 5 |
| `extractErrorMessage` | Function | `frontend/src/lib/apis/api.ts` | 14 |
| `submitPackingList` | Function | `frontend/src/lib/apis/packingListApi.ts` | 29 |
| `updatePackingList` | Function | `frontend/src/lib/apis/packingListApi.ts` | 36 |
| `handleSubmit` | Function | `frontend/src/pages/NewPackingList.tsx` | 79 |
| `applyUpdated` | Function | `frontend/src/pages/PackingList.tsx` | 320 |
| `handleSave` | Function | `frontend/src/pages/PackingList.tsx` | 414 |
| `sendUrgeUpdate` | Function | `frontend/src/lib/apis/notificationApi.ts` | 39 |
| `notifyManufactureQtyMismatch` | Function | `frontend/src/lib/apis/notificationApi.ts` | 90 |
| `reset` | Function | `frontend/src/components/notification/NotifyManufactureDialog.tsx` | 93 |
| `handleSend` | Function | `frontend/src/components/notification/NotifyManufactureDialog.tsx` | 98 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Render → IsAxiosError` | cross_community | 5 |
| `PackingList → IsAxiosError` | cross_community | 4 |
| `HandleSubmit → ValidateItem` | intra_community | 3 |
| `HandleSubmit → ValidateHeader` | intra_community | 3 |
| `HandleSave → IsAxiosError` | intra_community | 3 |
| `HandleSubmit → IsAxiosError` | intra_community | 3 |

## How to Explore

1. `context({name: "validateItem"})` — see callers and callees
2. `query({search_query: "apis"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
