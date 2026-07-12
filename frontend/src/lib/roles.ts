export const ROLES = {
  PO: "PO",
  SALE: "Sale",
  MANUFACTURE: "Manufacture",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

const MOCK_USERS: Record<string, Role> = {
  po: ROLES.PO,
  sale: ROLES.SALE,
  mfg: ROLES.MANUFACTURE,
};

export const MENU_BY_ROLE: Record<Role, MenuItem[]> = {
  [ROLES.PO]: [
    { label: "My Orders", path: "/dashboard/my-orders", icon: "ListChecks" },
    { label: "New Order", path: "/dashboard/new-order", icon: "PackagePlus" },
  ],
  [ROLES.MANUFACTURE]: [
    { label: "Production Schedule", path: "/dashboard/production", icon: "Factory" },
  ],
  [ROLES.SALE]: [
    { label: "Packing List", path: "/dashboard/packing-list", icon: "ClipboardList" },
  ],
};

export const DEFAULT_PATH_BY_ROLE: Record<Role, string> = {
  [ROLES.PO]: "/dashboard/my-orders",
  [ROLES.MANUFACTURE]: "/dashboard/production",
  [ROLES.SALE]: "/dashboard/packing-list",
};