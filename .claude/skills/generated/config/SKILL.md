---
name: config
description: "Skill for the Config area of Order-management. 5 symbols across 3 files."
---

# Config

5 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how connectDB, autoSeed work
- Modifying config-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/config/db.js` | switchingDns, connectDB |
| `backend/src/config/seed.js` | runSeedIfNeeded, autoSeed |
| `backend/src/seeds/accounts.seed.js` | main |

## Entry Points

Start here when exploring this area:

- **`connectDB`** (Function) — `backend/src/config/db.js:10`
- **`autoSeed`** (Function) — `backend/src/config/seed.js:59`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `connectDB` | Function | `backend/src/config/db.js` | 10 |
| `autoSeed` | Function | `backend/src/config/seed.js` | 59 |
| `switchingDns` | Function | `backend/src/config/db.js` | 6 |
| `main` | Function | `backend/src/seeds/accounts.seed.js` | 12 |
| `runSeedIfNeeded` | Function | `backend/src/config/seed.js` | 20 |

## How to Explore

1. `context({name: "connectDB"})` — see callers and callees
2. `query({search_query: "config"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
