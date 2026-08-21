# RULES.md — Application Flow & Implementation Rules

This document is the authoritative spec for the Order Management app's flow, routing, role system, component structure, and backend contracts. All frontend code MUST follow these rules alongside the visual system defined in `DESIGN.md` (Logistics Core).

All frontend web-storage keys and client-side identifiers MUST use the `om_` prefix, and all cookies MUST use the `__Host-<function>-<name>` pattern, so the application has a single, greppable namespace. The full list of identifiers is maintained in **§ 12. Backend Naming Conventions** and **§ 15. Frontend Token & Storage Naming**.

---

## 1. Auth & Role Flow

```
/ (LoginPage) → enter username/password OR click "Sign in with Google" →
  - username/password: POST /auth/login → accessToken (memory) + __Host-auth-refresh cookie (HttpOnly)
  - Google One-Tap: POST /auth/google/onetap → accessToken (memory) + __Host-auth-refresh cookie
  - Google OAuth: GET /auth/oauth?intent=google → Google consent → GET /auth/oauth/callback → __Host-auth-refresh cookie + /oauth/success
→ navigate to /dashboard
```

- **3 roles:** `PO`, `Sale`, `Manufacture`
- **Two Google paths + local, one session model:**
  - **Local:** `POST /auth/login` with `{ userName, password }` → returns `{ account, accessToken }` and sets the `__Host-auth-refresh` HttpOnly cookie. Access token is held in memory only (never persisted).
  - **Google One-Tap:** `POST /auth/google/onetap` with `{ credential }` (the JWT from `google.accounts.id`). Returns `{ account, accessToken }`, sets the `__Host-auth-refresh` cookie. No consent screen; only `openid email profile`.
  - **Google OAuth (authorization code flow, PKCE S256):**
    1. User clicks `GoogleSignInButton` (which is a thin wrapper over `<OAuthSignInButton intent="google" />`).
    2. Browser is redirected to `GET /api/auth/oauth?intent=google` — the backend sets a short-lived cookie `__Host-oauth-state` carrying an opaque CSRF `state` plus the `__Host-oauth-pkce-verifier` cookie, then 302-redirects to `accounts.google.com/o/oauth2/v2/auth` with the scopes from `GOOGLE_OAUTH_SCOPES` (default `openid email profile https://www.googleapis.com/auth/youtube.readonly`).
    3. Google redirects to `GET /api/auth/oauth/callback?code=...&state=...`. The backend verifies the `state` cookie matches the query `state`, recovers the provider from the cookie, exchanges `code` for an `id_token` via the provider's `exchangeCodeForTokens`, upserts the `Account`, and issues **AxonLog's own** `accessToken` + `__Host-auth-refresh` cookie (Google access/refresh tokens are NEVER stored).
    4. Browser lands on `/oauth/success#access_token=...&returnTo=%2Fdashboard%2Fmy-orders&role=<...>&provider=<...>` which calls `restoreSession()` (which internally calls `/auth/refresh` to mint an `accessToken` from the cookie), then `navigate("/dashboard/my-orders", { replace: true })`. The post-OAuth destination is **hard-coded** by the backend; `returnTo` is no longer accepted from the client.
  - **Future providers:** add a new module exporting `{ intent, buildAuthUrl, exchangeCodeForTokens, verifyIdentity, defaultScopes }` and register it in `backend/src/oauth/index.js`. Mirror the frontend config in `frontend/src/lib/oauth/providerEnv.ts` with the matching `VITE_<PROVIDER>_CLIENT_ID` env key. No controller changes required — `oauthStart` / `oauthCallback` dispatch via `getProvider(intent)`.
- **Role is stored in:**
  - `useAuthStore` (Zustand) `role` field for the session
- On app load, the role lives in zustand memory only; a page reload requires re-authentication or session restore.
- **Logout:** calls `POST /auth/logout` (revokes the refresh token family + clears the `__Host-auth-refresh` cookie), clears `useAuthStore`, and navigates to `/`.

### Route Guards
- `ProtectedRoute` wraps `/dashboard` — if no role in store, redirect to `/`.
- `PublicRoute` wraps `/` and `/login` — if role already in store, redirect to `/dashboard`.
- `PublicRouteAlways` wraps `/oauth/success` and `/oauth/error` — these routes render regardless of role; the success page itself calls `restoreSession()` and then redirects to the dashboard.

---

## 2. Route Map

```
/                          → LandingPage (public)
/login                     → LoginPage (public, redirect to /dashboard if authed)
/oauth/success       → OAuthSuccess (PublicRouteAlways)
/oauth/error         → OAuthError  (PublicRouteAlways)
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
│   ├── apis/                 # API clients (axios, poApi, packingListApi, etc.)
│   ├── hooks/                # custom hooks (useCursorPagination, useSaveShortcut)
│   ├── utils/                # utilities (utils.ts — cn helper)
│   ├── data.ts               # FilterType
│   ├── format.ts             # number/currency/date formatting
│   ├── motion.ts             # animation presets
│   ├── roles.ts              # role enum, menu map, permissions
│   └── socket.ts             # Socket.IO real-time client
└── App.jsx                   # rewritten: routes updated to match map above
```

---

## 5. Page Content Specs

### Inventory Page (PO + Manufacture)

**Action Toolbar** (above table):
- Search input (outlined, 2px primary focus ring per DESIGN.md)
- Filter chips: All / Submitted / Confirmed (reuse `lib/data.ts` `FilterType`)
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

**PL Number generation** is client-side (`PL-YYYY-NNNN`) until the backend exposes `GET /api/packing-list/next-pl-num`; then swap to that endpoint (same pattern as `fetchNextPONum` in `lib/apis/poApi.ts`).

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

### Auth

```
POST /api/auth/login
  Request:
    Body: { userName: string, password: string }
  Response 200:
    { account: AccountProfile, accessToken: string }
    Set-Cookie: __Host-auth-refresh=... (HttpOnly, SameSite=Lax, 7d)
  Response 401:
    { error: "Invalid credentials" }

POST /api/auth/google/onetap          # Google One-Tap ID-token sign-in
  Request: { credential: string }     # JWT from google.accounts.id
  Response 200: { account, accessToken }   Set-Cookie: __Host-auth-refresh
  Response 401: { error: "Invalid Google credential: …" }

GET  /api/auth/oauth?intent=<provider>
  Provider is dispatched via the `intent` query string (default `google`).
  Currently registered intents: `google`, `github` (stub).
  Response 302: redirect to the provider's consent screen
    Set-Cookie: __Host-oauth-state=... (HttpOnly, Secure, SameSite=Lax, 10m, opaque CSRF state)
    Set-Cookie: __Host-oauth-pkce-verifier=... (HttpOnly, Secure, SameSite=Lax, 10m, PKCE verifier)

GET  /api/auth/oauth/callback?code=...&state=...
  Single callback for ALL providers. The provider is recovered from the
  `__Host-oauth-state` cookie. The backend compares the `state` query
  parameter against the cookie's `stateId`, then dispatches to the
  registered strategy for the cookie's `provider`.
  Response 302:
    - success     → /oauth/success#access_token=...&returnTo=%2Fdashboard%2Fmy-orders&role=...&provider=<intent>
                    Set-Cookie: __Host-auth-refresh=...
    - error/deny  → /oauth/error?error=...&error_description=...

POST /api/auth/refresh
  Reads the `__Host-auth-refresh` cookie. Rotates the refresh family and returns
  a new access token. Set-Cookie: __Host-auth-refresh (rotated).

POST /api/auth/logout
  Revokes the refresh token family. Set-Cookie: __Host-auth-refresh (cleared).
  Returns 204.

GET  /api/auth/me
  Requires Authorization: Bearer <accessToken>. Returns { account }.
```

`AccountProfile`:
```json
{
  "customerCustId": "string",
  "userName": "string",
  "role": "PO" | "Sale" | "Manufacture",
  "authProvider": "local" | "google" | "both",
  "email": "string | null"
}
```

**Browser-swapping protection** (see §15):
- `/api/auth/oauth/callback` only accepts the callback if the
  `__Host-oauth-state` cookie is present and matches the `state` query
  parameter, and the `provider` carried in the cookie resolves to a
  registered strategy.
- Failure paths NEVER echo `code` or `state` to the SPA; they redirect to
  `/oauth/error` with only `error` and `error_description`.

**Adding a new OAuth provider:**
1. Backend: create `src/oauth/<provider>.js` exporting `{ intent, buildAuthUrl, exchangeCodeForTokens, verifyIdentity, defaultScopes }`. Register in `src/oauth/index.js`'s `providers` map.
2. Frontend: add `case` in `src/lib/oauth/providerEnv.ts`'s `resolveProviderConfig(intent)` and declare `VITE_<PROVIDER>_CLIENT_ID` in `.env.sample`.
3. No URL changes — `GET /api/auth/oauth?intent=<provider>` and `GET /api/auth/oauth/callback` accept any registered provider via the `provider` field encoded in the `__Host-oauth-state` cookie.

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
- **Role enum** in `lib/roles.ts`:
  ```js
  export const ROLES = { PO: 'PO', SALE: 'Sale', MANUFACTURE: 'Manufacture' };
  ```
- **Menu map** in `lib/roles.ts`:
  ```js
  export const MENU_BY_ROLE = {
    PO:          [{ label: 'Inventory', path: '/dashboard/inventory', icon: 'Package' }],
    Manufacture: [{ label: 'Inventory', path: '/dashboard/inventory', icon: 'Package' }],
    Sale:        [{ label: 'Packing List', path: '/dashboard/packing-list', icon: 'ClipboardList' }],
  };
  ```
- **Permissions** in `lib/roles.ts`:
  ```js
  export const canAccess = (role, path) => { /* check MENU_BY_ROLE */ };
  ```
- No global state library (Redux/Zustand) for MVP. Page-level state (`useState`) for table data, filters, search. Lift to context only if sharing across pages becomes necessary.

---

## 10. Implementation Order

1. Create `lib/roles.ts` — role enum + menu map + `canAccess`
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
14. When backend endpoints exist → swap mock data for real API calls via `lib/apis/axios.ts`

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
| `Order` | `orders` | |
| `PackingList` | `packing_lists` | |
| `RefreshToken` | `refresh_tokens` | |
| `PartNum` | `part_nums` | |
| `SeedDataHistory` | `seed_data_histories` | |

**When creating a new model**, always set an explicit `collection: 'snake_case_name'` in the schema options to avoid Mongoose's default pluralization surprises.

---

## 13. Data Table Column Standard — Line Items

Any data table that lists line items / order lines (across all roles and pages) MUST expose the following 13 columns, in this order, using the cell renderers from `frontend/src/components/po/lineItemColumns.tsx`. The source of truth is `buildColumns()` in `frontend/src/pages/MyOrders.tsx` plus the leading `poNum` column.

| # | Column | Cell renderer | Align |
|---|--------|---------------|-------|
| 1 | PO Number | `monoCell` | left |
| 2 | Part Num | `partNumCell` | left |
| 3 | Order Line | `monoCell` | right |
| 4 | Sell Qty | `monoCell(formatNumber)` | right |
| 5 | Qty per Cont | `monoCell(formatNumber)` | right |
| 6 | No. cont | `monoCell(formatNumber(calcContainers(...)))` | right |
| 7 | Unit Price | `currencyCell` | right |
| 8 | Total | `currencyCell({ bold: true, primary: true })` | right |
| 9 | Ship To | `monoCell` | left |
| 10 | Mode | `modePill` | left |
| 11 | Need By | `formatDisplay` | left |
| 12 | Request | `formatDisplay` | left |
| 13 | ExWork Date | `exWorkDateCell` | left |

- Use the shared `DataTable` component (`frontend/src/components/DataTable.tsx`) to render the table — it provides sticky header, sortable columns, and horizontal overflow out of the box.
- Page-specific columns (e.g., an action column with a chevron, an in-place editor) MAY be added on top of the 13 baseline columns, but none of the 13 above may be omitted from a line-item table.
- When a row lacks a field (e.g., a packing-list item that has no `exWorkDate` yet), render `—` via `formatDisplay` / the cell's null-handling — do not drop the column.
- Pickers, dialogs, and any other listing surface that shows line items (e.g., the Item Picker used in `NewPackingList`) MUST use the same 13 columns. Compact 4-cell grids are no longer permitted for line-item displays.

---

## 14. Cursor Style — Every Button

Every clickable button in the application MUST give the browser cursor the `pointer` style so users can see it is interactive.

- **Prefer the shared shadcn `<Button>` component** (`frontend/src/components/ui/button.tsx`). Its base class string includes `cursor-pointer` — every `<Button>` instance is compliant by construction.
- When you use a native `<button>` element (e.g. for a fully custom-styled icon button or a row-action trigger), add `cursor-pointer` to its `className` explicitly.
- **Disabled buttons are exempt**: the `<Button>` base class uses `disabled:pointer-events-none`, which suppresses the cursor automatically. No extra class needed.
- The rule covers `<button>` and `<Button>` only. Non-button clickable surfaces (sortable table headers, clickable list rows, tabs, file-picker labels) are out of scope and have their own conventions.

Enforcement: code review. No automated check today.

---

## 15. Frontend Token & Storage Naming

Client-side identifiers follow **two naming regimes**, split by storage type:

### 15.1 Cookies — `__Host-<function>-<name>`

Every cookie the application sets MUST use the `__Host-` prefix followed by a function segment and a name, hyphen-separated: `__Host-<function>-<name>` (e.g. `__Host-oauth-state`). The `<function>` segment comes from a fixed vocabulary — currently `auth` (session cookies) and `oauth` (OAuth flow cookies); add new segments deliberately.

- `__Host-` is a **browser-enforced security prefix** (Cookie Prefixes spec): the browser only accepts the cookie if it is set with `Secure`, without a `Domain` attribute, and with `Path=/`. This hardens against subdomain cookie-tossing attacks.
- The prefix is only meaningful on **cookies**. It has no effect on `localStorage`/`sessionStorage`, where it would be a cosmetic string — do not use it there.

| Identifier | Type | Source of truth | Purpose | Lifetime |
|------------|------|-----------------|---------|----------|
| `__Host-auth-refresh` | HttpOnly cookie | Backend (`REFRESH_COOKIE_NAME` in `config/cookies.js`) | Rotated refresh token for re-issuing access tokens | 7 days (sliding) |
| `__Host-oauth-state` | HttpOnly cookie | Backend (`STATE_COOKIE_NAME` in `config/cookies.js`) | Short-lived opaque CSRF state for the OAuth authorization-code flow. Carries `{ stateId, provider }` (base64url-encoded, dot-separated) so a single callback URL can dispatch to any registered provider strategy. | 10 minutes (`GOOGLE_OAUTH_STATE_TTL_SECONDS`) |
| `__Host-oauth-pkce-verifier` | HttpOnly cookie | Backend (`PKCE_COOKIE_NAME` in `config/cookies.js`) | PKCE S256 verifier for the OAuth flow | 10 minutes |

All three names are derived in code via the `hostCookieName(function, name)` helper in `config/cookies.js`, and all option objects inherit from a shared `baseCookieOptions(overrides)` factory — the `__Host-` pattern and base attributes are enforced in one place, not hand-written per cookie. All cookie access MUST go through the generic helpers exported from `config/cookies.js` — `setCookie(res, key, value)`, `clearCookie(res, key)`, `getCookie(req, key)` (keyed by the registry: `refresh`, `oauthState`, `pkceVerifier`). Controllers and services never call `res.cookie` / `res.clearCookie` directly or import cookie names/options.

### 15.2 Web storage & client keys — `om_`

All non-cookie client-side identifiers — `localStorage` keys, `sessionStorage` keys, IndexedDB stores, Zustand `persist` keys, query-string parameters we own, and React Query keys — MUST use the `om_` prefix (short for **O**rder **m**anagement). This keeps every application-managed identifier greppable in one place and prevents collisions with third-party libraries.

| Identifier | Type | Source of truth | Purpose | Lifetime |
|------------|------|-----------------|---------|----------|
| `accessToken` (in-memory only) | Zustand state | `useAuthStore` | AxonLog access token used in `Authorization: Bearer …`. Never persisted (see Rules below). | Session (memory) |
| `VITE_<PROVIDER>_CLIENT_ID` (e.g. `VITE_GOOGLE_CLIENT_ID`) | Build-time env | `frontend/src/lib/oauth/providerEnv.ts` | Per-provider public client id. Strategy-pattern dispatch via `resolveProviderConfig(intent)`. | Build-time |

### Rules

- **Never persist `accessToken` to `localStorage`, `sessionStorage`, or any disk-backed store.** It belongs only in zustand memory; the existing comment in `stores/authStore.ts` explains why. If you ever need cross-tab sharing, use `BroadcastChannel` + zustand — never `zustand/persist` for this field.
- **Refresh tokens live in HttpOnly cookies only.** The frontend never reads or writes them.
- **Google's access/refresh tokens are NOT stored anywhere** by this application. The OAuth flow exchanges `code` → `id_token`, upserts the Account, and immediately issues AxonLog's own `accessToken` + `refresh_token`. If a future feature actually needs Google API access on behalf of the user, it must add an explicit "Connect Google" flow with its own storage — that decision is **out of scope** today.
- **OAuth post-success destination is hard-coded server-side.** The backend always redirects to `/dashboard/my-orders` after a successful OAuth flow; clients cannot influence it.
- **OAuth error pages must never echo `code` or `state`.** If the provider returns the user with `?error=access_denied&error_description=…`, the SPA renders the error without leaking the auth code or state — see `pages/OAuthError.tsx`. This is the browser-swapping-attack mitigation: an attacker who tricks the victim into clicking a malicious OAuth callback URL should not be able to use the redirect chain to sign themselves in as the victim.
- **One OAuth provider strategy per file.** Both backend (`backend/src/oauth/<provider>.js`) and frontend (`frontend/src/lib/oauth/providerEnv.ts`) implement the Strategy pattern. To add a new provider:
   1. Backend: create `src/oauth/<provider>.js` exporting `{ intent, buildAuthUrl, exchangeCodeForTokens, verifyIdentity, defaultScopes }`. Register the strategy in `src/oauth/index.js`'s `providers` map.
   2. Frontend: add `case` in `resolveProviderConfig(intent)` for the new intent and declare `VITE_<PROVIDER>_CLIENT_ID` in `.env.sample`.
   3. No URL changes — `GET /api/auth/oauth?intent=<provider>` and `GET /api/auth/oauth/callback` accept any registered provider out of the box.

### Greppability

A single ripgrep covers every application-owned identifier:

```sh
rg "__Host-(auth-refresh|oauth-state|oauth-pkce-verifier)" backend/src
rg "om_|VITE_(GOOGLE|GITHUB)_CLIENT_ID" frontend/src
```

---

## 16. Navigation — `useNavigation` Hook

All programmatic navigation (redirects, button-driven route changes) in the SPA MUST go through the shared hook `frontend/src/lib/hooks/useNavigation.ts` — never call `useNavigate` from `react-router` directly in pages or components. `useNavigate` may only appear inside the hook itself.

```tsx
const go = useNavigation(toBaseAddress, queryParams?, options?);
// go()                → navigates to toBaseAddress (+ query string)
// go(overridePath)    → navigates to overridePath (+ bound query string)
// go(path, options)   → per-call NavigateOptions override (e.g. { replace: true })
```

- **Signature:** `useNavigation(toBaseAddress: string, queryParams: Record<string, string | undefined> = {}, options?: NavigateOptions)` returns a stable callback (safe to pass bare to `onClick` / `onCTA` — non-string first args such as React events are ignored).
- **Query params:** pass as the second argument; `undefined` values are dropped and `URLSearchParams` handles encoding. Never hand-build `?a=b&c=d` strings with `encodeURIComponent`.
- **Dynamic destinations** (paths only known at click time, e.g. `${row._id}/loading/run`): bind the query params once at the top of the component and pass the path as the callback's first argument — `openLoadingRun(\`${row._id}/loading/run\`)`. Hooks cannot be called inside loops/callbacks, so this is the only compliant pattern for per-row navigation.
- **`{ replace: true }`** goes in the hook's `options` argument (e.g. post-OAuth and error redirects).
- **In scope:** `navigate()` calls in pages/components. **Out of scope:** `<Link to="…">` / `<NavLink>` JSX declarative navigation, and route guards (`ProtectedRoute`, `PublicRoute`) which use their own redirect logic.

Enforcement: code review. A ripgrep for direct usage makes violations greppable:

```sh
rg "useNavigate" frontend/src --glob '!lib/hooks/useNavigation.ts'
```
