import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Falcon 9 overview with detailed procedural geometry ──

const BODY_RADIUS = 0.15;

// ---- Helper: a ring of thin panel lines wrapped around the body ----
function PanelLines({
  y,
  count = 4,
  radius = BODY_RADIUS + 0.001,
  color = "#1a1a24",
}: {
  y: number;
  count?: number;
  radius?: number;
  color?: string;
}) {
  const points = useMemo(() => {
    const segs = 48;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segs; i++) {
      const theta = (i / segs) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    return pts;
  }, [radius]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <group position={[0, y, 0]}>
      {Array.from({ length: count }).map((_, i) => (
        <lineSegments key={i} geometry={geometry}>
          <lineBasicMaterial color={color} transparent opacity={0.35} />
        </lineSegments>
      ))}
    </group>
  );
}

// ---- Small vertical panel seam lines on the body ----
function VerticalSeams({
  yStart,
  yEnd,
  count = 6,
  radius = BODY_RADIUS + 0.001,
}: {
  yStart: number;
  yEnd: number;
  count?: number;
  radius?: number;
}) {
  const lines = useMemo(() => {
    const group = new THREE.Group();
    Array.from({ length: count }).forEach((_, i) => {
      const theta = (i / count) * Math.PI * 2;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, yStart, z),
        new THREE.Vector3(x, yEnd, z),
      ]);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#1a1a24", transparent: true, opacity: 0.12 }));
      group.add(line);
    });
    return group;
  }, [yStart, yEnd, count, radius]);

  return <primitive object={lines} />;
}

// ---- Grid fin with lattice structure ----
function GridFin() {
  const finWidth = 0.07;
  const finHeight = 0.14;
  const finDepth = 0.04;
  const barThick = 0.003;
  const latticeCount = 5;

  // outer frame
  const frame = useMemo(() => {
    const shape = new THREE.Shape();
    const hw = finWidth / 2;
    const hh = finHeight / 2;
    shape.moveTo(-hw, -hh);
    shape.lineTo(hw, -hh);
    shape.lineTo(hw, hh);
    shape.lineTo(-hw, hh);
    shape.lineTo(-hw, -hh);
    const extrudeSettings = { depth: finDepth, bevelEnabled: false };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // lattice bars (horizontal & vertical thin boxes)
  const bars = useMemo(() => {
    const result: { position: [number, number, number]; scale: [number, number, number] }[] = [];
    const spacing = finHeight / (latticeCount + 1);
    for (let i = 1; i <= latticeCount; i++) {
      const yPos = -finHeight / 2 + i * spacing;
      result.push({
        position: [0, yPos, 0],
        scale: [finWidth - 0.01, barThick, finDepth + 0.001],
      });
    }
    const hSpacing = finWidth / (latticeCount + 1);
    for (let i = 1; i <= latticeCount; i++) {
      const xPos = -finWidth / 2 + i * hSpacing;
      result.push({
        position: [xPos, 0, 0],
        scale: [barThick, finHeight - 0.01, finDepth + 0.001],
      });
    }
    return result;
  }, []);

  return (
    <group>
      {/* Outer frame */}
      <mesh rotation={[0, 0, 0]}>
        <primitive object={frame} />
        <meshStandardMaterial color="#2a2a36" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Lattice bars */}
      {bars.map((b, i) => (
        <mesh key={i} position={b.position}>
          <boxGeometry args={b.scale} />
          <meshStandardMaterial color="#3a3a4a" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* Mounting strut */}
      <mesh position={[-finWidth / 2 - 0.01, 0, 0]}>
        <boxGeometry args={[0.008, finHeight * 0.4, 0.008]} />
        <meshStandardMaterial color="#2a2a36" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ---- A-frame landing leg with footpad ----
function LandingLeg() {
  const legHeight = 0.28;
  const legWidth = 0.06;
  const strutRadius = 0.004;

  return (
    <group>
      {/* Main strut (A-frame left) */}
      <mesh position={[-legWidth / 2, -legHeight / 2, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[strutRadius, strutRadius * 1.2, legHeight, 6]} />
        <meshStandardMaterial color="#3a3a44" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Main strut (A-frame right) */}
      <mesh position={[legWidth / 2, -legHeight / 2, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[strutRadius, strutRadius * 1.2, legHeight, 6]} />
        <meshStandardMaterial color="#3a3a44" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Cross brace */}
      <mesh position={[0, -legHeight * 0.45, 0]}>
        <boxGeometry args={[legWidth * 0.85, strutRadius * 0.8, strutRadius * 0.8]} />
        <meshStandardMaterial color="#3a3a44" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Footpad */}
      <mesh position={[0, -legHeight, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.006, 12]} />
        <meshStandardMaterial color="#4a4a54" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Hinge point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshStandardMaterial color="#2a2a36" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

// ---- Octaweb engine cluster ----
function Octaweb({ onClick }: { onClick: () => void }) {
  const outerRing = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 8;
    const r = 0.09;
    return { x: Math.cos(angle) * r, z: Math.sin(angle) * r };
  });

  return (
    <group position={[0, -0.78, 0]}>
      {/* Octaweb base plate */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <cylinderGeometry args={[0.16, 0.14, 0.06, 32]} />
        <meshStandardMaterial
          color="#1a1a24"
          metalness={0.8}
          roughness={0.3}
          emissive="#ff3b30"
          emissiveIntensity={0.05}
        />
      </mesh>
      {/* Outer ring nozzles */}
      {outerRing.map((p, i) => (
        <mesh
          key={`nozzle-${i}`}
          position={[p.x, -0.04, p.z]}
          rotation={[Math.PI, 0, 0]}
        >
          <coneGeometry args={[0.016, 0.035, 12, 1, true]} />
          <meshStandardMaterial
            color="#3a3a44"
            metalness={0.9}
            roughness={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Center nozzle */}
      <mesh position={[0, -0.04, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.018, 0.04, 12, 1, true]} />
        <meshStandardMaterial
          color="#3a3a44"
          metalness={0.9}
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.17, 0.19, 64]} />
        <meshBasicMaterial
          color="#ff3b30"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ============================================================

export function OverviewScene({ onRocketClick }: { onRocketClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const R = BODY_RADIUS;

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* ═══════════ STAGE 1 (booster) ═══════════ */}
      {/* Main Stage 1 body - white */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[R, R, 1.4, 32]} />
        <meshStandardMaterial color="#e8e8ec" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* SpaceX identification band — dark band near the top of stage 1 */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[R + 0.001, R + 0.001, 0.035, 32]} />
        <meshStandardMaterial color="#1a1a24" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Stage 1 panel lines (horizontal grooves) */}
      {[-0.5, -0.2, 0.1, 0.4].map((y) => (
        <PanelLines key={`s1-groove-${y}`} y={y} count={2} />
      ))}
      <VerticalSeams yStart={-0.7} yEnd={0.7} count={8} />

      {/* COPV bottles (small helium tanks visible on stage 1) */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh
          key={`copv-${i}`}
          position={[
            Math.cos(angle) * (R + 0.015),
            -0.1,
            Math.sin(angle) * (R + 0.015),
          ]}
        >
          <cylinderGeometry args={[0.012, 0.012, 0.08, 12]} />
          <meshStandardMaterial color="#c0c0c8" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* ═══════════ INTERSTAGE ═══════════ */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[R, R, 0.12, 32]} />
        <meshStandardMaterial color="#1a1a24" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Interstage joint ring */}
      <mesh position={[0, 0.84, 0]}>
        <torusGeometry args={[R, 0.006, 8, 32]} />
        <meshStandardMaterial color="#2a2a36" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <torusGeometry args={[R, 0.006, 8, 32]} />
        <meshStandardMaterial color="#2a2a36" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* ═══════════ STAGE 2 ═══════════ */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[R, R, 0.6, 32]} />
        <meshStandardMaterial color="#e8e8ec" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Stage 2 panel lines */}
      {[0.92, 1.08, 1.28, 1.4].map((y) => (
        <PanelLines key={`s2-groove-${y}`} y={y} count={1} color="#1a1a24" />
      ))}
      <VerticalSeams yStart={0.85} yEnd={1.45} count={6} />

      {/* Stage 2 black band (near top) */}
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[R + 0.001, R + 0.001, 0.025, 32]} />
        <meshStandardMaterial color="#1a1a24" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* ═══════════ FAIRING (two-part) ═══════════ */}
      {/* Fairing cylindrical base section */}
      <mesh position={[0, 1.53, 0]}>
        <cylinderGeometry args={[R, R, 0.12, 32]} />
        <meshStandardMaterial color="#d8d8dc" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Fairing taper section */}
      <mesh position={[0, 1.68, 0]}>
        <cylinderGeometry args={[R, R * 0.7, 0.18, 32]} />
        <meshStandardMaterial color="#d8d8dc" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 1.88, 0]}>
        <coneGeometry args={[R * 0.7, 0.22, 32]} />
        <meshStandardMaterial color="#d0d0d4" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Nose tip */}
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Fairing panel seam line (vertical split line) */}
      {(() => {
        const seamGroup = new THREE.Group();
        [0, Math.PI].forEach((angle) => {
          const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(Math.cos(angle) * (R + 0.001), 1.47, Math.sin(angle) * (R + 0.001)),
            new THREE.Vector3(Math.cos(angle) * (R + 0.001), 1.97, Math.sin(angle) * (R + 0.001)),
          ]);
          const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#1a1a24", transparent: true, opacity: 0.25 }));
          seamGroup.add(line);
        });
        return <primitive object={seamGroup} />;
      })()}

      {/* ═══════════ GRID FINS (4, at bottom of stage 1) ═══════════ */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group
          key={`gridfin-${i}`}
          position={[
            Math.cos(angle) * (R + 0.005),
            -0.55,
            Math.sin(angle) * (R + 0.005),
          ]}
          rotation={[0, angle, 0]}
        >
          <GridFin />
        </group>
      ))}

      {/* ═══════════ LANDING LEGS (4, deployed) ═══════════ */}
      {[
        Math.PI / 4,
        (3 * Math.PI) / 4,
        (5 * Math.PI) / 4,
        (7 * Math.PI) / 4,
      ].map((angle, i) => (
        <group
          key={`leg-${i}`}
          position={[
            Math.cos(angle) * (R + 0.01),
            -0.6,
            Math.sin(angle) * (R + 0.01),
          ]}
          rotation={[0, angle, 0.15]}
        >
          <LandingLeg />
        </group>
      ))}

      {/* ═══════════ ENGINE CLUSTER (Octaweb) ═══════════ */}
      <Octaweb onClick={onRocketClick} />

      {/* ═══════════ NOSE TIP LIGHT ═══════════ */}
      <mesh position={[0, 2.0, 0]}>
        <pointLight intensity={0.3} distance={0.5} color="#ff6b3b" />
      </mesh>
    </group>
  );
}
