import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Boss color/tier config ─────────────────────────────

const BOSS_CONFIG: Record<string, { color: string; emissive: number; accent: string }> = {
  "boss-hermit-king":       { color: "#ff4466", emissive: 0.1, accent: "#ff8899" },
  "boss-ink-mother":        { color: "#aa55ff", emissive: 0.1, accent: "#cc88ff" },
  "boss-storm-sovereign":   { color: "#00ffd5", emissive: 0.2, accent: "#66ffee" },
  "boss-coral-colossus":    { color: "#00ff88", emissive: 0.2, accent: "#66ffbb" },
  "boss-fathom-wyrm":       { color: "#00aaff", emissive: 0.2, accent: "#66ccff" },
  "boss-kraken-prime":      { color: "#ff00aa", emissive: 0.3, accent: "#ff66cc" },
  "boss-phantom-leviathan": { color: "#00ffd5", emissive: 0.3, accent: "#88ffee" },
  "boss-iron-behemoth":     { color: "#ff4466", emissive: 0.3, accent: "#ff8899" },
  "boss-world-eater":       { color: "#ff00aa", emissive: 0.5, accent: "#ff44cc" },
  "boss-primordial-tide":   { color: "#ff00aa", emissive: 0.5, accent: "#ff66dd" },
};

// ─── Shared rotating group ──────────────────────────────

function RotatingGroup({
  children,
  hovered,
  speed = 0.3,
}: {
  children: React.ReactNode;
  hovered: boolean;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    const s = hovered ? speed * 3 : speed;
    ref.current.rotation.y += delta * s;
    ref.current.rotation.x += delta * s * 0.15;
  });
  return <group ref={ref}>{children}</group>;
}

// ─── BOSS GEOMETRIES ─────────────────────────────────────

// T1 — Hermit King (Crustacean): dome shell + claws + legs
function HermitKingGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Shell dome */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.9, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Shell ridges */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((a, i) => (
        <mesh key={i} position={[0, 0.25, 0]} rotation={[0, a, 0]}>
          <torusGeometry args={[0.85, 0.03, 6, 16, Math.PI]} />
          <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} emissive={accent} emissiveIntensity={emissive * 0.5} />
        </mesh>
      ))}
      {/* Left claw */}
      <group position={[-0.8, -0.3, 0.4]} rotation={[0, 0, 0.4]}>
        <mesh>
          <coneGeometry args={[0.18, 0.6, 6]} />
          <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
        </mesh>
        <mesh position={[0.12, 0.1, 0]} rotation={[0, 0, -0.6]}>
          <coneGeometry args={[0.12, 0.4, 5]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
        </mesh>
      </group>
      {/* Right claw */}
      <group position={[0.8, -0.3, 0.4]} rotation={[0, 0, -0.4]}>
        <mesh>
          <coneGeometry args={[0.18, 0.6, 6]} />
          <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
        </mesh>
        <mesh position={[-0.12, 0.1, 0]} rotation={[0, 0, 0.6]}>
          <coneGeometry args={[0.12, 0.4, 5]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
        </mesh>
      </group>
      {/* Legs */}
      {[-0.5, -0.2, 0.2, 0.5].map((x, i) => (
        <mesh key={`leg-${i}`} position={[x, -0.65, 0]} rotation={[0, 0, x * 0.3]}>
          <cylinderGeometry args={[0.04, 0.06, 0.4, 6]} />
          <meshStandardMaterial color={accent} metalness={0.3} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Eyes */}
      <mesh position={[-0.25, 0.05, 0.65]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffcc00" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.25, 0.05, 0.65]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffcc00" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

// T1 — Ink Mother (Mollusk): bulbous head + tentacles
function InkMotherGeo({ color, accent, emissive }: GeoProps) {
  const tentacleAngles = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2), []);
  return (
    <group>
      {/* Bulbous head */}
      <mesh position={[0, 0.3, 0]} scale={[1, 1.2, 0.9]}>
        <sphereGeometry args={[0.7, 16, 12]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Mantle */}
      <mesh position={[0, 0.7, 0]} scale={[0.6, 0.5, 0.5]}>
        <sphereGeometry args={[0.6, 12, 8]} />
        <meshStandardMaterial color={accent} metalness={0.2} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.3, 0.35, 0.5]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.3, 0.35, 0.5]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.6} />
      </mesh>
      {/* Tentacles */}
      {tentacleAngles.map((angle, i) => {
        const x = Math.cos(angle) * 0.4;
        const z = Math.sin(angle) * 0.4;
        const len = 0.5 + (i % 2) * 0.2;
        return (
          <group key={i} position={[x, -0.3, z]} rotation={[0.3 + (i % 3) * 0.15, angle, 0]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.02, len, 6]} />
              <meshStandardMaterial color={accent} metalness={0.1} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.3} />
            </mesh>
            <mesh position={[0.05, -len * 0.4, 0.03]} rotation={[0.4, 0, 0.3]}>
              <cylinderGeometry args={[0.04, 0.01, len * 0.5, 5]} />
              <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// T2 — Storm Sovereign (Jellyfish): bell dome + tendrils + electric rings
function StormSovereignGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Bell dome */}
      <mesh position={[0, 0.3, 0]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.8, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.3} emissive={color} emissiveIntensity={emissive} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner glow */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.5, 12, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} transparent opacity={0.3} />
      </mesh>
      {/* Electric rings */}
      {[0.65, 0.85].map((r, i) => (
        <mesh key={i} position={[0, 0.1, 0]} rotation={[Math.PI * 0.5, i * 0.5, 0]}>
          <torusGeometry args={[r, 0.015, 8, 32]} />
          <meshStandardMaterial color="#66ffee" emissive="#00ffd5" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Trailing tendrils */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 0.5;
        const z = Math.sin(angle) * 0.5;
        const len = 0.4 + (i % 3) * 0.15;
        return (
          <mesh key={i} position={[x, -0.3, z]}>
            <cylinderGeometry args={[0.02, 0.005, len, 4]} />
            <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.3} transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

// T2 — Coral Colossus (Flora): trunk + branching arms + polyps
function CoralColossusGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Central trunk */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 1.2, 8]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.7} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Branching arms */}
      {[
        { pos: [-0.4, 0.3, 0.15] as [number, number, number], rot: [0, 0, 0.7] as [number, number, number] },
        { pos: [0.5, 0.15, -0.1] as [number, number, number], rot: [0, 0.5, -0.6] as [number, number, number] },
        { pos: [-0.2, 0.5, -0.3] as [number, number, number], rot: [0.4, 0, 0.5] as [number, number, number] },
        { pos: [0.3, 0.4, 0.3] as [number, number, number], rot: [-0.3, 0, -0.8] as [number, number, number] },
      ].map((branch, i) => (
        <group key={i} position={branch.pos} rotation={branch.rot}>
          <mesh>
            <coneGeometry args={[0.1, 0.5, 6]} />
            <meshStandardMaterial color={accent} metalness={0.1} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.5} />
          </mesh>
          {/* Polyp clusters at tips */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.08, 0.25, 0.05]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color="#66ffbb" emissive={accent} emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
      {/* Base roots */}
      {[-0.3, 0.3, 0, -0.15, 0.15].map((x, i) => (
        <mesh key={`root-${i}`} position={[x, -0.7, (i % 2 ? 0.15 : -0.15)]} rotation={[0, 0, x * 0.5]}>
          <cylinderGeometry args={[0.06, 0.03, 0.3, 5]} />
          <meshStandardMaterial color={color} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.2} />
        </mesh>
      ))}
    </group>
  );
}

// T2 — Fathom Wyrm (Fish): elongated body + fins + scales ring
function FathomWyrmGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group rotation={[0.1, 0, 0.1]}>
      {/* Body - elongated */}
      <mesh scale={[0.5, 0.5, 1.3]}>
        <sphereGeometry args={[0.7, 16, 12]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.05, 0.8]} scale={[0.8, 0.7, 0.6]}>
        <sphereGeometry args={[0.4, 12, 8]} />
        <meshStandardMaterial color={accent} metalness={0.5} roughness={0.3} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.2, 0.15, 1.0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#00aaff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.2, 0.15, 1.0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#00aaff" emissiveIntensity={0.8} />
      </mesh>
      {/* Dorsal fin */}
      <mesh position={[0, 0.5, 0]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 4]} />
        <meshStandardMaterial color={accent} metalness={0.3} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, 0, -1.0]} rotation={[0, 0, 0]} scale={[0.8, 0.6, 0.3]}>
        <coneGeometry args={[0.4, 0.5, 4]} />
        <meshStandardMaterial color={accent} metalness={0.3} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Scale rings */}
      {[-0.4, 0, 0.4].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI * 0.5, 0, 0]}>
          <torusGeometry args={[0.35 - i * 0.03, 0.015, 6, 20]} />
          <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
    </group>
  );
}

// T3 — Kraken Prime (Abyssal): dodecahedron head + 8 arms + beak
function KrakenPrimeGeo({ color, accent, emissive }: GeoProps) {
  const armAngles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2), []);
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.2, 0]} scale={[1, 1.1, 0.9]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Beak */}
      <mesh position={[0, -0.15, 0.4]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.15, 0.35, 6]} />
        <meshStandardMaterial color="#220011" metalness={0.6} roughness={0.3} emissive={color} emissiveIntensity={emissive * 0.2} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.3, 0.3, 0.45]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0.3, 0.3, 0.45]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.9} />
      </mesh>
      {/* 8 Arms */}
      {armAngles.map((angle, i) => {
        const x = Math.cos(angle) * 0.5;
        const z = Math.sin(angle) * 0.5;
        const len = 0.6 + (i % 3) * 0.15;
        return (
          <group key={i} position={[x, -0.3, z]} rotation={[0.5 + (i % 2) * 0.2, angle, 0]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.02, len, 6]} />
              <meshStandardMaterial color={accent} metalness={0.2} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
            </mesh>
            {/* Suckers */}
            {[0.15, 0.3].map((y, j) => (
              <mesh key={j} position={[0.05, -y, 0]}>
                <sphereGeometry args={[0.025, 6, 6]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive * 0.5} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

// T3 — Phantom Leviathan (Jellyfish): translucent stretched form
function PhantomLeviathanGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Main translucent body */}
      <mesh scale={[0.6, 1.2, 0.6]}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.2} emissive={color} emissiveIntensity={emissive} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner wireframe */}
      <mesh scale={[0.55, 1.15, 0.55]}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color={accent} wireframe emissive={accent} emissiveIntensity={emissive * 0.6} transparent opacity={0.3} />
      </mesh>
      {/* Core glow */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.25, 12, 8]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.8} transparent opacity={0.5} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.2, 0.4, 0.35]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={1.0} />
      </mesh>
      <mesh position={[0.2, 0.4, 0.35]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={1.0} />
      </mesh>
      {/* Spectral tendrils */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 0.3;
        const z = Math.sin(angle) * 0.3;
        return (
          <mesh key={i} position={[x, -0.7, z]}>
            <cylinderGeometry args={[0.015, 0.003, 0.5 + (i % 2) * 0.2, 4]} />
            <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.4} transparent opacity={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

// T3 — Iron Behemoth (Crustacean): armored box + heavy legs + claws
function IronBehemothGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Main armored body */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.0, 0.6, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Head plate */}
      <mesh position={[0, 0.3, 0.45]}>
        <boxGeometry args={[0.7, 0.35, 0.15]} />
        <meshStandardMaterial color={accent} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      {/* Eyes (recessed) */}
      <mesh position={[-0.2, 0.35, 0.53]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0.2, 0.35, 0.53]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.7} />
      </mesh>
      {/* 4 heavy legs */}
      {[
        [-0.4, -0.4, 0.25],
        [0.4, -0.4, 0.25],
        [-0.4, -0.4, -0.25],
        [0.4, -0.4, -0.25],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.1, 0.12, 0.5, 6]} />
          <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Crushing claws */}
      <group position={[-0.7, 0.0, 0.45]} rotation={[0, 0.3, 0.3]}>
        <mesh>
          <boxGeometry args={[0.2, 0.12, 0.35]} />
          <meshStandardMaterial color={accent} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={emissive} />
        </mesh>
      </group>
      <group position={[0.7, 0.0, 0.45]} rotation={[0, -0.3, -0.3]}>
        <mesh>
          <boxGeometry args={[0.2, 0.12, 0.35]} />
          <meshStandardMaterial color={accent} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={emissive} />
        </mesh>
      </group>
      {/* Armor ridges */}
      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={`ridge-${i}`} position={[0, 0.42, z]}>
          <boxGeometry args={[0.8, 0.04, 0.05]} />
          <meshStandardMaterial color={accent} metalness={0.9} roughness={0.1} emissive={accent} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
    </group>
  );
}

// T4 — World Eater (Abyssal): massive jaws + eye cluster + spines
function WorldEaterGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Upper jaw */}
      <mesh position={[0, 0.25, 0.2]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.6, 0.8, 8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Lower jaw */}
      <mesh position={[0, -0.25, 0.2]} rotation={[Math.PI - 0.3, 0, 0]}>
        <coneGeometry args={[0.55, 0.7, 8]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.8} />
      </mesh>
      {/* Teeth (upper) */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = ((i / 6) * Math.PI * 2) - Math.PI * 0.5;
        const x = Math.cos(angle) * 0.35;
        const z = Math.sin(angle) * 0.35 + 0.3;
        return (
          <mesh key={`tooth-${i}`} position={[x, -0.05, z]} rotation={[0.2, 0, 0]}>
            <coneGeometry args={[0.04, 0.18, 4]} />
            <meshStandardMaterial color="#ffeecc" emissive="#ffcc00" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      {/* Eye cluster */}
      {[
        [0, 0.5, 0.5],
        [-0.15, 0.55, 0.4],
        [0.15, 0.55, 0.4],
        [0, 0.6, 0.35],
      ].map((pos, i) => (
        <mesh key={`eye-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.07 - i * 0.01, 8, 8]} />
          <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={1.0} />
        </mesh>
      ))}
      {/* Spine ridges along back */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`spine-${i}`} position={[0, 0.45 + i * 0.08, -0.2 - i * 0.15]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.06, 0.25 - i * 0.03, 4]} />
          <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.5} />
        </mesh>
      ))}
      {/* Outer wireframe aura (T4 menacing effect) */}
      <mesh scale={[1.3, 1.3, 1.3]}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={emissive * 0.4} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// T4 — Primordial Tide (Abyssal): torus knot + ripple rings + ancient eye
function PrimordialTideGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Flowing torus knot form */}
      <mesh>
        <torusKnotGeometry args={[0.5, 0.12, 100, 12, 2, 3]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Rippling rings */}
      {[0.7, 0.85, 1.0].map((r, i) => (
        <mesh key={i} rotation={[Math.PI * 0.5 + i * 0.15, i * 0.3, 0]}>
          <torusGeometry args={[r, 0.012, 8, 40]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={emissive * 0.4} transparent opacity={0.4 - i * 0.1} />
        </mesh>
      ))}
      {/* Ancient eye core */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 12]} />
        <meshStandardMaterial color="#ff0066" emissive="#ff0066" emissiveIntensity={1.2} />
      </mesh>
      {/* Eye iris */}
      <mesh position={[0, 0, 0.15]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#000000" emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {/* Outer wireframe aura (T4) */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={emissive * 0.3} transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// ─── Geometry prop type ──────────────────────────────────

interface GeoProps {
  color: string;
  accent: string;
  emissive: number;
}

// ─── Boss ID → geometry mapping ──────────────────────────

const BOSS_GEOMETRY: Record<string, React.FC<GeoProps>> = {
  "boss-hermit-king": HermitKingGeo,
  "boss-ink-mother": InkMotherGeo,
  "boss-storm-sovereign": StormSovereignGeo,
  "boss-coral-colossus": CoralColossusGeo,
  "boss-fathom-wyrm": FathomWyrmGeo,
  "boss-kraken-prime": KrakenPrimeGeo,
  "boss-phantom-leviathan": PhantomLeviathanGeo,
  "boss-iron-behemoth": IronBehemothGeo,
  "boss-world-eater": WorldEaterGeo,
  "boss-primordial-tide": PrimordialTideGeo,
};

// ─── Main Component ─────────────────────────────────────

export function BossModel3D({
  bossId,
  size = "sm",
  className = "",
}: {
  bossId: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const config = BOSS_CONFIG[bossId] || { color: "#9ca3af", emissive: 0.2, accent: "#cccccc" };
  const GeoComponent = BOSS_GEOMETRY[bossId];

  const dims = size === "lg" ? { w: 200, h: 200 } : { w: 80, h: 80 };

  if (!GeoComponent) {
    return <div style={{ width: dims.w, height: dims.h }} className={className} />;
  }

  return (
    <div
      style={{ width: dims.w, height: dims.h }}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.2} color={config.color} />
        <pointLight position={[-2, -1, 2]} intensity={0.6} color={config.accent} />
        <RotatingGroup hovered={hovered}>
          <GeoComponent color={config.color} accent={config.accent} emissive={config.emissive} />
        </RotatingGroup>
      </Canvas>
    </div>
  );
}
