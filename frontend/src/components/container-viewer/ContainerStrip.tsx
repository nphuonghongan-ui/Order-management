/**
 * Container3DNode — renders a single container (shell + boxes)
 * at a given world offset. Mirrors the look of the existing
 * single-container `Container` and `PackedBox` components but
 * accepts everything as props so it can be used inside a
 * multi-container scene.
 *
 * Shell is wireframe-only (no thick walls) to keep the multi-
 * view visually clean.
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Edges, Text } from "@react-three/drei";
import {
  getContainerType,
  type ContainerTypeId,
} from "@/components/container-viewer/units";
import type { BoxPlacement } from "@/components/container-viewer/types";
import {
  colorForPo,
  combinePoAndItemColor,
} from "@/lib/clp/poColor";

const FLOOR_THICKNESS_CM = 2.8;
const CORNER_OFFSETS: Array<[number, number, number]> = [
  [-1, 0, -1],
  [1, 0, -1],
  [-1, 0, 1],
  [1, 0, 1],
  [-1, 1, -1],
  [1, 1, -1],
  [-1, 0, 1],
  [1, 0, 1],
];

interface Props {
  containerTypeId: ContainerTypeId;
  boxes: BoxPlacement[];
  /** World-space X offset for this container (cm). */
  offsetX: number;
  /** Highlight this container (e.g. when selected in sidebar). */
  highlighted?: boolean;
  showLabels?: boolean;
  /** Notify parent of the world-space AABB (for camera framing). */
  onBounds?: (bounds: { minX: number; maxX: number; maxY: number }) => void;
  onBoxClick?: (boxId: string) => void;
  selectedBoxId?: string | null;
}

export function Container3DNode({
  containerTypeId,
  boxes,
  offsetX,
  highlighted = false,
  showLabels = false,
  onBounds,
  onBoxClick,
  selectedBoxId,
}: Props) {
  const container = getContainerType(containerTypeId);
  const { l, w, h } = container.inner;
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    onBounds?.({ minX: offsetX, maxX: offsetX + l, maxY: h });
  }, [offsetX, l, h, onBounds]);

  const floorColor = useMemo(() => new THREE.Color("#5a6678"), []);
  const edgesGeom = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(l, h, w)),
    [l, h, w]
  );

  return (
    <group ref={groupRef} position={[offsetX, 0, 0]}>
      {/* Floor */}
      <mesh position={[0, -FLOOR_THICKNESS_CM / 2, 0]} receiveShadow>
        <boxGeometry args={[l + 6, FLOOR_THICKNESS_CM, w + 6]} />
        <meshStandardMaterial
          color={floorColor}
          metalness={0.1}
          roughness={0.85}
        />
        <Edges color="#2c3340" />
      </mesh>

      {/* Inner volume edges */}
      <lineSegments
        geometry={edgesGeom}
        position={[0, h / 2, 0]}
      >
        <lineBasicMaterial
          color={highlighted ? "#fbbf24" : "#3b4a63"}
          linewidth={1}
        />
      </lineSegments>

      {/* Corner castings (8 small dark cubes) */}
      {CORNER_OFFSETS.map(([dx, dy, dz], i) => (
        <mesh
          key={i}
          position={[dx * (l / 2), dy * h, dz * (w / 2)]}
          castShadow
        >
          <boxGeometry args={[6, 6, 6]} />
          <meshStandardMaterial color="#2a2f3a" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}

      {/* Boxes */}
      {boxes.map((b) => {
        const swapped = b.rotationY === 90 || b.rotationY === 270;
        const renderL = swapped ? b.size.w : b.size.l;
        const renderW = swapped ? b.size.l : b.size.w;
        const poColor = colorForPo(b.poNum, b.partNum);
        const finalColor = b.color
          ? combinePoAndItemColor(poColor, b.color, 0.4)
          : poColor;
        const color = new THREE.Color(finalColor);
        const isSelected = selectedBoxId === b.id;
        return (
          <group
            key={b.id}
            position={[
              b.position.x,
              b.position.y + b.size.h / 2,
              b.position.z,
            ]}
            rotation={[0, (b.rotationY * Math.PI) / 180, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onBoxClick?.(b.id);
            }}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[renderL, b.size.h, renderW]} />
              <meshStandardMaterial
                color={isSelected ? "#fbbf24" : color}
                metalness={0.05}
                roughness={0.85}
              />
            </mesh>
            {showLabels && (
              <Text
                position={[0, b.size.h / 2 + 6, 0]}
                fontSize={Math.max(5, Math.min(renderL, renderW) * 0.15)}
                color="#e2e8f0"
                anchorX="center"
                anchorY="middle"
                outlineWidth={1.5}
                outlineColor="#0b0f1a"
              >
                {b.partNum}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}
