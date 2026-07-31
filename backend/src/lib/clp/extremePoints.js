export function makeExtremePoint(x, y, z) {
  return { x, y, z };
}

export function emitPointsFor(placed) {
  const { x, y, z, l, w, h } = placed;
  return [
    makeExtremePoint(x + l, y, z),
    makeExtremePoint(x, y, z + w),
    makeExtremePoint(x, y + h, z),
  ];
}

export function isDominated(candidate, others) {
  for (const p of others) {
    if (p === candidate) continue;
    if (
      p.x <= candidate.x + 1e-6 &&
      p.y <= candidate.y + 1e-6 &&
      p.z <= candidate.z + 1e-6 &&
      (p.x < candidate.x - 1e-6 ||
        p.y < candidate.y - 1e-6 ||
        p.z < candidate.z - 1e-6)
    ) {
      return true;
    }
  }
  return false;
}

export function pruneDominated(points) {
  const out = [];
  for (const p of points) {
    let dominated = false;
    for (const q of points) {
      if (q === p) continue;
      if (
        q.x <= p.x + 1e-6 &&
        q.y <= p.y + 1e-6 &&
        q.z <= p.z + 1e-6 &&
        (q.x < p.x - 1e-6 ||
          q.y < p.y - 1e-6 ||
          q.z < p.z - 1e-6)
      ) {
        dominated = true;
        break;
      }
    }
    if (!dominated) out.push(p);
  }
  return out;
}

export function addPoints(current, candidates, usedPoint) {
  const filtered = usedPoint
    ? current.filter(
        (p) =>
          Math.abs(p.x - usedPoint.x) > 1e-6 ||
          Math.abs(p.y - usedPoint.y) > 1e-6 ||
          Math.abs(p.z - usedPoint.z) > 1e-6
      )
    : current;
  const merged = filtered.concat(candidates);
  return pruneDominated(merged);
}
