import type { PackingListRecord } from "./types";
import { LOADING_CONSTANTS } from "./loadingConstants";

/**
 * Format a PackingListRecord as a plain-text block in the same shape the
 * Data Engineer team pastes into their trained model.
 *
 * - `m`, `l`, `w`, `h` come from the packing list's items (dimensions are
 *   looked up in the supplied `partNumToDim` map because the API response
 *   does not embed them — see exportEnrichment.ts).
 * - `M`, `v`, `L`, `W`, `H`, `X0`, `Y0`, `Z0` come from LOADING_CONSTANTS.
 *
 * Missing partNums fall back to 0 so the l/w/h arrays stay aligned with m.
 * Numbers are emitted via String(...) — integers stay integers, decimals
 * keep their precision.
 */
export function formatPackingListForModel(
  record: PackingListRecord,
  partNumToDim: Map<string, { length: number; width: number; height: number }>
): string {
  const m = record.items.length;

  const l: number[] = [];
  const w: number[] = [];
  const h: number[] = [];
  for (const it of record.items) {
    const d = partNumToDim.get(it.partNum) ?? {
      length: 0,
      width: 0,
      height: 0,
    };
    l.push(d.length);
    w.push(d.width);
    h.push(d.height);
  }

  const c = LOADING_CONSTANTS;

  const lines: string[] = [
    `m = ${m};`,
    `M = ${c.M};`,
    "",
    `v = [${c.v.join(", ")}];`,
    "",
    `l = [${l.join(", ")}];`,
    `w = [${w.join(", ")}];`,
    `h = [${h.join(", ")}];`,
    "",
    `L = ${c.L};`,
    `W = ${c.W};`,
    `H = ${c.H};`,
    "",
    `X0 = ${c.X0};`,
    `Y0 = ${c.Y0};`,
    `Z0 = ${c.Z0};`,
  ];

  return lines.join("\n");
}
