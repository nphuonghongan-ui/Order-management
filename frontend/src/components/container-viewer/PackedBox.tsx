import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Outlines, Text, TransformControls } from "@react-three/drei";
import type { BoxPlacement } from "./types";
import { useContainerStore } from "../../stores/useContainerStore";
import { getContainerType } from "./units";
import { registerBoxGroup, getBoxGroup } from "./registry";
import {
  colorForPo,
  combinePoAndItemColor,
} from "../../lib/clp/poColor";

const HOVER_COLOR = new THREE.Color("#fbbf24");
const LABEL_PLATE_COLOR = "#ffffff";
const LABEL_TEXT_COLOR = "#0f172a";
const LABEL_FACE_OFFSET = 0.2;
const PLATE_DEPTH = -0.15;

interface AABB {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

/** AABB of a box in store coordinates (position.y = bottom of the box). */
function aabbOf(box: {
  position: { x: number; y: number; z: number };
  size: { l: number; w: number; h: number };
  rotationY: number;
}): AABB {
  const swapped = box.rotationY === 90 || box.rotationY === 270;
  const l = swapped ? box.size.w : box.size.l;
  const w = swapped ? box.size.l : box.size.w;
  return {
    minX: box.position.x - l / 2,
    maxX: box.position.x + l / 2,
    minY: box.position.y,
    maxY: box.position.y + box.size.h,
    minZ: box.position.z - w / 2,
    maxZ: box.position.z + w / 2,
  };
}

/**
 * Single-pass AABB-vs-AABB collision resolution. For each obstacle, if the
 * candidate box overlaps on all three axes, push the candidate out along the
 * axis with the smallest overlap. If a push creates a new collision with a
 * different obstacle, the next drag event resolves it.
 */
function resolveCollisions(
  candidate: { x: number; y: number; z: number },
  size: { l: number; w: number; h: number },
  rotationY: number,
  obstacles: Array<{
    position: { x: number; y: number; z: number };
    size: { l: number; w: number; h: number };
    rotationY: number;
  }>,
): { x: number; y: number; z: number } {
  const pos = { x: candidate.x, y: candidate.y, z: candidate.z };

  for (const other of obstacles) {
    const me = aabbOf({ position: pos, size, rotationY });
    const o = aabbOf(other);
    if (me.maxX <= o.minX || me.minX >= o.maxX) continue;
    if (me.maxY <= o.minY || me.minY >= o.maxY) continue;
    if (me.maxZ <= o.minZ || me.minZ >= o.maxZ) continue;

    const x1 = me.maxX - o.minX; // push -X
    const x2 = o.maxX - me.minX; // push +X
    const y1 = me.maxY - o.minY; // push -Y
    const y2 = o.maxY - me.minY; // push +Y
    const z1 = me.maxZ - o.minZ; // push -Z
    const z2 = o.maxZ - me.minZ; // push +Z

    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const minZ = Math.min(z1, z2);

    if (minX <= minY && minX <= minZ) {
      pos.x += x1 < x2 ? -x1 : x2;
    } else if (minY <= minX && minY <= minZ) {
      pos.y += y1 < y2 ? -y1 : y2;
    } else {
      pos.z += z1 < z2 ? -z1 : z2;
    }
  }
  return pos;
}

function snap(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

export function PackedBoxes() {
  const boxes = useContainerStore((s) => s.boxes);
  return (
    <group>
      {boxes.map((b) => (
        <PackedBox key={b.id} box={b} />
      ))}
    </group>
  );
}

function PackedBox({ box }: { box: BoxPlacement }) {
  const selectedId = useContainerStore((s) => s.selectedId);
  const selectBox = useContainerStore((s) => s.selectBox);
  const showLabels = useContainerStore((s) => s.showLabels);
  const isSelected = selectedId === box.id;
  const groupRef = useRef<THREE.Group>(null);

  const color = useMemo(() => {
    // Color chain: explicit per-box color → PO color (blended with
    // explicit color if both are present) → partNum fallback.
    const poColor = colorForPo(box.poNum, box.partNum);
    const final = box.color
      ? combinePoAndItemColor(poColor, box.color, 0.4)
      : poColor;
    return new THREE.Color(final);
  }, [box.color, box.poNum, box.partNum]);

  const swapped = box.rotationY === 90 || box.rotationY === 270;
  const renderL = swapped ? box.size.w : box.size.l;
  const renderW = swapped ? box.size.l : box.size.w;

  // Register/unregister this group's ref in a global registry so the
  // separate <SelectedGizmo /> component can attach a TransformControls
  // to it without touching `ref.current` during render.
  useEffect(() => {
    registerBoxGroup(box.id, groupRef.current);
    return () => registerBoxGroup(box.id, null);
  }, [box.id]);

  // Keep the group transform in sync with the store.
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(
      box.position.x,
      box.position.y + box.size.h / 2,
      box.position.z,
    );
    groupRef.current.rotation.set(0, (box.rotationY * Math.PI) / 180, 0);
  }, [box.position.x, box.position.y, box.position.z, box.rotationY, box.size.h]);

  // Label geometry: sized to face so long partNums stay readable.
  const fontSize = Math.max(8, Math.min(renderL, renderW) * 0.32);
  const plateW = Math.min(
    renderL * 0.85,
    fontSize * (box.partNum.length + 0.5) * 0.65,
  );
  const plateH = fontSize * 1.4;

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        selectBox(box.id);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[renderL, box.size.h, renderW]} />
        <meshStandardMaterial
          color={isSelected ? HOVER_COLOR : color}
          metalness={0.05}
          roughness={0.85}
          emissive={isSelected ? HOVER_COLOR : new THREE.Color("#000")}
          emissiveIntensity={isSelected ? 0.35 : 0}
        />

        {/* Always-on black border, world-space 0.5cm stroke. */}
        <Outlines
          thickness={0.5}
          color="#000000"
          screenspace
          angle={0}
        />

        {/* Selection: thicker yellow stroke layered over the black rest border. */}
        {isSelected && (
          <Outlines
            thickness={1.5}
            color="#fbbf24"
            screenspace
            angle={0}
          />
        )}
      </mesh>

      {showLabels && (
        <>
          {/* Top face */}
          <LabelOnFace
            partNum={box.partNum}
            position={[0, box.size.h / 2 + LABEL_FACE_OFFSET, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            plateW={plateW}
            plateH={plateH}
            fontSize={fontSize}
          />
          {/* Front face (+Z) */}
          <LabelOnFace
            partNum={box.partNum}
            position={[0, 0, renderW / 2 + LABEL_FACE_OFFSET]}
            rotation={[0, 0, 0]}
            plateW={plateW}
            plateH={plateH}
            fontSize={fontSize}
          />
          {/* Right face (+X) */}
          <LabelOnFace
            partNum={box.partNum}
            position={[renderL / 2 + LABEL_FACE_OFFSET, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            plateW={plateW}
            plateH={plateH}
            fontSize={fontSize}
          />
        </>
      )}
    </group>
  );
}

interface LabelOnFaceProps {
  partNum: string;
  position: [number, number, number];
  rotation: [number, number, number];
  plateW: number;
  plateH: number;
  fontSize: number;
}

function LabelOnFace({
  partNum,
  position,
  rotation,
  plateW,
  plateH,
  fontSize,
}: LabelOnFaceProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, PLATE_DEPTH]}>
        <planeGeometry args={[plateW, plateH]} />
        <meshBasicMaterial
          color={LABEL_PLATE_COLOR}
          opacity={0.92}
          transparent
        />
      </mesh>
      <Text
        position={[0, 0, 0]}
        fontSize={fontSize}
        color={LABEL_TEXT_COLOR}
        anchorX="center"
        anchorY="middle"
        outlineWidth={1.2}
        outlineColor="#ffffff"
        maxWidth={plateW * 0.9}
      >
        {partNum}
      </Text>
    </group>
  );
}

// ------------------------------------------------------------------
// SelectedGizmo — rendered as a sibling of PackedBoxes. Reads the
// selected box id from the store, looks up the corresponding group in
// the registry, and attaches a drei TransformControls to it.
// ------------------------------------------------------------------
export function SelectedGizmo() {
  const selectedId = useContainerStore((s) => s.selectedId);
  const tool = useContainerStore((s) => s.tool);
  const boxes = useContainerStore((s) => s.boxes);
  const updateBoxPosition = useContainerStore((s) => s.updateBoxPosition);
  const updateBoxRotation = useContainerStore((s) => s.updateBoxRotation);
  const commitHistory = useContainerStore((s) => s.commitHistory);
  const containerTypeId = useContainerStore((s) => s.containerTypeId);
  const axisConstraint = useContainerStore((s) => s.axisConstraint);
  const space = useContainerStore((s) => s.space);
  const container = getContainerType(containerTypeId);
  const box = boxes.find((b) => b.id === selectedId);

  // Track the target group via a useState (not a useRef) so reading it
  // during render is allowed by the react-hooks/refs lint rule.
  const [target, setTarget] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTarget(null);
      return;
    }
    const tryAttach = () => {
      const g = getBoxGroup(selectedId);
      if (g) {
        setTarget(g);
      } else {
        queueMicrotask(tryAttach);
      }
    };
    tryAttach();
  }, [selectedId, box?.position.x, box?.position.y, box?.position.z]);

  if (!box || !target) return null;

  const mode: "translate" | "rotate" | "scale" =
    tool === "rotate" ? "rotate" : tool === "scale" ? "scale" : "translate";

  // Axis constraint — hide the gizmo handles for locked-out axes.
  const showX = axisConstraint === "all" || axisConstraint === "x";
  const showY = axisConstraint === "all" || axisConstraint === "y";
  const showZ = axisConstraint === "all" || axisConstraint === "z";

  return (
    <TransformControls
      object={target}
      mode={mode}
      size={0.6}
      translationSnap={1}
      rotationSnap={Math.PI / 4}
      space={space}
      showX={showX}
      showY={showY}
      showZ={showZ}
      onMouseUp={() => {
        commitHistory();
      }}
      onObjectChange={() => {
        // Read the current transform straight from the THREE.Group and
        // commit it (clamped + collision-resolved + snapped) to the store.
        // The PackedBox's sync effect applies the clamped values back to the
        // group on the next render, so we never mutate the live group
        // inside this event handler.
        const obj = target as THREE.Group;

        // (a) Snap rotation first, derive the post-rotation render size.
        const deg = (obj.rotation.y * 180) / Math.PI;
        const snappedDeg = Math.round(deg / 90) * 90;
        const newRot = (((snappedDeg % 360) + 360) % 360) as BoxPlacement["rotationY"];
        const newSwapped = newRot === 90 || newRot === 270;
        const newRenderL = newSwapped ? box.size.w : box.size.l;
        const newRenderW = newSwapped ? box.size.l : box.size.w;

        // (b) Wall clamp using the NEW size so rotation+translation on the
        //     same frame is handled consistently.
        const minX = -container.inner.l / 2 + newRenderL / 2;
        const maxX = container.inner.l / 2 - newRenderL / 2;
        const minY = box.size.h / 2;
        const maxY = container.inner.h - box.size.h / 2;
        const minZ = -container.inner.w / 2 + newRenderW / 2;
        const maxZ = container.inner.w / 2 - newRenderW / 2;

        const cx = THREE.MathUtils.clamp(obj.position.x, minX, maxX);
        const cy = THREE.MathUtils.clamp(obj.position.y, minY, maxY);
        const cz = THREE.MathUtils.clamp(obj.position.z, minZ, maxZ);

        // (c) Box-to-box collision resolution. Store y is the bottom; the
        //     gizmo uses center, so convert before and after.
        const resolved = resolveCollisions(
          { x: cx, y: cy - box.size.h / 2, z: cz },
          { l: newRenderL, w: newRenderW, h: box.size.h },
          newRot,
          boxes.filter((b) => b.id !== box.id),
        );

        // (d) Re-clamp after the push (it may have landed outside the walls).
        const finalX = THREE.MathUtils.clamp(resolved.x, minX, maxX);
        const finalY = THREE.MathUtils.clamp(
          resolved.y,
          minY - box.size.h / 2,
          maxY - box.size.h / 2,
        );
        const finalZ = THREE.MathUtils.clamp(resolved.z, minZ, maxZ);

        // (e) Snap to the user's grid (snapCm from the store).
        const snapCm = useContainerStore.getState().snapCm;
        const sx = snap(finalX, snapCm);
        const sy = snap(finalY, snapCm);
        const sz = snap(finalZ, snapCm);

        updateBoxPosition(box.id, sx, sy, sz);
        updateBoxRotation(box.id, newRot);
      }}
    />
  );
}
