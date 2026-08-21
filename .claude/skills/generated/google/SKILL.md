---
name: google
description: "Skill for the Google area of Order-management. 12 symbols across 4 files."
---

# Google

12 symbols | 4 files | Cohesion: 87%

## When to Use

- Working with code in `frontend/`
- Understanding how initGoogleAccounts, promptGoogleOneTap, cancelGoogleOneTap work
- Modifying google-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/google/GoogleSignInButton.tsx` | OAuthSignInButton, GoogleSignInButton, GoogleLogo, buildStartUrl, href |
| `frontend/src/lib/google/oneTap.ts` | loadGisScript, initGoogleAccounts, promptGoogleOneTap, cancelGoogleOneTap |
| `frontend/src/pages/LoginPage.tsx` | LoginPage, inputBorder |
| `frontend/src/lib/hooks/useGoogleOneTap.ts` | useGoogleOneTap |

## Entry Points

Start here when exploring this area:

- **`initGoogleAccounts`** (Function) — `frontend/src/lib/google/oneTap.ts:67`
- **`promptGoogleOneTap`** (Function) — `frontend/src/lib/google/oneTap.ts:86`
- **`cancelGoogleOneTap`** (Function) — `frontend/src/lib/google/oneTap.ts:93`
- **`useGoogleOneTap`** (Function) — `frontend/src/lib/hooks/useGoogleOneTap.ts:23`
- **`OAuthSignInButton`** (Function) — `frontend/src/components/google/GoogleSignInButton.tsx:17`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `initGoogleAccounts` | Function | `frontend/src/lib/google/oneTap.ts` | 67 |
| `promptGoogleOneTap` | Function | `frontend/src/lib/google/oneTap.ts` | 86 |
| `cancelGoogleOneTap` | Function | `frontend/src/lib/google/oneTap.ts` | 93 |
| `useGoogleOneTap` | Function | `frontend/src/lib/hooks/useGoogleOneTap.ts` | 23 |
| `OAuthSignInButton` | Function | `frontend/src/components/google/GoogleSignInButton.tsx` | 17 |
| `GoogleSignInButton` | Function | `frontend/src/components/google/GoogleSignInButton.tsx` | 55 |
| `LoginPage` | Function | `frontend/src/pages/LoginPage.tsx` | 10 |
| `inputBorder` | Function | `frontend/src/pages/LoginPage.tsx` | 34 |
| `href` | Function | `frontend/src/components/google/GoogleSignInButton.tsx` | 24 |
| `loadGisScript` | Function | `frontend/src/lib/google/oneTap.ts` | 34 |
| `GoogleLogo` | Function | `frontend/src/components/google/GoogleSignInButton.tsx` | 59 |
| `buildStartUrl` | Function | `frontend/src/components/google/GoogleSignInButton.tsx` | 5 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `LandingPage → LoadGisScript` | cross_community | 4 |
| `LoginPage → GoogleLogo` | intra_community | 4 |
| `LandingPage → PromptGoogleOneTap` | cross_community | 3 |
| `LandingPage → CancelGoogleOneTap` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Pages | 1 calls |
| Stores | 1 calls |

## How to Explore

1. `context({name: "initGoogleAccounts"})` — see callers and callees
2. `query({search_query: "google"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
