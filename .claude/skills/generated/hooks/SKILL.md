---
name: hooks
description: "Skill for the Hooks area of Order-management. 6 symbols across 1 files."
---

# Hooks

6 symbols | 1 files | Cohesion: 100%

## When to Use

- Working with code in `frontend/`
- Understanding how useCursorPagination, loadPage, prev work
- Modifying hooks-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/lib/hooks/useCursorPagination.ts` | useCursorPagination, loadPage, prev, next, jumpTo (+1) |

## Entry Points

Start here when exploring this area:

- **`useCursorPagination`** (Function) — `frontend/src/lib/hooks/useCursorPagination.ts:32`
- **`loadPage`** (Function) — `frontend/src/lib/hooks/useCursorPagination.ts:56`
- **`prev`** (Function) — `frontend/src/lib/hooks/useCursorPagination.ts:89`
- **`next`** (Function) — `frontend/src/lib/hooks/useCursorPagination.ts:97`
- **`jumpTo`** (Function) — `frontend/src/lib/hooks/useCursorPagination.ts:103`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useCursorPagination` | Function | `frontend/src/lib/hooks/useCursorPagination.ts` | 32 |
| `loadPage` | Function | `frontend/src/lib/hooks/useCursorPagination.ts` | 56 |
| `prev` | Function | `frontend/src/lib/hooks/useCursorPagination.ts` | 89 |
| `next` | Function | `frontend/src/lib/hooks/useCursorPagination.ts` | 97 |
| `jumpTo` | Function | `frontend/src/lib/hooks/useCursorPagination.ts` | 103 |
| `retry` | Function | `frontend/src/lib/hooks/useCursorPagination.ts` | 119 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `JumpTo → LoadPage` | intra_community | 3 |

## How to Explore

1. `context({name: "useCursorPagination"})` — see callers and callees
2. `query({search_query: "hooks"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
