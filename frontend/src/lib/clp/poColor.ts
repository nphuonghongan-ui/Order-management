/**
 * PO (order) color helpers — single source of truth for the color
 * every box of a given purchase order gets in the 3D scene and
 * any list/card view that wants to highlight a PO.
 *
 * The palette is categorical and intentionally small (12 colors)
 * so adjacent POs are easy to tell apart at a glance. When more
 * than 12 POs share a packing list, colors will repeat — the
 * hash is stable so the same PO always gets the same color, and
 * within a single container the per-PO color is usually distinct
 * by position anyway.
 *
 * If an item also carries an explicit `color`, we don't drop the
 * PO color — we blend them so the PO identity is still visible
 * (see `combineColors`).
 */

/** Categorical palette: 12 distinct, accessible colors. */
export const PO_COLOR_PALETTE: readonly string[] = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#a855f7", // purple
  "#14b8a6", // teal
  "#eab308", // yellow
] as const;

/** djb2 string hash → palette index. Stable across runs / workers. */
function hashKey(key: string): number {
  let h = 5381;
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) + h + key.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Map any string key to a deterministic palette color. */
export function colorForKey(key: string): string {
  if (!key) return PO_COLOR_PALETTE[0]!;
  return PO_COLOR_PALETTE[hashKey(key) % PO_COLOR_PALETTE.length]!;
}

/**
 * Look up the color for a given PO number. Falls back to the
 * `fallback` key (usually the part number, then the item id)
 * if `poNum` is missing, so every box still gets a color.
 */
export function colorForPo(
  poNum: string | undefined | null,
  fallback?: string,
): string {
  if (poNum && poNum.length > 0) return colorForKey(poNum);
  if (fallback && fallback.length > 0) return colorForKey(fallback);
  return PO_COLOR_PALETTE[0]!;
}

/** Parse "#rrggbb" into [r, g, b] in 0..255. */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  const n = parseInt(h, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/** Convert [r, g, b] in 0..255 back to "#rrggbb". */
function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/**
 * Linear sRGB blend of two hex colors.
 *
 *   weight = 0   → all `a`
 *   weight = 0.4 → 60 % `a` + 40 % `b`   (default for combining
 *                  a PO color with an explicit item color so the
 *                  PO identity stays dominant)
 *   weight = 1   → all `b`
 */
export function mixHex(a: string, b: string, weight = 0.4): string {
  if (a === b) return a;
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex(
    ar * (1 - w) + br * w,
    ag * (1 - w) + bg * w,
    ab * (1 - w) + bb * w,
  );
}

/**
 * Combine a PO color with an optional explicit item color.
 * Returns the PO color when `itemColor` is missing/empty; otherwise
 * blends the item color on top at `weight`.
 */
export function combinePoAndItemColor(
  poColor: string,
  itemColor: string | undefined | null,
  weight = 0.4,
): string {
  if (!itemColor) return poColor;
  return mixHex(poColor, itemColor, weight);
}
