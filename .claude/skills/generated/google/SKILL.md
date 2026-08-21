---
name: google
description: "Skill for the Google area of Order-management. 5 symbols across 2 files."
---

# Google

5 symbols | 2 files | Cohesion: 89%

## When to Use

- Working with code in `frontend/`
- Understanding how initGoogleAccounts, promptGoogleOneTap, cancelGoogleOneTap work
- Modifying google-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/lib/google/oneTap.ts` | loadGisScript, initGoogleAccounts, promptGoogleOneTap, cancelGoogleOneTap |
| `frontend/src/lib/hooks/useGoogleOneTap.ts` | useGoogleOneTap |

## Entry Points

Start here when exploring this area:

- **`initGoogleAccounts`** (Function) — `frontend/src/lib/google/oneTap.ts:67`
- **`promptGoogleOneTap`** (Function) — `frontend/src/lib/google/oneTap.ts:86`
- **`cancelGoogleOneTap`** (Function) — `frontend/src/lib/google/oneTap.ts:93`
- **`useGoogleOneTap`** (Function) — `frontend/src/lib/hooks/useGoogleOneTap.ts:23`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `initGoogleAccounts` | Function | `frontend/src/lib/google/oneTap.ts` | 67 |
| `promptGoogleOneTap` | Function | `frontend/src/lib/google/oneTap.ts` | 86 |
| `cancelGoogleOneTap` | Function | `frontend/src/lib/google/oneTap.ts` | 93 |
| `useGoogleOneTap` | Function | `frontend/src/lib/hooks/useGoogleOneTap.ts` | 23 |
| `loadGisScript` | Function | `frontend/src/lib/google/oneTap.ts` | 34 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `LandingPage → LoadGisScript` | cross_community | 4 |
| `LandingPage → PromptGoogleOneTap` | cross_community | 3 |
| `LandingPage → CancelGoogleOneTap` | cross_community | 3 |

## How to Explore

1. `context({name: "initGoogleAccounts"})` — see callers and callees
2. `query({search_query: "google"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
