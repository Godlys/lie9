import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import type { EnginePart } from "../../data/rocketData";
import AnnotationLine from "../ui/AnnotationLine";

// Clipping plane for engine cutaway view during simulation
const CLIP_PLANE = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);

// ─────────────────────────────────────────────
// PartMesh – individual engine part
// ─────────────────────────────────────────────

function PartMesh({
  part,
  exploded,
  selected,
  simulating,
  onClick,
}: {
  part: EnginePart;
  exploded: number;
  selected: boolean;
  simulating: boolean;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    switch (part.geometry) {
      case "lathe":
        if (!part.profile) return new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32);
        return new THREE.LatheGeometry(
          part.profile.map(([r, y]) => new THREE.Vector2(r, y)),
          64,
        );
      case "cylinder":
        return new THREE.CylinderGeometry(0.1, 0.1, 0.3, 32);
      case "torus":
        return new THREE.TorusGeometry(0.2, 0.05, 16, 48);
      case "box":
        return new THREE.BoxGeometry(0.15, 0.15, 0.15);
      case "sphere":
        return new THREE.SphereGeometry(0.125, 32, 24);
      case "cone":
        return new THREE.ConeGeometry(0.15, 0.25, 32);
      default:
        return new THREE.BoxGeometry(0.125, 0.125, 0.125);
    }
  }, [part]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = new THREE.Vector3(
      THREE.MathUtils.lerp(part.assembledPos[0], part.explodedPos[0], exploded),
      THREE.MathUtils.lerp(part.assembledPos[1], part.explodedPos[1], exploded),
      THREE.MathUtils.lerp(part.assembledPos[2], part.explodedPos[2], exploded),
    );
    ref.current.position.lerp(target, delta * 6);
    if (selected) {
      ref.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), delta * 8);
    } else {
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 8);
    }

    // Turbopump high-speed rotation during simulation
    if (simulating && part.id === "turbopump") {
      ref.current.rotation.y += delta * 30;
    }
  });

  // ── emissive per part type ──────────────────
  let emissiveColor = "#000000";
  let emissiveIntensity = 0;

  if (selected) {
    emissiveColor = "#ff3b30";
    emissiveIntensity = 0.3;
  } else if (simulating) {
    switch (part.id) {
      case "combustion-chamber":
        emissiveColor = "#ff2200";
        emissiveIntensity = 0.8;
        break;
      case "nozzle":
        emissiveColor = "#ff4400";
        emissiveIntensity = 0.5;
        break;
      case "injector":
        emissiveColor = "#88bbff";
        emissiveIntensity = 0.5;
        break;
      case "gas-generator":
        emissiveColor = "#ff8800";
        emissiveIntensity = 0.4;
        break;
    }
  }

  return (
    <group ref={ref} position={part.assembledPos}>
      <mesh
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <meshPhysicalMaterial
          color={part.color}
          metalness={part.metalness}
          roughness={part.roughness}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          clearcoat={0.5}
          clippingPlanes={
            simulating && (part.id === "nozzle" || part.id === "combustion-chamber")
              ? [CLIP_PLANE]
              : []
          }
          clipShadows={
            simulating && (part.id === "nozzle" || part.id === "combustion-chamber")
          }
        />
      </mesh>
      {/* Outline for selected */}
      {selected && (
        <mesh geometry={geometry} scale={1.05}>
          <meshBasicMaterial color="#ff3b30" wireframe transparent opacity={0.4} />
        </mesh>
      )}

      {/* Nozzle structural stiffener rings */}
      {part.id === 'nozzle' && <NozzleStiffeners />}
    </group>
  );
}

// ─────────────────────────────────────────────
// NozzleStiffeners – 5 torus rings reinforcing the nozzle
// ─────────────────────────────────────────────

function NozzleStiffeners() {
  // Y heights (relative to nozzle group) and corresponding outer radii
  // sampled from the refined nozzleProfile, plus a small offset
  const rings = useMemo<
    { y: number; radius: number; tubeRadius: number }[]
  >(() => [
    { y: 0.05, radius: 0.19, tubeRadius: 0.007 },
    { y: 0.22, radius: 0.338, tubeRadius: 0.006 },
    { y: 0.38, radius: 0.343, tubeRadius: 0.006 },
    { y: 0.54, radius: 0.263, tubeRadius: 0.007 },
    { y: 0.70, radius: 0.148, tubeRadius: 0.006 },
  ], []);

  return (
    <>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          position={[0, ring.y, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[ring.radius, ring.tubeRadius, 12, 48]} />
          <meshPhysicalMaterial
            color="#4a4a54"
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// Pipes – turbopump ⇢ gas generator
// ─────────────────────────────────────────────

function Pipes({ parts, explodeProgress }: { parts: EnginePart[]; explodeProgress: number }) {
  const lineRef = useRef<any>(null);

  const tp = parts.find((p) => p.id === "turbopump")!;
  const gg = parts.find((p) => p.id === "gas-generator")!;

  useFrame(() => {
    if (!lineRef.current) return;
    const pos = lineRef.current.geometry.attributes.position;
    pos.setXYZ(
      0,
      THREE.MathUtils.lerp(tp.assembledPos[0], tp.explodedPos[0], explodeProgress),
      THREE.MathUtils.lerp(tp.assembledPos[1], tp.explodedPos[1], explodeProgress),
      THREE.MathUtils.lerp(tp.assembledPos[2], tp.explodedPos[2], explodeProgress),
    );
    pos.setXYZ(
      1,
      THREE.MathUtils.lerp(gg.assembledPos[0], gg.explodedPos[0], explodeProgress),
      THREE.MathUtils.lerp(gg.assembledPos[1], gg.explodedPos[1], explodeProgress),
      THREE.MathUtils.lerp(gg.assembledPos[2], gg.explodedPos[2], explodeProgress),
    );
    pos.needsUpdate = true;
  });

  const points = useMemo(
    () => [
      new THREE.Vector3(tp.assembledPos[0], tp.assembledPos[1], tp.assembledPos[2]),
      new THREE.Vector3(gg.assembledPos[0], gg.assembledPos[1], gg.assembledPos[2]),
    ],
    [tp, gg],
  );

  return (
    <Line
      ref={lineRef}
      points={points}
      color="#ff6600"
      lineWidth={1}
      transparent
      opacity={0.6}
    />
  );
}

// ─────────────────────────────────────────────
// GradientFlameCone – cone with y-gradient opacity
//    top (tip) = transparent, bottom (base) = opaque
// ─────────────────────────────────────────────

function GradientFlameCone({
  color,
  baseOpacity,
  radius,
  height,
  yOffset = 0,
}: {
  color: string;
  baseOpacity: number;
  radius: number;
  height: number;
  yOffset?: number;
}) {
  const geometry = useMemo(
    () => new THREE.ConeGeometry(radius, height, 32, 1, true),
    [radius, height],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uHeight: { value: height },
          uBaseOpacity: { value: baseOpacity },
        },
        vertexShader: `
          uniform float uHeight;
          varying float vNormalizedY;
          void main() {
            // Cone tip at y = height/2, base at y = -height/2
            // normalized: 0 at tip (top), 1 at base (bottom)
            vNormalizedY = 0.5 - position.y / uHeight;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uBaseOpacity;
          varying float vNormalizedY;
          void main() {
            float alpha = vNormalizedY * uBaseOpacity;
            gl_FragColor = vec4(uColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [color, baseOpacity, height],
  );

  return <mesh position={[0, yOffset, 0]} geometry={geometry} material={material} />;
}

// ─────────────────────────────────────────────
// FlameParticles – spark particles around the plume
// ─────────────────────────────────────────────

function FlameParticles({ active }: { active: boolean }) {
  const count = 150;
  const meshRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.05 + Math.random() * 0.35;
      const y = -Math.random() * 1.0;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!meshRef.current || !active) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.008;
      if (pos[i * 3 + 1] > 0.1) {
        const theta = Math.random() * Math.PI * 2;
        const r = 0.05 + Math.random() * 0.35;
        pos[i * 3] = Math.cos(theta) * r;
        pos[i * 3 + 1] = -Math.random() * 1.0;
        pos[i * 3 + 2] = Math.sin(theta) * r;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={meshRef} geometry={geometry} position={[0, -1.1, 0]}>
      <pointsMaterial
        size={0.018}
        color="#ff8844"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ─────────────────────────────────────────────
// EngineFlame – enhanced plume with gradient cones
// ─────────────────────────────────────────────

function EngineFlame({ active }: { active: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 25) * 0.5;
    }
  });

  if (!active) return null;

  return (
    <group position={[0, -1.1, 0]}>
      {/* Outer flame – large, diffuse */}
      <GradientFlameCone color="#ff4400" baseOpacity={0.45} radius={0.25} height={1.0} yOffset={-0.4} />
      {/* Mid flame */}
      <GradientFlameCone color="#ff8822" baseOpacity={0.6} radius={0.16} height={0.7} yOffset={-0.3} />
      {/* Inner core */}
      <GradientFlameCone color="#ffdd66" baseOpacity={0.75} radius={0.1} height={0.5} yOffset={-0.25} />
      {/* Brightest center */}
      <GradientFlameCone color="#ffffff" baseOpacity={0.9} radius={0.04} height={0.25} yOffset={-0.15} />

      {/* Particle detail */}
      <FlameParticles active={active} />

      {/* Dynamic light */}
      <pointLight ref={lightRef} position={[0, -0.3, 0]} color="#ff6600" intensity={2} distance={4} />
    </group>
  );
}

// ─────────────────────────────────────────────
// IgnitionSpark – fireball that travels from injector
//    down to combustion chamber over 1 second
// ─────────────────────────────────────────────

function IgnitionSpark({ active }: { active: boolean }) {
  const sparkRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef<number | null>(null);

  useFrame((state) => {
    if (!sparkRef.current) return;

    if (!active) {
      startTimeRef.current = null;
      sparkRef.current.visible = false;
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;

    if (elapsed > 1.0) {
      sparkRef.current.visible = false;
      return;
    }

    sparkRef.current.visible = true;
    const progress = elapsed / 1.0; // 0 → 1

    // Move from injector (y=0.38) down to combustion chamber center (y=0)
    sparkRef.current.position.y = 0.38 * (1 - progress);

    // Shrink as it travels
    const s = 0.08 * (1 - progress * 0.6);
    sparkRef.current.scale.setScalar(s);

    // Fade out in last 30 %
    const mat = sparkRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = progress < 0.7 ? 1.0 : 1.0 - (progress - 0.7) / 0.3;
  });

  return (
    <mesh ref={sparkRef} position={[0, 0.38, 0]} visible={false}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={1} />
    </mesh>
  );
}

export function MerlinEngine({
  parts,
  explodeProgress,
  selectedPart,
  simulating,
  onSelectPart,
}: {
  parts: EnginePart[];
  explodeProgress: number;
  selectedPart: string | null;
  simulating: boolean;
  onSelectPart: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Slow rotation when exploded, stop when simulating
      if (!simulating) {
        groupRef.current.rotation.y += delta * 0.15;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Pipes parts={parts} explodeProgress={explodeProgress} />
      {parts.map((part) => (
        <PartMesh
          key={part.id}
          part={part}
          exploded={explodeProgress}
          selected={selectedPart === part.id}
          simulating={simulating}
          onClick={() => onSelectPart(part.id)}
        />
      ))}
      {/* Annotation lines when exploded enough and not simulating */}
      {explodeProgress > 0.5 &&
        !simulating &&
        parts.map((part, idx) => (
          <AnnotationLine
            key={part.id}
            position={part.explodedPos}
            name={part.name}
            index={idx + 1}
          />
        ))}
      <EngineFlame active={simulating} />
      <IgnitionSpark active={simulating} />
      {/* Simulated inner glow from combustion chamber visible through nozzle */}
      {simulating && (
        <pointLight position={[0, 0.3, 0]} color="#ff2200" intensity={1.5} distance={1.5} />
      )}
      {simulating && (
        <pointLight position={[0, -0.6, 0]} color="#ff4400" intensity={0.8} distance={1.0} />
      )}
    </group>
  );
}
