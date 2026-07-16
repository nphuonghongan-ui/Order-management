const PALETTE: { bg: string; fg: string }[] = [
  { bg: "bg-rose-500/15", fg: "text-rose-700 dark:text-rose-300" },
  { bg: "bg-sky-500/15", fg: "text-sky-700 dark:text-sky-300" },
  { bg: "bg-emerald-500/15", fg: "text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-amber-500/15", fg: "text-amber-700 dark:text-amber-300" },
  { bg: "bg-violet-500/15", fg: "text-violet-700 dark:text-violet-300" },
  { bg: "bg-teal-500/15", fg: "text-teal-700 dark:text-teal-300" },
  { bg: "bg-pink-500/15", fg: "text-pink-700 dark:text-pink-300" },
  { bg: "bg-indigo-500/15", fg: "text-indigo-700 dark:text-indigo-300" },
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase() || "?";
}

export function getAvatarColor(name: string): { bg: string; fg: string } {
  const idx = hashName(name) % PALETTE.length;
  return PALETTE[idx];
}
