# RULES.md — Application Flow & Implementation Rules

This document is the authoritative spec for the Order Management app's flow, routing, role system, component structure, and backend contracts. All frontend code MUST follow these rules alongside the visual system defined in `DESIGN.md` (Logistics Core).

---

## 1. Auth & Role Flow

```
/ (LoginPage) → enter username → mock role lookup → navigate to /dashboard
```

- **3 roles:** `PO`, `Sale`, `Manufacture`
- **Mock auth (frontend-only for MVP):** username maps to a role.
  - Username `po` → role `PO`
  - Username `sale` → role `Sale`
  - Username `mfg` → role `Manufacture`
  - Any other username → error toast, stay on login
- Password field is present but not validated in MVP (any value accepted).
- Role is stored in:
  - `AuthContext` (React context) for the session
  - `localStorage` key `om_role` for persistence across refresh
- On app load, `AuthContext` hydrates role from `localStorage`. If present, user is considered authenticated.
- **Logout:** clears `AuthContext` + removes `om_role` from `localStorage` + navigates to `/`.

### Route Guards
- `ProtectedRoute` wraps `/dashboard` — if no role in context, redirect to `/`.
- `LoginPage` at `/` and `/login` — if role already in context, redirect to `/dashboard`.

---

## 2. Route Map

```
/                          → LoginPage (public)
/login                     → LoginPage (public, redirect to /dashboard if authed)
/dashboard                 → ProtectedRoute → Dashboard layout
  /dashboard/inventory     → Inventory.jsx (PO + Manufacture)
  /dashboard/packing-list  → PackingList.jsx (Sale)
*                          → NotFound
```

- `Dashboard.jsx` uses react-router `<Outlet>` to render the active sub-page.
- Default redirect on `/dashboard` (index route):
  - PO / Manufacture → `/dashboard/inventory`
  - Sale → `/dashboard/packing-list`
- Role-gated pages:
  - Inventory only renders for `PO` and `Manufacture`. If `Sale` visits `/dashboard/inventory`, redirect to `/dashboard/packing-list`.
  - Packing List only renders for `Sale`. If `PO`/`Manufacture` visit `/dashboard/packing-list`, redirect to `/dashboard/inventory`.

---

## 3. Dashboard Layout (`Dashboard.jsx`)

Per **DESIGN.md** (Logistics Core):

### Sidebar (left, fixed 240px)
- Background: `surface-container-low` `#f3f4f6` (or `surface` `#f8f9fb`)
- Right border: 1px solid `outline-variant` `#c3c6d6`
- Top: app name/logo (headline-md, `on-surface` `#191c1e`)
- Menu items:
  - Icon (lucide-react) + label, `body-md`, 48px row height (standard density)
  - Hover: `surface-container` `#edeef0` background
  - Active: `#DEEBFF` background + `primary` `#003d9b` text + 2px `primary` left border
  - Inactive: `on-surface-variant` `#434654` text
- Bottom: Logout item (LogOut icon) — clears auth, navigates to `/`
- Menu items per role:
  - `PO`: Inventory
  - `Manufacture`: Inventory
  - `Sale`: Packing List

### Header (top bar)
- Full width, 48px height, `surface-container-lowest` `#ffffff` background
- Bottom border: 1px solid `outline-variant` `#c3c6d6`
- Left: current page title (headline-md)
- Right: role badge (StatusBadge pill showing `PO` / `Sale` / `Manufacture`) + user avatar placeholder
- Background and text colors from DESIGN.md `surface` / `on-surface` tokens

### Main Content
- Fills remaining space to the right of sidebar and below header
- Padding: 24px (`container-padding` from DESIGN.md)
- Background: `background` `#f8f9fb`
- Renders `<Outlet />` for the active sub-route

---

## 4. Component Tree

```
src/
├── context/
│   └── AuthContext.jsx       # createContext: role, login(username), logout()
├── pages/
│   ├── LoginPage.jsx         # modified: mock auth, navigate to /dashboard
│   ├── Dashboard.jsx         # NEW: layout shell (sidebar + header + outlet)
│   ├── Inventory.jsx         # NEW: data table CRUD (PO / Manufacture)
│   ├── PackingList.jsx       # NEW: data table CRUD (Sale)
│   └── NotFound.jsx          # existing
├── components/
│   ├── Sidebar.jsx           # NEW: role-gated menu, per DESIGN.md
│   ├── Header.jsx            # rewritten: role badge, logout
│   ├── DataTable.jsx         # NEW: sticky header, sortable, row hover
│   ├── StatusBadge.jsx       # NEW: pill-shaped, tinted bg
│   ├── ActionToolbar.jsx     # NEW: search, filter chips, primary CTA
│   └── ui/                   # existing shadcn components
├── lib/
│   ├── axios.js              # existing (add auth header later)
│   ├── roles.js              # NEW: role enum, menu map, permissions
│   ├── data.js               # existing (FilterType)
│   └── utils.js              # existing (cn)
└── App.jsx                   # rewritten: routes updated to match map above
```

---

## 5. Page Content Specs

### Inventory Page (PO + Manufacture)

**Action Toolbar** (above table):
- Search input (outlined, 2px primary focus ring per DESIGN.md)
- Filter chips: All / Submitted / Confirmed (reuse `lib/data.js` `FilterType`)
- Primary CTA button: "Create Order" (primary `#003d9b` bg, `on-primary` `#ffffff` text, 0.25rem radius)

**Data Table**:
| Column | Type | Alignment | Notes |
|--------|------|-----------|-------|
| SKU / ID | text | left | JetBrains Mono (`label-md`) |
| Name | text | left | `body-md` |
| Quantity | number | right | `body-md` |
| Status | badge | left | StatusBadge (pill) |
| Created | date | left | `body-sm` |
| Actions | buttons | right | Edit / Delete icons |

- Sticky header (`table-header` style: Inter 12px 700)
- Row hover: `surface-container-low` `#f3f4f6`
- Row height: 48px (standard density)
- Inline edit toggle on row (like current TaskCard pattern)
- Delete with confirmation toast
- Empty state: muted icon + message, `on-surface-variant` text

### Packing List Page (Sale)

**Action Toolbar**:
- Search input
- Filter chips: All / Pending / Shipped
- Primary CTA button: "Create Packing List"

**Data Table**:
| Column | Type | Alignment | Notes |
|--------|------|-----------|-------|
| PL Number | text | left | JetBrains Mono (`label-md`) |
| Customer | text | left | `body-md` |
| Items Count | number | right | `body-md` |
| Status | badge | left | StatusBadge (pill) |
| Created | date | left | `body-sm` |
| Actions | buttons | right | View / Edit / Delete |

- Same table behavior as Inventory (sticky header, hover, CRUD, empty state)

---

## 6. Stale Files to Remove

| File | Reason |
|------|--------|
| `pages/Homepage.jsx` | Replaced by `Dashboard.jsx` |
| `pages/Manufacture.jsx` | Stub — feature pages handle role views |
| `pages/Production.jsx` | Empty, dead |
| `pages/Sales.jsx` | Empty, dead |
| `components/Addtask.jsx` | Replaced by `ActionToolbar` + Inventory form |
| `components/StatsAndFilters.jsx` | Replaced by `ActionToolbar` |
| `components/TaskList.jsx` | Replaced by `DataTable` in Inventory |
| `components/TaskCard.jsx` | Replaced by `DataTable` rows |
| `components/TaskListPag.jsx` | Stub — replaced by `ui/pagination` integration |
| `components/DateTimeFilter.jsx` | Stub — unused |
| `components/Footer.jsx` | Stub — removed from layout |
| `components/PO.jsx` | Replaced by Inventory / PackingList pages |
| `components/TaskEmptyState.jsx` | Replaced by inline empty state in DataTable |

---

## 7. Backend API Contracts

### Auth (new — not yet implemented)

```
POST /api/auth/login
  Request:
    Body: { username: string, password: string }
  Response 200:
    { role: "PO" | "Sale" | "Manufacture", token: string }
  Response 401:
    { error: "Invalid credentials" }
```

MVP uses mock auth on the frontend. When backend is ready, swap `login()` in `AuthContext` to call this endpoint and store the returned JWT.

### Inventory (new — replaces /api/tasks)

```
GET    /api/inventory          → 200 { items: InventoryItem[] }
POST   /api/inventory          → 201 { item: InventoryItem }
PUT    /api/inventory/:id      → 200 { item: InventoryItem }
DELETE /api/inventory/:id      → 200 { message: "..." }
```

**InventoryItem schema:**
```json
{
  "_id": "string",
  "sku": "string",
  "name": "string",
  "quantity": "number",
  "status": "submitted" | "confirmed",
  "createdAt": "ISO-date-string"
}
```

### Packing List (new)

```
GET    /api/packing-list       → 200 { lists: PackingListItem[] }
POST   /api/packing-list       → 201 { list: PackingListItem }
PUT    /api/packing-list/:id   → 200 { list: PackingListItem }
DELETE /api/packing-list/:id   → 200 { message: "..." }
```

**PackingListItem schema:**
```json
{
  "_id": "string",
  "plNumber": "string",
  "customer": "string",
  "itemsCount": "number",
  "status": "pending" | "shipped",
  "createdAt": "ISO-date-string"
}
```

### MongoDB Models (for backend implementation)

```js
// models/Inventory.js
{ sku: String, name: String, quantity: Number, status: { type: String, enum: ['submitted', 'confirmed'] }, createdAt: { type: Date, default: Date.now } }

// models/PackingList.js
{ plNumber: String, customer: String, itemsCount: Number, status: { type: String, enum: ['pending', 'shipped'] }, createdAt: { type: Date, default: Date.now } }
```

---

## 8. DESIGN.md Cross-Reference

Every component references specific sections of `DESIGN.md`:

| Component | DESIGN.md Section | Key Tokens |
|-----------|-------------------|------------|
| Sidebar | Layout & Spacing, Lists | 240px fixed, active `#DEEBFF` bg + primary text + 2px left border |
| Header | Elevation & Depth | 48px height, white surface, 1px bottom border |
| DataTable | Data Tables, Typography | Sticky header, sortable, row hover, `table-header` style, `body-md` rows |
| StatusBadge | Status Badges, Shapes | Pill (`rounded.full`), tinted bg + dark text |
| ActionToolbar | Action Toolbars | Search + filter chips + primary CTA, secondary for bulk actions |
| Input Fields | Input Fields | Outlined, 2px primary focus ring, red error border |
| Colors (all) | Colors | primary `#003d9b`, surface `#f8f9fb`, borders `#c3c6d6`, text `#191c1e` / `#434654` |
| Typography (all) | Typography | Inter for body/headlines, JetBrains Mono for IDs/SKUs |
| Spacing (all) | Layout & Spacing | 4px base unit, 16px gutters, 24px container padding |

---

## 9. State Management

- **`AuthContext`** — provides `{ role, login(username), logout() }` to the entire app via a provider in `App.jsx`.
- **Role enum** in `lib/roles.js`:
  ```js
  export const ROLES = { PO: 'PO', SALE: 'Sale', MANUFACTURE: 'Manufacture' };
  ```
- **Menu map** in `lib/roles.js`:
  ```js
  export const MENU_BY_ROLE = {
    PO:          [{ label: 'Inventory', path: '/dashboard/inventory', icon: 'Package' }],
    Manufacture: [{ label: 'Inventory', path: '/dashboard/inventory', icon: 'Package' }],
    Sale:        [{ label: 'Packing List', path: '/dashboard/packing-list', icon: 'ClipboardList' }],
  };
  ```
- **Permissions** in `lib/roles.js`:
  ```js
  export const canAccess = (role, path) => { /* check MENU_BY_ROLE */ };
  ```
- No global state library (Redux/Zustand) for MVP. Page-level state (`useState`) for table data, filters, search. Lift to context only if sharing across pages becomes necessary.

---

## 10. Implementation Order

1. Create `lib/roles.js` — role enum + menu map + `canAccess`
2. Create `context/AuthContext.jsx` — role + `login(username)` + `logout()`
3. Rewrite `LoginPage.jsx` — mock username-to-role lookup, navigate to `/dashboard`
4. Rewrite `App.jsx` — new routes, `ProtectedRoute` wrapper, `AuthContext` provider, `<Outlet>` layout
5. Create `components/Sidebar.jsx` — role-gated menu per DESIGN.md
6. Rewrite `components/Header.jsx` — role badge + logout
7. Create `pages/Dashboard.jsx` — sidebar + header + `<Outlet>`
8. Create `components/DataTable.jsx` — generic table (props: columns, data, onEdit, onDelete)
9. Create `components/StatusBadge.jsx` — pill badge (props: status, variant)
10. Create `components/ActionToolbar.jsx` — search + filter chips + CTA (props: search, setSearch, filters, onCTA)
11. Create `pages/Inventory.jsx` — wired with mock data, uses DataTable + ActionToolbar + StatusBadge
12. Create `pages/PackingList.jsx` — wired with mock data, same component pattern
13. Delete stale files (section 6)
14. When backend endpoints exist → swap mock data for real API calls via `lib/axios.js`

---

## 11. Open Items

- **Reference image** (`ref-dashboard.png`) — visual details to be refined when image review is available. Current rules rely on `DESIGN.md` only.
- **Backend auth** — mock on frontend for MVP. Real `/api/auth/login` + JWT + middleware is a follow-up backend task.
- **Dashboard home/overview** — not in MVP. Each role lands directly on their feature page. Can add a summary overview later.
