import { getContainerType, type ContainerTypeId } from "./units";
import type { BoxPlacement } from "./types";

export interface DatExportInput {
  containerTypeId: ContainerTypeId;
  boxes: BoxPlacement[];
}

export interface DatExportOptions {
  /** Optional override for the fixed model constants. */
  capacityM?: number;
  velocityV?: number[];
}

/**
 * Serialize the current scene into the same plain-text block the Data
 * Engineer team pastes into their trained model. We keep the variable names
 * (m, l, w, h, M, v, L, W, H, X0, Y0, Z0) identical to formatPackingListForModel
 * so the model sees a drop-in replacement.
 *
 * - `m`       = total box count (sum of qty across all placements)
 * - `l/w/h`   = per-box dimensions in cm
 * - `M`       = model capacity constant
 * - `v`       = model velocity array
 * - `L/W/H`   = inner container dimensions in cm
 * - `X0/Y0/Z0`= origin offset (kept at 0 for now)
 */
export function exportDat(
  input: DatExportInput,
  options: DatExportOptions = {},
): string {
  const container = getContainerType(input.containerTypeId);

  // Expand each placement into `qty` individual entries.
  const flat: BoxPlacement[] = [];
  for (const b of input.boxes) {
    for (let i = 0; i < b.qty; i++) flat.push(b);
  }

  const m = flat.length;
  const l: number[] = [];
  const w: number[] = [];
  const h: number[] = [];
  for (const b of flat) {
    const swapped = b.rotationY === 90 || b.rotationY === 270;
    l.push(swapped ? b.size.w : b.size.l);
    w.push(swapped ? b.size.l : b.size.w);
    h.push(b.size.h);
  }

  const M = options.capacityM ?? 10000;
  const v = options.velocityV ?? [10, 8, 15, 6, 12, 9];
  const L = container.inner.l;
  const W = container.inner.w;
  const H = container.inner.h;
  const X0 = 0;
  const Y0 = 0;
  const Z0 = 0;

  return [
    `m = ${m};`,
    `M = ${M};`,
    "",
    `v = [${v.join(", ")}];`,
    "",
    `l = [${l.join(", ")}];`,
    `w = [${w.join(", ")}];`,
    `h = [${h.join(", ")}];`,
    "",
    `L = ${L};`,
    `W = ${W};`,
    `H = ${H};`,
    "",
    `X0 = ${X0};`,
    `Y0 = ${Y0};`,
    `Z0 = ${Z0};`,
  ].join("\n");
}

export async function copyDatToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}
