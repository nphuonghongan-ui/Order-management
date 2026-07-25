/**
 * Best-Fit scoring for candidate placements.
 *
 * The score is a weighted sum of:
 *   - negative residual space  (we want to leave small, useful voids)
 *   - contact area with placed boxes / walls (stable packing)
 *   - support ratio (already enforced by checkSupport)
 *   - height penalty (favor lower y)
 *   - corner / edge bonus (boxes in a corner pack tighter)
 *
 * Higher score = better placement.
 *
 * Two weight profiles are exported:
 *   - `WEIGHTS_TIGHT`       — best-fit, maximizes contact / fill.
 *   - `WEIGHTS_CORNER_FIRST`— anchors each box at the back-left-floor
 *     corner and builds outward. Best for "easy cargo" / loose load.
 */

import type { PlacementGrid } from "./collision";
import type { Bounds, Size3, Vec3 } from "./geometry";
import { aabbFromMin, footprintOverlapArea } from "./geometry";
import type { LoadingStrategy } from "./types";

export interface ScoreWeights {
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  epsilon: number;
}

/** Best-fit profile: smaller boxes, more contact, mild corner bonus. */
export const WEIGHTS_TIGHT: ScoreWeights = {
  alpha: 1.0,
  beta: 0.6,
  gamma: 0.8,
  delta: 0.001,
  epsilon: 0.5,
};

/**
 * Corner-first profile: ignore residual/contact/support/height and
 * let the corner bonus dominate by ~6 orders of magnitude so that
 * any candidate touching 2+ walls/floor always beats a center
 * candidate regardless of how much interior contact the center
 * candidate accumulates. Tie-breaking is handled by the caller
 * (greedy prefers smaller (x + z + y) on equal scores).
 */
export const WEIGHTS_CORNER_FIRST: ScoreWeights = {
  alpha: 0.0,
  beta: 0.0,
  gamma: 0.0,
  delta: 0.0,
  epsilon: 1e6,
};

/** @deprecated Use `WEIGHTS_TIGHT` (kept for backwards-compat imports). */
export const DEFAULT_WEIGHTS: ScoreWeights = WEIGHTS_TIGHT;

/** Look up the weight profile for a given strategy. */
export function weightsForStrategy(s: LoadingStrategy | undefined): ScoreWeights {
  return s === "corner-first" ? WEIGHTS_CORNER_FIRST : WEIGHTS_TIGHT;
}

export interface ScoreInput {
  min: Vec3;
  size: Size3;
  grid: PlacementGrid;
  bounds: Bounds;
  weights?: ScoreWeights;
}

const TOL = 1e-3;

function onFloor(min: Vec3): boolean {
  return min.y <= TOL;
}
function touchesLeftWall(min: Vec3): boolean {
  return min.x <= TOL;
}
function touchesRightWall(min: Vec3, size: Size3, bounds: Bounds): boolean {
  return min.x + size.l >= bounds.l - TOL;
}
function touchesBackWall(min: Vec3): boolean {
  return min.z <= TOL;
}
function touchesFrontWall(min: Vec3, size: Size3, bounds: Bounds): boolean {
  return min.z + size.w >= bounds.w - TOL;
}

/** Sum of contact area (mm²) with placed boxes + container walls
 *  + the floor. Includes the box's own footprint when sitting on
 *  the floor. */
function contactArea(
  min: Vec3,
  size: Size3,
  grid: PlacementGrid,
  bounds: Bounds
): number {
  const myAabb = aabbFromMin(min, size);
  let area = 0;

  // Floor (full footprint when on the floor).
  if (onFloor(min)) area += size.l * size.w;
  // Walls.
  if (touchesLeftWall(min)) area += size.h * size.w;
  if (touchesRightWall(min, size, bounds)) area += size.h * size.w;
  if (touchesBackWall(min)) area += size.l * size.h;
  if (touchesFrontWall(min, size, bounds)) area += size.l * size.h;
  // Placed boxes.
  for (const other of grid.all()) {
    area += footprintOverlapArea(myAabb, other);
  }
  return area;
}

function cornerBonus(min: Vec3, size: Size3, bounds: Bounds): number {
  const atLeft = touchesLeftWall(min);
  const atBack = touchesBackWall(min);
  const onFlr = onFloor(min);
  const atRight = touchesRightWall(min, size, bounds);
  const atFront = touchesFrontWall(min, size, bounds);

  const wallCount =
    (atLeft ? 1 : 0) +
    (atBack ? 1 : 0) +
    (onFlr ? 1 : 0) +
    (atRight ? 1 : 0) +
    (atFront ? 1 : 0);
  // 3-touch corner is the most desirable.
  if (wallCount >= 3) return 1.0;
  if (wallCount === 2) return 0.5;
  if (wallCount === 1) return 0.25;
  return 0;
}

/** Compute the score of a candidate placement. Higher = better. */
export function bestFitScore(input: ScoreInput): number {
  const w = input.weights ?? WEIGHTS_TIGHT;
  const { min, size, grid, bounds } = input;

  // Note: a previous version of this function used
  // `residual = size.l * size.w * size.h` (the box's own volume) as
  // a "residual space" term. Because it's constant for every
  // candidate of the same box, it never discriminated placement —
  // it only biased against larger boxes across the whole run. The
  // contact + corner + height terms below are what actually steer
  // placement, so the `residual` term has been dropped.
  const contact = contactArea(min, size, grid, bounds);
  const support = grid.supportArea(min, size);
  const supportRatio = size.l * size.w > 0 ? support / (size.l * size.w) : 0;
  const heightPenalty = min.y;
  const corner = cornerBonus(min, size, bounds);

  return (
    w.beta * contact +
    w.gamma * supportRatio -
    w.delta * heightPenalty +
    w.epsilon * corner
  );
}
