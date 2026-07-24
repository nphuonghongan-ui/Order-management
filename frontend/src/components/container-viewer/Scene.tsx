import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { Container } from "./Container";
import { PackedBoxes, SelectedGizmo } from "./PackedBox";
import { AxisGizmo } from "./AxisGizmo";
import { useContainerStore } from "../../stores/useContainerStore";
import { getContainerType } from "./units";
import type { ViewPreset } from "./types";

export function Scene() {
  const containerTypeId = useContainerStore((s) => s.containerTypeId);
  const showGrid = useContainerStore((s) => s.showGrid);
  const showAxes = useContainerStore((s) => s.showAxes);
  const view = useContainerStore((s) => s.view);
  const container = getContainerType(containerTypeId);
  const { l, h, w } = container.inner;
  const cameraPos = useMemo<[number, number, number]>(
    () => [l * 0.9, h * 1.1, w * 1.7],
    [l, h, w],
  );

  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, preserveDrawingBuffer: false }}
      onPointerMissed={() => {
        useContainerStore.getState().selectBox(null);
      }}
    >
      <DemandInvalidator />

      <color attach="background" args={["#0b0f1a"]} />
      <fog attach="fog" args={["#0b0f1a", l * 2, l * 5]} />

      <PerspectiveCamera
        makeDefault
        fov={35}
        near={10}
        far={l * 6}
        position={cameraPos}
      />

      <CameraRig view={view} target={[0, h / 2, 0]} container={container} />

      <ambientLight intensity={0.45} />
      <directionalLight
        position={[l * 0.8, h * 2.5, w * 1.2]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={l * 4}
        shadow-camera-left={-l}
        shadow-camera-right={l}
        shadow-camera-top={h * 1.5}
        shadow-camera-bottom={-1}
      />
      <directionalLight position={[-l * 0.6, h, -w]} intensity={0.25} />

      <Suspense fallback={null}>
        <Environment preset="warehouse" />
      </Suspense>

      {showGrid && (
        <Grid
          args={[l * 1.5, w * 1.5]}
          cellSize={100}
          cellThickness={0.5}
          cellColor="#1f2a3d"
          sectionSize={1000}
          sectionThickness={1}
          sectionColor="#3b4a63"
          fadeDistance={l * 1.2}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
          position={[0, -0.5, 0]}
        />
      )}

      {showAxes && <axesHelper args={[Math.min(l, w) * 0.4]} />}

      <Container />
      <PackedBoxes />
      <SelectedGizmo />

      <ContactShadows
        position={[0, 0.1, 0]}
        opacity={0.45}
        scale={l * 1.4}
        blur={2.4}
        far={h * 0.8}
        resolution={512}
        frames={1}
      />

      <OrbitControls
        makeDefault
        target={[0, h / 2, 0]}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={l * 0.3}
        maxDistance={l * 4}
        enableDamping={false}
      />

      <AxisGizmo />
      <PrecompileShaders
        deps={[containerTypeId, showGrid]}
      />
    </Canvas>
  );
}

/**
 * In frameloop="demand" the renderer only draws when something calls
 * `invalidate()`. R3F auto-invalidates on pointer events and OrbitControls
 * drag, but zustand store updates do not. This effect re-invalidates the
 * frame whenever the box array reference or the view preset changes.
 */
function DemandInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  const boxes = useContainerStore((s) => s.boxes);
  const view = useContainerStore((s) => s.view);
  const showWalls = useContainerStore((s) => s.showWalls);
  const showLabels = useContainerStore((s) => s.showLabels);
  useEffect(() => {
    invalidate();
  }, [invalidate, boxes, view, showWalls, showLabels]);
  return null;
}

/**
 * Pre-compile all GLSL shaders on a microtask after mount and whenever
 * the parts of the scene that introduce new materials change. This moves
 * the 50-300ms shader-compile hitch from "first user interaction" to
 * "page load", where the existing 5s loading splash absorbs it.
 */
function PrecompileShaders({ deps }: { deps: unknown[] }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    // Wait one microtask so child <mesh>es have committed and are in scene.
    const id = queueMicrotask(() => {
      gl.compile(scene, camera);
    });
    return () => {
      // queueMicrotask has no cancellation handle, but the closure guard
      // (deps) makes a stale compile call harmless.
      void id;
    };
    // The `deps` array is intentionally spread — callers pass whatever
    // store slices should trigger a recompile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera, ...deps]);
  return null;
}

function CameraRig({
  view,
  target,
  container,
}: {
  view: ViewPreset;
  target: [number, number, number];
  container: ReturnType<typeof getContainerType>;
}) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    const { l, h, w } = container.inner;
    const dist = Math.max(l, h, w) * 1.2;
    let pos: [number, number, number];
    switch (view) {
      case "top":
        pos = [0, dist, 0.001];
        break;
      case "front":
        pos = [0, h / 2, -dist];
        break;
      case "right":
        pos = [dist, h / 2, 0];
        break;
      case "iso":
      default:
        pos = [l * 0.9, h * 1.1, w * 1.7];
        break;
    }
    animateCamera(camera, pos, target, invalidate);
  }, [view, camera, container, target, invalidate]);
  return null;
}

function animateCamera(
  camera: THREE.Camera,
  to: [number, number, number],
  lookAt: [number, number, number],
  invalidate: () => void,
) {
  if (!(camera instanceof THREE.PerspectiveCamera)) return;
  const start = camera.position.clone();
  const end = new THREE.Vector3(...to);
  const startTime = performance.now();
  const duration = 400;
  function step(now: number) {
    const t = Math.min(1, (now - startTime) / duration);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.lerpVectors(start, end, ease);
    camera.lookAt(...lookAt);
    invalidate();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
