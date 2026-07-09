import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Simplified Falcon 9 rocket for overview */
export function OverviewScene({ onRocketClick }: { onRocketClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Stage 1 body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.4, 32]} />
        <meshStandardMaterial color="#e8e8ec" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Interstage */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.12, 32]} />
        <meshStandardMaterial color="#1a1a24" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Stage 2 body */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 32]} />
        <meshStandardMaterial color="#e8e8ec" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Nose cone / fairing */}
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.15, 0.3, 32]} />
        <meshStandardMaterial color="#d0d0d4" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Grid fins (4) */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.2, 0.5, Math.sin(angle) * 0.2]}
          rotation={[0, angle, 0]}
        >
          <boxGeometry args={[0.06, 0.12, 0.02]} />
          <meshStandardMaterial color="#2a2a36" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* Landing legs (4) */}
      {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((angle, i) => (
        <mesh
          key={`leg-${i}`}
          position={[Math.cos(angle) * 0.22, -0.75, Math.sin(angle) * 0.22]}
          rotation={[0, angle, -0.3]}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
          <meshStandardMaterial color="#3a3a44" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {/* Octaweb base (clickable) */}
      <mesh
        position={[0, -0.78, 0]}
        onClick={(e) => { e.stopPropagation(); onRocketClick(); }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <cylinderGeometry args={[0.16, 0.14, 0.08, 32]} />
        <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.3} emissive="#ff3b30" emissiveIntensity={0.05} />
      </mesh>
      {/* 9 mini nozzles visible from below */}
      {Array.from({ length: 9 }).map((_, i) => {
        const isCenter = i === 0;
        const r = 0.08;
        const angle = isCenter ? 0 : ((i - 1) / 8) * Math.PI * 2;
        return (
          <mesh
            key={`nozzle-${i}`}
            position={[
              isCenter ? 0 : Math.cos(angle) * r,
              -0.85,
              isCenter ? 0 : Math.sin(angle) * r,
            ]}
            rotation={[Math.PI, 0, 0]}
          >
            <coneGeometry args={[0.025, 0.04, 16, 1, true]} />
            <meshStandardMaterial color="#3a3a44" metalness={0.9} roughness={0.35} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* "Click to explore" glow ring */}
      <mesh position={[0, -0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.17, 0.19, 64]} />
        <meshBasicMaterial color="#ff3b30" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
