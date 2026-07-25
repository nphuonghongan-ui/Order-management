/**
 * Pure helpers used by `Container3DNode` and `MultiScene`. Kept
 * in a separate file from the R3F component to satisfy
 * `react-refresh/only-export-components`.
 *
 * World units = centimetres (cm).
 */

import type { ContainerType } from "@/components/container-viewer/units";

/** World-X offset of the i-th container in a strip, where the
 *  strip starts at world origin (0, 0, 0). */
export function computeContainerOffset(
  prev: ContainerType[],
  idx: number,
  gapCm = 50
): number {
  let x = 0;
  for (let i = 0; i < idx; i++) {
    const t = prev[i];
    if (!t) continue;
    x += t.inner.l + gapCm;
  }
  return x;
}

/** Total world-X extent of a strip of containers. */
export function totalStripWidth(
  types: ContainerType[],
  gapCm = 50
): number {
  let w = 0;
  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    if (!t) continue;
    w += t.inner.l;
    if (i < types.length - 1) w += gapCm;
  }
  return w;
}
