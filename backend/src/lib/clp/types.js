export const CONTAINER_TYPE_IDS = ['20GP', '40GP', '40HC', '45HC'];

export const ORIENTATIONS = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

export function emptyStats() {
  return {
    fillPct: 0,
    weightKg: 0,
    itemCount: 0,
    volumeMm3: 0,
    usedVolumeMm3: 0,
  };
}
