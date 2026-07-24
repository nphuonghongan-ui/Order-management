import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Outlines, Text, TransformControls } from "@react-three/drei";
import type { BoxPlacement } from "./types";
import { useContainerStore } from "../../stores/useContainerStore";
import { getContainerType } from "./units";

const HOVER_COLOR = new THREE.Color("#fbbf24");

function colorFromString(s: string): THREE.Color {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  const hue = (h % 360) / 360;
  const c = new THREE.Color();
  c.setHSL(hue, 0.55, 0.55);
  return c;
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

  const color = useMemo(
    () => (box.color ? new THREE.Color(box.color) : colorFromString(box.partNum)),
    [box.color, box.partNum],
  );

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
        {isSelected && <Outlines thickness={4} color="#fbbf24" />}
      </mesh>

      {showLabels && (
        <Text
          position={[0, box.size.h / 2 + 80, 0]}
          fontSize={Math.max(60, Math.min(renderL, renderW) * 0.18)}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
          outlineWidth={2}
          outlineColor="#ffffff"
        >
          {box.partNum}
        </Text>
      )}
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

  const swapped = box.rotationY === 90 || box.rotationY === 270;
  const renderL = swapped ? box.size.w : box.size.l;
  const renderW = swapped ? box.size.l : box.size.w;

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
      translationSnap={10}
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
        // commit it (clamped) to the store. The PackedBox's sync effect
        // applies the clamped values back to the group on the next render,
        // so we never mutate the live group inside this event handler.
        const obj = target as THREE.Group;
        const halfL = renderL / 2;
        const halfW = renderW / 2;
        const minX = -container.inner.l / 2 + halfL;
        const maxX = container.inner.l / 2 - halfL;
        const minY = box.size.h / 2;
        const maxY = container.inner.h - box.size.h / 2;
        const minZ = -container.inner.w / 2 + halfW;
        const maxZ = container.inner.w / 2 - halfW;
        const cx = THREE.MathUtils.clamp(obj.position.x, minX, maxX);
        const cy = THREE.MathUtils.clamp(obj.position.y, minY, maxY);
        const cz = THREE.MathUtils.clamp(obj.position.z, minZ, maxZ);
        const deg = (obj.rotation.y * 180) / Math.PI;
        const snapped = Math.round(deg / 90) * 90;
        updateBoxPosition(box.id, cx, cy - box.size.h / 2, cz);
        updateBoxRotation(
          box.id,
          (((snapped % 360) + 360) % 360) as BoxPlacement["rotationY"],
        );
      }}
    />
  );
}

// ------------------------------------------------------------------
// Non-component exports live in a sibling file (registry.ts) so
// react-refresh/only-export-components doesn't complain.
// ------------------------------------------------------------------
import { registerBoxGroup, getBoxGroup } from "./registry";
