import type { BoxPlacement } from "@/lib/clp/types";

const COLUMNS = [
  "name",
  "x_mm",
  "y_mm",
  "z_mm",
  "l_mm",
  "w_mm",
  "h_mm",
  "rotY_deg",
  "weight_kg",
];

export function buildDatText(placements: BoxPlacement[]): string {
  const lines = [COLUMNS.join("\t")];
  placements.forEach((p, idx) => {
    lines.push(
      [
        `${p.partNum}#${idx}`,
        p.position.x.toFixed(0),
        p.position.y.toFixed(0),
        p.position.z.toFixed(0),
        p.size.l.toFixed(0),
        p.size.w.toFixed(0),
        p.size.h.toFixed(0),
        p.rotationY.toString(),
        p.weightKg.toFixed(3),
      ].join("\t")
    );
  });
  return lines.join("\n");
}

export function downloadDatFile(placements: BoxPlacement[], fileName: string) {
  const text = buildDatText(placements);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyDatToClipboard(placements: BoxPlacement[]): Promise<boolean> {
  const text = buildDatText(placements);
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
