import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROCKET_COMPONENTS, ENGINE_PARTS } from "@/data/rocketData";

interface Falcon9Props {
  explodeProgress: number;
  selectedPart: string | null;
  onSelectPart: (id: string | null) => void;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function RocketPart({
  component,
  explodeProgress,
  selected,
  onSelect,
}: {
  component: typeof ROCKET_COMPONENTS[0];
  explodeProgress: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const targetY = lerp(component.position[1], component.position[1] + component.explodeOffset[1], easeInOutCubic(explodeProgress));

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        0.08
      );
      // Subtle rotation
      meshRef.current.rotation.y += 0.001;
    }
  });

  // Dimensions based on component
  const heights: Record<string, number> = {
    fairing: 13.1,
    stage2: 14.8,
    stage1: 41.2,
  };
  const h = heights[component.id] || 10;
  const radius = 1.85; // Half of 3.7m diameter, scaled

  return (
    <group
      ref={meshRef}
      position={[component.position[0], component.position[1], component.position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Main body cylinder */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, h, 32, 1, false]} />
        <meshStandardMaterial
          color={component.color}
          metalness={0.7}
          roughness={0.3}
          emissive={selected ? "#224466" : "#000000"}
          emissiveIntensity={selected ? 0.5 : 0}
        />
      </mesh>

      {/* Fairing has a cone top */}
      {component.id === "fairing" && (
        <mesh position={[0, h / 2 + 3, 0]} castShadow>
          <coneGeometry args={[radius, 6, 32]} />
          <meshStandardMaterial color={component.color} metalness={0.7} roughness={0.3} />
        </mesh>
      )}

      {/* Stage1 has engine cluster at bottom */}
      {component.id === "stage1" && (
        <group position={[0, -h / 2 - 2, 0]}>
          {/* Octaweb engine plate */}
          <mesh>
            <cylinderGeometry args={[radius * 0.95, radius * 0.8, 1.5, 32]} />
            <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* 9 engine nozzles in Octaweb pattern */}
          {Array.from({ length: 9 }).map((_, i) => {
            const angle = (i / 9) * Math.PI * 2;
            const r = i === 8 ? 0 : 1.0; // Center engine + 8 around
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * r, -1.5, Math.sin(angle) * r]}
                rotation={[Math.PI, 0, 0]}
              >
                <coneGeometry args={[0.35, 1.5, 16]} />
                <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.3} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Stage2 has single vacuum engine */}
      {component.id === "stage2" && (
        <group position={[0, -h / 2 - 2, 0]}>
          <mesh>
            <cylinderGeometry args={[radius * 0.6, radius * 0.5, 1, 32]} />
            <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.4} />
          </mesh>
          <mesh position={[0, -1.5, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.6, 2.5, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* Interstage bands */}
      <mesh position={[0, h / 2 - 0.5, 0]}>
        <cylinderGeometry args={[radius * 1.02, radius * 1.02, 1, 32]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, -h / 2 + 0.5, 0]}>
        <cylinderGeometry args={[radius * 1.02, radius * 1.02, 1, 32]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function Falcon9({ explodeProgress, selectedPart, onSelectPart }: Falcon9Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {ROCKET_COMPONENTS.map((comp) => (
        <RocketPart
          key={comp.id}
          component={comp}
          explodeProgress={explodeProgress}
          selected={selectedPart === comp.id}
          onSelect={() => {
            onSelectPart(selectedPart === comp.id ? null : comp.id);
          }}
        />
      ))}

      {/* Engine parts (visible when stage1 is selected and exploded) */}
      {explodeProgress > 0.3 &&
        selectedPart === "stage1" &&
        ENGINE_PARTS.map((part) => {
          const partY = -25 + part.explodeOffset[1] * explodeProgress * 3;
          const partX = part.explodeOffset[0] * explodeProgress * 3;
          const partZ = part.explodeOffset[2] * explodeProgress * 3;
          return (
            <mesh
              key={part.id}
              position={[partX, partY, partZ]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart(part.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "default";
              }}
            >
              <boxGeometry args={[1.5, 1.5, 1.5]} />
              <meshStandardMaterial
                color={part.color}
                metalness={0.6}
                roughness={0.4}
                emissive={selectedPart === part.id ? part.color : "#000000"}
                emissiveIntensity={selectedPart === part.id ? 0.5 : 0}
              />
            </mesh>
          );
        })}
    </group>
  );
}
