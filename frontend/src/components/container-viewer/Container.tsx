import { Grid } from "@react-three/drei";

interface ContainerProps {
  innerMm: { l: number; w: number; h: number };
  shellColor: string;
  showWalls: boolean;
  showGrid: boolean;
}

const WALL_THICKNESS = 4;

export default function Container({
  innerMm,
  shellColor,
  showWalls,
  showGrid,
}: ContainerProps) {
  const { l, w, h } = innerMm;
  const halfL = l / 2;
  const halfW = w / 2;
  const t = WALL_THICKNESS;

  return (
    <group position={[halfL, 0, halfW]}>
      {showGrid && (
        <Grid
          args={[l, w]}
          position={[0, 0.01, 0]}
          cellSize={50}
          cellThickness={0.6}
          cellColor="#2a3858"
          sectionSize={200}
          sectionThickness={1}
          sectionColor="#3b6fd9"
          fadeDistance={3000}
          fadeStrength={1.5}
          infiniteGrid={false}
        />
      )}
      {showWalls && (
        <group>
          <mesh position={[0, h / 2, -halfW - t / 2]}>
            <boxGeometry args={[l + t * 2, h, t]} />
            <meshStandardMaterial
              color={shellColor}
              transparent
              opacity={0.12}
            />
          </mesh>
          <mesh position={[0, h / 2, halfW + t / 2]}>
            <boxGeometry args={[l + t * 2, h, t]} />
            <meshStandardMaterial
              color={shellColor}
              transparent
              opacity={0.12}
            />
          </mesh>
          <mesh position={[-halfL - t / 2, h / 2, 0]}>
            <boxGeometry args={[t, h, w]} />
            <meshStandardMaterial
              color={shellColor}
              transparent
              opacity={0.12}
            />
          </mesh>
          <mesh position={[halfL + t / 2, h / 2, 0]}>
            <boxGeometry args={[t, h, w]} />
            <meshStandardMaterial
              color={shellColor}
              transparent
              opacity={0.12}
            />
          </mesh>
          <mesh position={[0, -t / 2, 0]}>
            <boxGeometry args={[l + t * 2, t, w + t * 2]} />
            <meshStandardMaterial
              color={shellColor}
              transparent
              opacity={0.18}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
