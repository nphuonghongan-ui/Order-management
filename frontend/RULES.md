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
  /dashboard/inventory         → Inventory.jsx (PO + Manufacture)
  /dashboard/packing-list      → PackingList.jsx (Sale)
  /dashboard/packing-list/new  → NewPackingList.jsx (Sale)
*                             → NotFound
```

- `Dashboard.jsx` uses react-router `<Outlet>` to render the active sub-page.
- Default redirect on `/dashboard` (index route):
  - PO / Manufacture → `/dashboard/inventory`
  - Sale → `/dashboard/packing-list`
- Role-gated pages:
  - Inventory only renders for `PO` and `Manufacture`. If `Sale` visits `/dashboard/inventory`, redirect to `/dashboard/packing-list`.
  - Packing List only renders for `Sale`. If `PO`/`Manufacture` visit `/dashboard/packing-list`, redirect to `/dashboard/inventory`.
  - New Packing List (`/dashboard/packing-list/new`) is a nested route under the Packing List page. Same `Sale`-only guard.

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
│   ├── NewPackingList.jsx    # NEW: form + item picker (Sale)
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

**Action Toolbar** (above table):
- Search input (filters by PL Number, Customer, Recipient)
- Primary CTA button: "New Packing List" → navigates to `/dashboard/packing-list/new`

**Data Table**:
| Column | Type | Alignment | Notes |
|--------|------|-----------|-------|
| PL Number | text | left | JetBrains Mono (`label-md`); created date as `body-sm` subline |
| Customer | text | left | `body-md`; contact name as `body-sm` subline |
| Items | number | right | `body-md` JetBrains Mono; total units as `body-sm` subline |
| Total | currency | right | `body-md` JetBrains Mono, primary color, bold |
| Deliver To | text | left | recipient name `body-md`; address as `body-sm` subline |
| Actions | buttons | right | View (opens detail `Sheet`) / Delete (with toast) |

- Same table behavior as Inventory (sticky header, hover, CRUD, empty state)
- **No status column and no filter chips.** A packing list is created the moment the user clicks Submit on the New form — there is no draft state, so no "All / Pending / Shipped" filters are needed.
- Row click target is the chevron button only (not the whole row), matching the `MyLines` detail-drawer pattern.
- Detail `Sheet` (right side) shows: Customer block (name / contact / email / address), Delivery block (recipient / address / expected date / notes), Items table (part / qty / amount + line total), Delete action.

### New Packing List Page (Sale)

A nested route at `/dashboard/packing-list/new`. Same `Sale`-only guard as the index page. Sub-page lives in the Dashboard `<Outlet />` (gets the standard Sidebar + Header from `Dashboard.tsx`).

**Form sections** (each rendered as a `Card` with icon, title, description header — same pattern as `NewOrder`):

| Section | Card icon | Fields |
|---------|-----------|--------|
| Customer Information | `Building2` | Company / Customer Name (required), Contact Person, Address (required), Email |
| Delivery Information | `MapPin` | Recipient Name (required), Expected Delivery Date, Delivery Address (required), Notes |
| Order Details | `ClipboardCheck` | Item picker (search + shuttle transfer + confirm), running total, line-item table with per-row remove |

- Each field uses `components/po/Field` (label + required indicator + error) wrapping shadcn `Input`.
- The Order Details section is empty until the user opens the Item Picker.

**Item Picker** (a shadcn `Dialog`):

- Modal with title "Pick Items" and description "Select items on the left · use arrows to transfer · confirm when ready".
- Two list panes inside a `Card`-like container:
  - **Available Lines** (left): sourced from `GET /api/line-items` (same endpoint `MyLines` uses), filtered client-side by search (part / PO / ship-to). Each row shows part number (mono), PO pill, mode icon, ship-to, qty, unit price, total.
  - **Packing List** (right): the user's currently-picked items. Each row shows part number (mono), mode icon, ship-to, qty, unit price, line total. Subtotal in the footer.
- Four transfer buttons in a vertical column between the panes: `›` (move selected right), `»` (move all right), `‹` (remove selected), `«` (remove all). Each is a shadcn `Button size="icon-sm" variant="outline"`.
- Footer: `Cancel` (outline) + `Confirm (n)` (primary, disabled when `n === 0`).
- Clicking a row toggles its selection; selected rows use `bg-primary/10` and hover uses `bg-muted` (matches the `DataTable` row-hover convention).

**PL Number generation** is client-side (`PL-YYYY-NNNN`) until the backend exposes `GET /api/packing-list/next-pl-num`; then swap to that endpoint (same pattern as `fetchNextPONum` in `lib/poApi.ts`).

**Submit button** is enabled only when:
- `picked.length > 0` (at least one item picked)
- `customer.name` and `customer.address` are non-empty
- `delivery.name` and `delivery.address` are non-empty

On submit:
- `POST /api/packing-list` with `{ customer, delivery, items }` payload.
- On success: success screen with PL number + items count + total, plus a "Back to Packing Lists" button that navigates to `/dashboard/packing-list`. Toast: `Packing list submitted`.
- On error: error banner above the form, toast: backend message. Form values preserved.

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

### Packing List

```
GET    /api/packing-list       → 200 { lists: PackingListRecord[] }
GET    /api/packing-list/:id   → 200 { list: PackingListRecord }
POST   /api/packing-list       → 201 { list: PackingListRecord }
DELETE /api/packing-list/:id   → 200 { message: "..." }
```

**PackingListRecord schema:**
```json
{
  "_id": "string",
  "plNumber": "string",
  "customer": {
    "name": "string",
    "address": "string",
    "contact": "string",
    "email": "string"
  },
  "delivery": {
    "name": "string",
    "address": "string",
    "shipDate": "ISO-date-string (yyyy-mm-dd)",
    "notes": "string"
  },
  "items": [
    {
      "lineId": "string",
      "poNum": "string",
      "partNum": "string",
      "shipToNum": "string",
      "mode": "SEA" | "AIR" | "ROAD" | "RAIL",
      "qty": "number",
      "unitPrice": "number"
    }
  ],
  "itemsCount": "number",
  "total": "number",
  "createdAt": "ISO-date-string"
}
```

**POST body** (`SubmitPackingListPayload`):
```json
{
  "customer":  { "name": "string", "address": "string", "contact": "string", "email": "string" },
  "delivery":  { "name": "string", "address": "string", "shipDate": "yyyy-mm-dd", "notes": "string" },
  "items": [
    { "lineId": "string", "poNum": "string", "partNum": "string", "shipToNum": "string",
      "mode": "SEA|AIR|ROAD|RAIL", "qty": "number", "unitPrice": "number" }
  ]
}
```

The response's `itemsCount` and `total` are server-computed (sum of `items.length` and `sum(qty * unitPrice)` respectively). The client also computes these locally for the running total in the form.

> **No `status` field.** Earlier drafts of this contract had `status: "pending" | "shipped"`, but the Sale flow creates a packing list on submit with no intermediate states, so the field was removed. If a post-submit "shipped" state is needed later, reintroduce it as a separate `PATCH /api/packing-list/:id` endpoint (do not bake status into the create response).

### MongoDB Models (for backend implementation)

```js
// models/Inventory.js
{ sku: String, name: String, quantity: Number, status: { type: String, enum: ['submitted', 'confirmed'] }, createdAt: { type: Date, default: Date.now } }

// models/PackingList.js
{
  plNumber:    { type: String, required: true, unique: true, index: true },
  customer: {
    name:    { type: String, required: true },
    address: { type: String, required: true },
    contact: String,
    email:   String,
  },
  delivery: {
    name:     { type: String, required: true },
    address:  { type: String, required: true },
    shipDate: String,
    notes:    String,
  },
  items: [{
    lineId:    { type: mongoose.Schema.Types.ObjectId, ref: 'LineItem', required: true },
    poNum:     String,
    partNum:   String,
    shipToNum: String,
    mode:      { type: String, enum: ['SEA', 'AIR', 'ROAD', 'RAIL'] },
    qty:       { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  }],
  itemsCount: { type: Number, required: true },
  total:      { type: Number, required: true },
  createdAt:  { type: Date, default: Date.now, index: true },
}
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

---

## 12. Backend Naming Conventions

### 12.1 MongoDB collection names must be `snake_case`

All Mongoose `collection` names in the `schema` options (or auto-pluralized model names) must use `snake_case` (lowercase words separated by underscores).

| Model | Collection | Notes |
|-------|-----------|-------|
| `Account` | `accounts` | |
| `Item` | `items` | |
| `PackingList` | `packing_lists` | |
| `RefreshToken` | `refresh_tokens` | |
| `PartNum` | `part_nums` | |
| `SeedDataHistory` | `seed_data_histories` | |

**When creating a new model**, always set an explicit `collection: 'snake_case_name'` in the schema options to avoid Mongoose's default pluralization surprises.
