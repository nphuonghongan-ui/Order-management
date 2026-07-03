export const ROLES = {
  PO: "PO",
  SALE: "Sale",
  MANUFACTURE: "Manufacture",
};

const MOCK_USERS = {
  po: ROLES.PO,
  sale: ROLES.SALE,
  mfg: ROLES.MANUFACTURE,
};

export const MENU_BY_ROLE = {
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

export const DEFAULT_PATH_BY_ROLE = {
  [ROLES.PO]: "/dashboard/inventory",
  [ROLES.MANUFACTURE]: "/dashboard/inventory",
  [ROLES.SALE]: "/dashboard/packing-list",
};

export const loginMock = (username) => {
  const role = MOCK_USERS[username?.toLowerCase()?.trim()];
  if (!role) return null;
  return role;
};

export const canAccess = (role, path) => {
  const menus = MENU_BY_ROLE[role];
  if (!menus) return false;
  return menus.some((m) => path.startsWith(m.path));
};
