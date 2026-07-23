---
name: notification
description: "Skill for the Notification area of Order-management. 12 symbols across 3 files."
---

# Notification

12 symbols | 3 files | Cohesion: 92%

## When to Use

- Working with code in `frontend/`
- Understanding how getInitials, getAvatarColor, markAllRead work
- Modifying notification-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/notification/NotificationBell.tsx` | formatRelative, NotificationRow, NotificationList, markAllReadLocal, handleMarkAll (+2) |
| `frontend/src/components/notification/avatar.ts` | hashName, getInitials, getAvatarColor |
| `frontend/src/lib/apis/notificationApi.ts` | markAllRead, deleteNotification |

## Entry Points

Start here when exploring this area:

- **`getInitials`** (Function) — `frontend/src/components/notification/avatar.ts:19`
- **`getAvatarColor`** (Function) — `frontend/src/components/notification/avatar.ts:28`
- **`markAllRead`** (Function) — `frontend/src/lib/apis/notificationApi.ts:56`
- **`markAllReadLocal`** (Function) — `frontend/src/components/notification/NotificationBell.tsx:224`
- **`handleMarkAll`** (Function) — `frontend/src/components/notification/NotificationBell.tsx:254`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getInitials` | Function | `frontend/src/components/notification/avatar.ts` | 19 |
| `getAvatarColor` | Function | `frontend/src/components/notification/avatar.ts` | 28 |
| `markAllRead` | Function | `frontend/src/lib/apis/notificationApi.ts` | 56 |
| `markAllReadLocal` | Function | `frontend/src/components/notification/NotificationBell.tsx` | 224 |
| `handleMarkAll` | Function | `frontend/src/components/notification/NotificationBell.tsx` | 254 |
| `deleteNotification` | Function | `frontend/src/lib/apis/notificationApi.ts` | 63 |
| `removeOne` | Function | `frontend/src/components/notification/NotificationBell.tsx` | 225 |
| `handleDelete` | Function | `frontend/src/components/notification/NotificationBell.tsx` | 271 |
| `hashName` | Function | `frontend/src/components/notification/avatar.ts` | 11 |
| `formatRelative` | Function | `frontend/src/components/notification/NotificationBell.tsx` | 29 |
| `NotificationRow` | Function | `frontend/src/components/notification/NotificationBell.tsx` | 44 |
| `NotificationList` | Function | `frontend/src/components/notification/NotificationBell.tsx` | 177 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `NotificationList → HashName` | intra_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 1 calls |

## How to Explore

1. `context({name: "getInitials"})` — see callers and callees
2. `query({search_query: "notification"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
