/**
 * Orientation generation.
 *
 * For axis-aligned packing we only need 6 permutations of the
 * canonical (l, w, h) — the 3 axis-aligned box orientations:
 *
 *   rot=0   → (l, w, h)
 *   rot=90  → (w, l, h)
 *   rot=180 → (l, w, h)  — same as 0
 *   rot=270 → (w, l, h)  — same as 90
 *
 * So 4 rotations collapse to 2 unique physical orientations per item.
 * We still allow all 4 because BoxPlacement.rotationY is tracked as
 * a discrete 0/90/180/270 for the 3D scene.
 */

import type { AxisRotation } from "@/components/container-viewer/types";
import type { Orientation } from "./types";

/** Generate the (up to) 4 discrete orientations for a (l, w, h) box. */
export function generateOrientations(
  l: number,
  w: number,
  h: number
): Orientation[] {
  const out: Orientation[] = [
    { rot: 0, l, w, h },
    { rot: 90, l: w, w: l, h },
    { rot: 180, l, w, h },
    { rot: 270, l: w, w: l, h },
  ];
  return out;
}

/** Filter the orientation list to a caller-provided allow-list. */
export function filterOrientations(
  all: Orientation[],
  allowed: AxisRotation[] | undefined
): Orientation[] {
  if (!allowed || allowed.length === 0) return all;
  const set = new Set<AxisRotation>(allowed);
  return all.filter((o) => set.has(o.rot));
}
