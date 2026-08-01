import { aabbOverlap, fitsAt, getOrientations, volumeOf } from '../lib/clp/geometry.js';
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

function groupByPartNum(boxes) {
  const map = new Map();
  for (const b of boxes) {
    if (!map.has(b.partNum)) map.set(b.partNum, []);
    map.get(b.partNum).push(b);
  }
  return map;
}

function totalVolumeOfGroup(units) {
  let v = 0;
  for (const u of units) v += u.l * u.w * u.h;
  return v;
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

function footprintOverlap(a, b) {
  return (
    a.x < b.x + b.l &&
    b.x < a.x + a.l &&
    a.z < b.z + b.w &&
    b.z < a.z + a.w
  );
}

function findPlacementForBox(box, points, placed, container, usedWeight, containerMaxWeight) {
  const orientations = getOrientations([box.l, box.w, box.h]);
  let best = null;
  let bestPoint = null;
  let bestScore = -Infinity;

  for (const point of points) {
    for (const orient of orientations) {
      if (orient.l > container.l || orient.w > container.w || orient.h > container.h) continue;
      const candidate = placementAtPoint(point, orient);
      if (candidate.x + candidate.l > container.l + 1e-6) continue;
      if (candidate.z + candidate.w > container.w + 1e-6) continue;
      if (candidate.y + candidate.h > container.h + 1e-6) continue;
      if (!fitsAt(candidate, placed, container)) continue;
      if (usedWeight + box.weightKg > containerMaxWeight + 1e-6) continue;

      let score = 0;
      if (candidate.y > 1e-6) {
        for (const p of placed) {
          if (
            Math.abs(p.y + p.h - candidate.y) < 1e-6 &&
            footprintOverlap(candidate, p) &&
            p.partNum === box.partNum
          ) {
            score += 1e6;
            break;
          }
        }
      }
      score -= candidate.y * 1000;
      score -= candidate.x + candidate.z;

      if (score > bestScore) {
        best = candidate;
        bestPoint = point;
        bestScore = score;
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

function findSmallestFreeFloorPosition(orient, placed, container) {
  const xCandidates = [0];
  const zCandidates = [0];
  for (const p of placed) {
    if (p.y > 1e-6) continue;
    xCandidates.push(p.x + p.l);
    zCandidates.push(p.z + p.w);
  }
  xCandidates.sort((a, b) => a - b);
  zCandidates.sort((a, b) => a - b);
  for (const z of zCandidates) {
    if (z + orient.w > container.w + 1e-6) continue;
    for (const x of xCandidates) {
      if (x + orient.l > container.l + 1e-6) continue;
      const test = { x, y: 0, z, l: orient.l, w: orient.w, h: orient.h };
      let ok = true;
      for (const p of placed) {
        if (aabbOverlap(test, p)) { ok = false; break; }
      }
      if (ok) return { x, z };
    }
  }
  return null;
}

function makePlacement(unit, candidate) {
  return {
    id: `box-${unit.seq}`,
    partNum: unit.partNum,
    poNum: unit.poNum,
    size: { l: candidate.l, w: candidate.w, h: candidate.h },
    position: { x: candidate.x, y: candidate.y, z: candidate.z },
    rotationY: 0,
    weightKg: unit.weightKg,
    qty: 1,
    color: colorForPartNum(unit.partNum),
  };
}

function packGroupAsColumns(units, placed, container, usedWeight, containerMaxWeight) {
  const placements = [];
  const placedBoxes = [];
  let weight = 0;
  let volume = 0;
  let toPlace = units.slice();
  const triedKeys = new Set();

  for (const orient of getOrientations([units[0].l, units[0].w, units[0].h])) {
    if (toPlace.length === 0) break;
    const key = `${orient.l},${orient.w},${orient.h}`;
    if (triedKeys.has(key)) continue;
    triedKeys.add(key);
    if (orient.l > container.l || orient.w > container.w || orient.h > container.h) continue;
    const maxInCol = Math.floor((container.h - 1e-6) / orient.h);
    if (maxInCol <= 0) continue;

    const stillUnplaced = [];
    for (const unit of toPlace) {
      let placedThis = false;
      for (const p of placed) {
        if (p.partNum !== unit.partNum) continue;
        if (p.l !== orient.l || p.w !== orient.w) continue;
        if (p.y + p.h + orient.h > container.h + 1e-6) continue;
        if (usedWeight + weight + unit.weightKg > containerMaxWeight + 1e-6) continue;
        const candidate = {
          x: p.x,
          y: p.y + p.h,
          z: p.z,
          l: p.l,
          w: p.w,
          h: p.h,
        };
        if (!fitsAt(candidate, placed, container)) continue;
        const placedBox = { ...candidate, partNum: unit.partNum };
        placed.push(placedBox);
        placedBoxes.push(placedBox);
        weight += unit.weightKg;
        volume += orient.l * orient.w * orient.h;
        placements.push(makePlacement(unit, candidate));
        placedThis = true;
        break;
      }
      if (placedThis) continue;

      const floorPos = findSmallestFreeFloorPosition(orient, placed, container);
      if (floorPos === null) {
        stillUnplaced.push(unit);
        continue;
      }
      if (usedWeight + weight + unit.weightKg > containerMaxWeight + 1e-6) {
        stillUnplaced.push(unit);
        continue;
      }
      const candidate = { x: floorPos.x, y: 0, z: floorPos.z, l: orient.l, w: orient.w, h: orient.h };
      if (!fitsAt(candidate, placed, container)) {
        stillUnplaced.push(unit);
        continue;
      }
      const placedBox = { ...candidate, partNum: unit.partNum };
      placed.push(placedBox);
      placedBoxes.push(placedBox);
      weight += unit.weightKg;
      volume += orient.l * orient.w * orient.h;
      placements.push(makePlacement(unit, candidate));
    }
    toPlace = stillUnplaced;
  }

  return { placements, placedBoxes, weight, volume, unplaced: toPlace };
}

export function optimize({ items, container, containerMaxWeight }) {
  const innerMm = {
    l: container.inner.length * MM_PER_CM,
    w: container.inner.width * MM_PER_CM,
    h: container.inner.height * MM_PER_CM,
  };
  const containerBox = { ...innerMm, x: 0, y: 0, z: 0 };

  const individual = expandToIndividualBoxes(items);
  const groups = groupByPartNum(individual);
  const sortedGroups = [...groups.entries()].sort(
    (a, b) => totalVolumeOfGroup(b[1]) - totalVolumeOfGroup(a[1])
  );

  const placed = [];
  const placements = [];
  let usedWeight = 0;
  let usedVolume = 0;
  let points = [makeExtremePoint(0, 0, 0)];

  for (const [, units] of sortedGroups) {
    const { placements: p, placedBoxes: newPlaced, weight, volume, unplaced } = packGroupAsColumns(
      units,
      placed,
      containerBox,
      usedWeight,
      containerMaxWeight
    );
    placements.push(...p);
    usedWeight += weight;
    usedVolume += volume;
    for (const placedBox of newPlaced) {
      const newPoints = emitPointsFor(placedBox);
      points = addPoints(points, newPoints, null);
    }

    for (const unit of unplaced) {
      const { placement: candidate, point: usedPoint } = findPlacementForBox(
        unit,
        points,
        placed,
        containerBox,
        usedWeight,
        containerMaxWeight
      );
      if (!candidate) continue;
      placed.push({ ...candidate, partNum: unit.partNum });
      usedWeight += unit.weightKg;
      usedVolume += volumeOf(candidate);
      placements.push(makePlacement(unit, candidate));
      const newPoints = emitPointsFor(candidate);
      points = addPoints(points, newPoints, usedPoint);
    }
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
    if (dim.length <= 0 || dim.width <= 0 || dim.height <= 0) {
      skipped.push(it.partNum);
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
