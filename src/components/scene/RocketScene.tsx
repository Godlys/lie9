import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { StarField } from "../effects/StarField";
import { Falcon9 } from "./Falcon9";

interface RocketSceneProps {
  explodeProgress: number;
  selectedPart: string | null;
  onSelectPart: (id: string | null) => void;
}

export function RocketScene({
  explodeProgress,
  selectedPart,
  onSelectPart,
}: RocketSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 80], fov: 50, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[30, 30, 30]} intensity={1.5} />
      <directionalLight position={[-30, -10, -20]} intensity={0.5} color="#4488ff" />
      <pointLight position={[0, 0, 50]} intensity={0.5} color="#ffffff" />

      {/* Stars */}
      <StarField count={3000} />

      {/* Rocket */}
      <Falcon9
        explodeProgress={explodeProgress}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
      />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        minDistance={30}
        maxDistance={200}
        autoRotate
        autoRotateSpeed={0.3}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
