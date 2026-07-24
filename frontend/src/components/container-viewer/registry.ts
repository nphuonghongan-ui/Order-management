import * as THREE from "three";

/**
 * Non-reactive registry mapping a box id to its underlying THREE.Group.
 * Lives outside React so the <SelectedGizmo /> component can attach a
 * drei TransformControls to the currently selected box without tripping
 * React's "no ref access during render" or "no mutation of state" rules.
 */
const boxGroupRegistry = new Map<string, THREE.Group>();

export function registerBoxGroup(id: string, group: THREE.Group | null): void {
  if (group) boxGroupRegistry.set(id, group);
  else boxGroupRegistry.delete(id);
}

export function getBoxGroup(id: string | null): THREE.Group | undefined {
  if (!id) return undefined;
  return boxGroupRegistry.get(id);
}
