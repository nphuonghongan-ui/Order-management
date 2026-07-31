import { fitsAt, getOrientations, volumeOf } from '../lib/clp/geometry.js';
import { addPoints, emitPointsFor, makeExtremePoint } from '../lib/clp/extremePoints.js';

const MM_PER_CM = 10;

function toMmBox(item) {
  return {
    ref: item,
    l: item.dim.l * MM_PER_CM,
    w: item.dim.w * MM_PER_CM,
    h: item.dim.h * MM_PER_CM,
    weightKg: item.dim.weightKg ?? 0,
    qty: item.qty,
  };
}

function expandToIndividualBoxes(items) {
  const out = [];
  let seq = 0;
  for (const item of items) {
    for (let i = 0; i < item.qty; i += 1) {
      out.push({
        ...toMmBox(item),
        id: `${item.partNum}-${i}`,
        poNum: item.poNum,
        partNum: item.partNum,
        seq,
      });
      seq += 1;
    }
  }
  return out;
}

function sortBoxes(boxes) {
  return boxes.sort((a, b) => {
    const va = a.l * a.w * a.h;
    const vb = b.l * b.w * b.h;
    if (vb !== va) return vb - va;
    if (b.l !== a.l) return b.l - a.l;
    if (b.w !== a.w) return b.w - a.w;
    return b.h - a.h;
  });
}

function placementAtPoint(point, orient) {
  return {
    x: point.x,
    y: point.y,
    z: point.z,
    l: orient.l,
    w: orient.w,
    h: orient.h,
  };
}

function findPlacementForBox(box, points, placed, container, usedWeight, containerMaxWeight) {
  const orientations = getOrientations([box.l, box.w, box.h]);
  let best = null;
  let bestPoint = null;

  for (const point of points) {
    for (const orient of orientations) {
      if (orient.l > container.l || orient.w > container.w || orient.h > container.h) continue;
      const candidate = placementAtPoint(point, orient);
      if (candidate.x + candidate.l > container.l + 1e-6) continue;
      if (candidate.z + candidate.w > container.w + 1e-6) continue;
      if (candidate.y + candidate.h > container.h + 1e-6) continue;
      if (!fitsAt(candidate, placed, container)) continue;
      if (usedWeight + box.weightKg > containerMaxWeight + 1e-6) continue;

      if (best === null) {
        best = candidate;
        bestPoint = point;
        continue;
      }
      if (candidate.y < best.y - 1e-6) {
        best = candidate;
        bestPoint = point;
        continue;
      }
      if (Math.abs(candidate.y - best.y) < 1e-6) {
        if (candidate.x + candidate.z < best.x + best.z) {
          best = candidate;
          bestPoint = point;
        }
      }
    }
  }

  return { placement: best, point: bestPoint };
}

function colorForPartNum(partNum) {
  let hash = 0;
  for (let i = 0; i < partNum.length; i += 1) {
    hash = (hash * 31 + partNum.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 70%)`;
}

export function optimize({ items, container, containerMaxWeight }) {
  const innerMm = {
    l: container.inner.length * MM_PER_CM,
    w: container.inner.width * MM_PER_CM,
    h: container.inner.height * MM_PER_CM,
  };
  const containerBox = { ...innerMm, x: 0, y: 0, z: 0 };

  const individual = expandToIndividualBoxes(items);
  const ordered = sortBoxes(individual);

  const placed = [];
  const placements = [];
  let usedWeight = 0;
  let usedVolume = 0;
  let points = [makeExtremePoint(0, 0, 0)];

  for (const box of ordered) {
    const { placement: candidate, point: usedPoint } = findPlacementForBox(
      box,
      points,
      placed,
      containerBox,
      usedWeight,
      containerMaxWeight
    );
    if (!candidate) continue;

    placed.push({ ...candidate });
    usedWeight += box.weightKg;
    usedVolume += volumeOf(candidate);

    placements.push({
      id: `box-${box.seq}`,
      partNum: box.partNum,
      poNum: box.poNum,
      size: { l: candidate.l, w: candidate.w, h: candidate.h },
      position: { x: candidate.x, y: candidate.y, z: candidate.z },
      rotationY: 0,
      weightKg: box.weightKg,
      qty: 1,
      color: colorForPartNum(box.partNum),
    });

    const newPoints = emitPointsFor(candidate);
    points = addPoints(points, newPoints, usedPoint);
  }

  const containerVolume = innerMm.l * innerMm.w * innerMm.h;
  const fillPct = containerVolume > 0 ? (usedVolume / containerVolume) * 100 : 0;

  return {
    placements,
    stats: {
      fillPct: Math.round(fillPct * 10) / 10,
      weightKg: Math.round(usedWeight * 100) / 100,
      itemCount: placements.length,
      volumeMm3: containerVolume,
      usedVolumeMm3: usedVolume,
    },
  };
}

export function buildItemsFromPackingList(packingList, partNumMap) {
  const items = [];
  const skipped = [];
  for (const it of packingList.items) {
    const dim = partNumMap.get(it.partNum);
    if (!dim || !it.qty || it.qty <= 0) {
      if (!dim) skipped.push(it.partNum);
      continue;
    }
    items.push({
      partNum: it.partNum,
      poNum: it.poNum,
      qty: it.qty,
      dim: {
        l: dim.length,
        w: dim.width,
        h: dim.height,
        weightKg: dim.weightKg ?? 0,
      },
    });
  }
  return { items, skipped };
}
