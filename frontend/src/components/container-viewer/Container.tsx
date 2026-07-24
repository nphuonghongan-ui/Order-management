import { useMemo } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import { getContainerType } from "./units";
import { useContainerStore } from "../../stores/useContainerStore";

const WALL_THICKNESS_MM = 30;
const FLOOR_THICKNESS_MM = 28;

export function Container() {
  const typeId = useContainerStore((s) => s.containerTypeId);
  const showWalls = useContainerStore((s) => s.showWalls);
  const container = getContainerType(typeId);
  const { l, w, h } = container.inner;

  const halfL = l / 2;
  const halfW = w / 2;

  const shellColor = useMemo(
    () => new THREE.Color(container.shellColor),
    [container.shellColor],
  );
  const floorColor = useMemo(() => new THREE.Color("#5a6678"), []);

  // Shared wall material — created once, mutated via clone for transparency.
  // FrontSide (not DoubleSide) since the walls form a closed box and back
  // faces are never visible from inside.
  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: shellColor,
        metalness: 0.55,
        roughness: 0.55,
        transparent: true,
        opacity: showWalls ? 0.45 : 0.06,
        side: THREE.FrontSide,
        depthWrite: true,
      }),
    [shellColor, showWalls],
  );

  const innerBoxGeom = useMemo(() => new THREE.BoxGeometry(l, h, w), [l, h, w]);
  const innerEdgesGeom = useMemo(
    () => new THREE.EdgesGeometry(innerBoxGeom),
    [innerBoxGeom],
  );

  return (
    <group>
      {/* Floor — sits at y=0 */}
      <mesh
        position={[0, -FLOOR_THICKNESS_MM / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[l + 60, FLOOR_THICKNESS_MM, w + 60]} />
        <meshStandardMaterial color={floorColor} metalness={0.1} roughness={0.85} />
        <Edges color="#2c3340" />
      </mesh>

      {/* Left wall (-X) */}
      <mesh
        position={[-halfL - WALL_THICKNESS_MM / 2, h / 2, 0]}
        material={wallMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[WALL_THICKNESS_MM, h, w]} />
      </mesh>

      {/* Right wall (+X) */}
      <mesh
        position={[halfL + WALL_THICKNESS_MM / 2, h / 2, 0]}
        material={wallMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[WALL_THICKNESS_MM, h, w]} />
      </mesh>

      {/* Top (+Y) */}
      <mesh
        position={[0, h + WALL_THICKNESS_MM / 2, 0]}
        material={wallMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[l, WALL_THICKNESS_MM, w]} />
      </mesh>

      {/* Front wall (-Z) */}
      <mesh
        position={[0, h / 2, -halfW - WALL_THICKNESS_MM / 2]}
        material={wallMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[l, h, WALL_THICKNESS_MM]} />
      </mesh>

      {/* Back wall (+Z) */}
      <mesh
        position={[0, h / 2, halfW + WALL_THICKNESS_MM / 2]}
        material={wallMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[l, h, WALL_THICKNESS_MM]} />
      </mesh>

      {/* Inner volume edges — always visible, sharp outline */}
      <lineSegments geometry={innerEdgesGeom}>
        <lineBasicMaterial color="#1c2330" />
      </lineSegments>

      {/* Corner castings (8 small dark cubes) */}
      {CORNER_OFFSETS.map(([dx, dy, dz], i) => (
        <mesh
          key={i}
          position={[dx * halfL, dy * h, dz * halfW]}
          castShadow
        >
          <boxGeometry args={[60, 60, 60]} />
          <meshStandardMaterial color="#2a2f3a" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

const CORNER_OFFSETS: Array<[number, number, number]> = [
  [-1, 0, -1],
  [1, 0, -1],
  [-1, 0, 1],
  [1, 0, 1],
  [-1, 1, -1],
  [1, 1, -1],
  [-1, 1, 1],
  [1, 1, 1],
];
