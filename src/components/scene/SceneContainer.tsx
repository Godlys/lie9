import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment } from "@react-three/drei";
import { StarField } from "./StarField";
import { OverviewScene } from "./OverviewScene";
import { OctawebScene } from "./OctawebScene";
import { MerlinEngine } from "./MerlinEngine";
import { MERLIN_ENGINE_PARTS } from "../../data/rocketData";
import type { SceneMode } from "../../hooks/useSceneState";

function SceneContent({
  mode,
  explodeProgress,
  selectedPart,
  simulating,
  onSelectPart,
  onOverviewClick,
  onOctawebClick,
}: {
  mode: SceneMode;
  explodeProgress: number;
  selectedPart: string | null;
  simulating: boolean;
  onSelectPart: (id: string) => void;
  onOverviewClick: () => void;
  onOctawebClick: () => void;
}) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#4a6fa5" />
      <pointLight position={[0, -2, 0]} intensity={0.8} color="#ff3b30" distance={5} />
      <pointLight position={[-3, 2, -3]} intensity={1.5} color="#ff3b30" distance={10} />

      <ContactShadows resolution={512} scale={10} blur={2} opacity={0.5} far={10} color="#000000" position={[0, -2, 0]} />

      <StarField count={2000} />

      {mode === "overview" && (
        <OverviewScene onRocketClick={onOverviewClick} />
      )}
      {mode === "octaweb" && (
        <OctawebScene onEngineClick={onOctawebClick} />
      )}
      {mode === "engine" && (
        <MerlinEngine
          parts={MERLIN_ENGINE_PARTS}
          explodeProgress={explodeProgress}
          selectedPart={selectedPart}
          simulating={simulating}
          onSelectPart={onSelectPart}
        />
      )}
    </>
  );
}

export function SceneContainer({
  mode,
  explodeProgress,
  selectedPart,
  simulating,
  onSelectPart,
  onOverviewClick,
  onOctawebClick,
}: {
  mode: SceneMode;
  explodeProgress: number;
  selectedPart: string | null;
  simulating: boolean;
  onSelectPart: (id: string) => void;
  onOverviewClick: () => void;
  onOctawebClick: () => void;
}) {
  const cameraRef = useRef<React.ElementRef<typeof CameraControls>>(null);

  const cameraPositions: Record<SceneMode, [number, number, number]> = {
    overview: [0, 0, 4],
    octaweb: [0.5, 0.5, 1.2],
    engine: [2.0, 0.75, 2.5],
  };

  useEffect(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    const [cx, cy, cz] = cameraPositions[mode];
    cam.setLookAt(cx, cy, cz, 0, 0, 0, true);
  }, [mode]);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, localClippingEnabled: true }}
      onPointerMissed={() => onSelectPart("")}
      camera={{ fov: 45, position: [0, 0, 4] }}
    >
      <Suspense fallback={null}>
        <SceneContent
          mode={mode}
          explodeProgress={explodeProgress}
          selectedPart={selectedPart}
          simulating={simulating}
          onSelectPart={onSelectPart}
          onOverviewClick={onOverviewClick}
          onOctawebClick={onOctawebClick}
        />
        <Environment files="/hdri/dikhololo_night_1k.hdr" />
      </Suspense>
      <CameraControls
        ref={cameraRef}
        makeDefault
        minDistance={0.5}
        maxDistance={8}
      />
    </Canvas>
  );
}
