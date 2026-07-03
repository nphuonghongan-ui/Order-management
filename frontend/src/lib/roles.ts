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
    { label: "Inventory", path: "/dashboard/inventory", icon: "Package" },
  ],
  [ROLES.MANUFACTURE]: [
    { label: "Inventory", path: "/dashboard/inventory", icon: "Package" },
  ],
  [ROLES.SALE]: [
    { label: "Packing List", path: "/dashboard/packing-list", icon: "ClipboardList" },
  ],
};

export const DEFAULT_PATH_BY_ROLE: Record<Role, string> = {
  [ROLES.PO]: "/dashboard/inventory",
  [ROLES.MANUFACTURE]: "/dashboard/inventory",
  [ROLES.SALE]: "/dashboard/packing-list",
};

export function loginMock(username: string): Role | null {
  const role = MOCK_USERS[username?.toLowerCase()?.trim()];
  return role ?? null;
}

export function canAccess(role: Role, path: string): boolean {
  const menus = MENU_BY_ROLE[role];
  if (!menus) return false;
  return menus.some((m) => path.startsWith(m.path));
}
