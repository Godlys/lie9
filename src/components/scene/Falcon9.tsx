import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
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

/** Map engine part id → geometry type */
const PART_GEOMETRY: Record<string, "cylinder" | "sphere" | "cone" | "box" | "torus"> = {
  "combustion-chamber": "cylinder",
  "turbopump": "sphere",
  "nozzle": "cone",
  "gas-generator": "box",
  "thrust-frame": "torus",
};

/** Pre-built geometry elements for each part type */
function PartMesh({
  type,
  color,
  emissive,
  emissiveIntensity,
}: {
  type: "cylinder" | "sphere" | "cone" | "box" | "torus";
  color: string;
  emissive: string;
  emissiveIntensity: number;
}) {
  switch (type) {
    case "cylinder":
      return (
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} emissive={emissive} emissiveIntensity={emissiveIntensity} />
        </mesh>
      );
    case "sphere":
      return (
        <mesh>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} emissive={emissive} emissiveIntensity={emissiveIntensity} />
        </mesh>
      );
    case "cone":
      return (
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.5, 1.5, 16]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} emissive={emissive} emissiveIntensity={emissiveIntensity} />
        </mesh>
      );
    case "box":
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} emissive={emissive} emissiveIntensity={emissiveIntensity} />
        </mesh>
      );
    case "torus":
      return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.2, 12, 24]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} emissive={emissive} emissiveIntensity={emissiveIntensity} />
        </mesh>
      );
  }
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

      {/* Wireframe overlay for tech look */}
      <mesh>
        <cylinderGeometry args={[radius * 1.002, radius * 1.002, h, 16, 4, true]} />
        <meshBasicMaterial
          color="#44aaff"
          wireframe
          transparent
          opacity={0.15 * explodeProgress + 0.05}
        />
      </mesh>

      {/* Fairing has a cone top */}
      {component.id === "fairing" && (
        <>
          <mesh position={[0, h / 2 + 3, 0]} castShadow>
            <coneGeometry args={[radius, 6, 32]} />
            <meshStandardMaterial color={component.color} metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Wireframe for fairing cone */}
          <mesh position={[0, h / 2 + 3, 0]}>
            <coneGeometry args={[radius * 1.002, 6, 12, 1, true]} />
            <meshBasicMaterial
              color="#44aaff"
              wireframe
              transparent
              opacity={0.15 * explodeProgress + 0.05}
            />
          </mesh>
        </>
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

  // Engine part explosion: center is the stage1 engine cluster area
  const engineCenterY = -14 - 41.2 / 2 - 2; // stage1 pos + half height + engine offset

  // Scatter directions: 5 parts spread radially around Y axis, each with different Y offset
  const scatterConfigs = useMemo(() => [
    { angle: 0, yOff: 2, zOff: 0 },      // combustion chamber — forward
    { angle: Math.PI * 2 / 5, yOff: -1, zOff: 2.5 }, // turbopump — right-down
    { angle: Math.PI * 4 / 5, yOff: -3, zOff: 0 },   // nozzle — down
    { angle: Math.PI * 6 / 5, yOff: -1, zOff: -2.5 }, // gas generator — left-down
    { angle: Math.PI * 8 / 5, yOff: 1.5, zOff: -2 },  // thrust frame — back-up
  ], []);

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

      {/* Engine parts: explode from stage1 bottom when stage1 is selected */}
      {explodeProgress > 0.5 &&
        selectedPart === "stage1" &&
        ENGINE_PARTS.map((part, idx) => {
          const cfg = scatterConfigs[idx % scatterConfigs.length];
          const progress = easeInOutCubic(Math.min((explodeProgress - 0.5) / 0.3, 1));
          const spreadRadius = 4 + progress * 8;
          const x = Math.cos(cfg.angle) * spreadRadius;
          const z = Math.sin(cfg.angle) * spreadRadius;
          const y = engineCenterY + cfg.yOff * progress * 2 + cfg.zOff * progress;
          const partCenter = new THREE.Vector3(x, y, z);
          const origin = new THREE.Vector3(0, engineCenterY, 0);

          const geomType = PART_GEOMETRY[part.id] || "box";
          const isSelected = selectedPart === part.id;

          return (
            <group key={part.id}>
              {/* Connection line back to engine center */}
              <Line
                points={[
                  [origin.x, origin.y, origin.z],
                  [partCenter.x, partCenter.y, partCenter.z],
                ]}
                color="#44aaff"
                transparent
                opacity={Math.min(0.3 * progress, 0.3)}
                lineWidth={1}
              />

              {/* The part mesh */}
              <group
                position={[x, y, z]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart(isSelected ? null : part.id);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "default";
                }}
              >
                <PartMesh
                  type={geomType}
                  color={part.color}
                  emissive={isSelected ? part.color : "#000000"}
                  emissiveIntensity={isSelected ? 0.5 : 0}
                />

                {/* Hover glow ring */}
                <mesh>
                  <ringGeometry args={[1, 1.3, 24]} />
                  <meshBasicMaterial
                    color="#44aaff"
                    transparent
                    opacity={isSelected ? 0.4 : 0.15}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* Label (visible when explosion is well underway) */}
                {explodeProgress > 0.7 && (
                  <Html distanceFactor={30} center>
                    <div
                      style={{
                        background: "rgba(0, 10, 30, 0.85)",
                        border: "1px solid rgba(68, 170, 255, 0.5)",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        color: "#e0e8ff",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {part.nameEn}
                    </div>
                  </Html>
                )}
              </group>
            </group>
          );
        })}
    </group>
  );
}
