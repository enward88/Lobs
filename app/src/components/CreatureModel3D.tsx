import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SPECIES_FAMILY, FAMILY_COLOR } from "../lib/program";

// ─── GeoProps interface ──────────────────────────────────

interface GeoProps {
  color: string;
  accent: string;
  emissive: number;
}

// ─── Per-family color config ─────────────────────────────

const FAMILY_ACCENT: Record<string, string> = {
  Crustacean: "#ff8899",
  Mollusk: "#cc88ff",
  Jellyfish: "#66ffee",
  Fish: "#66ccff",
  Flora: "#66ffbb",
  Abyssal: "#ff66cc",
};

const FAMILY_EMISSIVE: Record<string, number> = {
  Crustacean: 0.15,
  Mollusk: 0.15,
  Jellyfish: 0.25,
  Fish: 0.15,
  Flora: 0.20,
  Abyssal: 0.25,
};

function getCreatureConfig(species: number) {
  const family = SPECIES_FAMILY[species] || "Crustacean";
  const color = FAMILY_COLOR[family] || "#ff4466";
  const accent = FAMILY_ACCENT[family] || "#ff8899";
  const emissive = FAMILY_EMISSIVE[family] || 0.15;
  return { color, accent, emissive };
}

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

// ═══════════════════════════════════════════════════════════
// CRUSTACEANS (0-4) — #ff4466
// ═══════════════════════════════════════════════════════════

// 0: Snapclaw — Aggressive lobster
function SnapclawGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Body */}
      <mesh scale={[1.0, 0.6, 0.7]}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Tail segments */}
      {[0.45, 0.65, 0.82].map((z, i) => (
        <mesh key={i} position={[0, -0.02 * i, -z]} rotation={[0.05 * i, 0, 0]}>
          <cylinderGeometry args={[0.18 - i * 0.03, 0.22 - i * 0.03, 0.15, 6]} />
          <meshStandardMaterial color={accent} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.5} />
        </mesh>
      ))}
      {/* Left claw (large) */}
      <group position={[-0.45, -0.05, 0.3]} rotation={[0, 0.3, 0.3]}>
        <mesh>
          <coneGeometry args={[0.12, 0.4, 5]} />
          <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
        </mesh>
        <mesh position={[0.08, 0.05, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.08, 0.3, 5]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
        </mesh>
      </group>
      {/* Right claw (smaller) */}
      <group position={[0.45, -0.05, 0.3]} rotation={[0, -0.3, -0.3]} scale={[0.7, 0.7, 0.7]}>
        <mesh>
          <coneGeometry args={[0.12, 0.4, 5]} />
          <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
        </mesh>
        <mesh position={[-0.08, 0.05, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.08, 0.3, 5]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
        </mesh>
      </group>
      {/* Legs */}
      {[-0.25, -0.1, 0.1, 0.25].map((x, i) => (
        <mesh key={`leg-${i}`} position={[x, -0.35, 0]} rotation={[0, 0, x * 0.4]}>
          <cylinderGeometry args={[0.025, 0.04, 0.25, 5]} />
          <meshStandardMaterial color={accent} metalness={0.3} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Eye stalks + eyes */}
      {[-0.12, 0.12].map((x, i) => (
        <group key={`eye-${i}`} position={[x, 0.15, 0.35]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 5]} />
            <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffcc00" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
      {/* Antennae */}
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={`ant-${i}`} position={[x, 0.1, 0.4]} rotation={[0.5, i ? 0.2 : -0.2, 0]}>
          <cylinderGeometry args={[0.012, 0.008, 0.35, 4]} />
          <meshStandardMaterial color={accent} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.2} />
        </mesh>
      ))}
    </group>
  );
}

// 1: Tidecrawler — Swift crab
function TidecrawlerGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Wide flat body */}
      <mesh scale={[1.0, 0.4, 0.8]}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Shell ridges */}
      {[0, 1.0, 2.1].map((a, i) => (
        <mesh key={i} position={[0, 0.08, 0]} rotation={[0, a, 0]}>
          <torusGeometry args={[0.45, 0.02, 6, 14, Math.PI]} />
          <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={accent} emissiveIntensity={emissive * 0.4} />
        </mesh>
      ))}
      {/* Small claws */}
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={`claw-${i}`} position={[x, -0.05, 0.35]} rotation={[0, i ? -0.3 : 0.3, i ? -0.4 : 0.4]}>
          <coneGeometry args={[0.07, 0.2, 5]} />
          <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
        </mesh>
      ))}
      {/* 6 legs */}
      {[-0.35, -0.2, -0.05, 0.05, 0.2, 0.35].map((x, i) => (
        <mesh key={`leg-${i}`} position={[x < 0 ? x - 0.1 : x + 0.1, -0.22, (i % 2) * 0.05]} rotation={[0, 0, x * 0.5]}>
          <cylinderGeometry args={[0.02, 0.03, 0.28, 5]} />
          <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Wide eye stalks */}
      {[-0.2, 0.2].map((x, i) => (
        <group key={`eye-${i}`} position={[x, 0.12, 0.3]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.12, 5]} />
            <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffcc00" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 2: Ironpincer — Armored crab
function IronpincerGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Armored box body */}
      <mesh>
        <boxGeometry args={[0.7, 0.35, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Armor plates on top */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.55, 0.05, 0.4]} />
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.2} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.4, 0.04, 0.3]} />
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.2} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
      {/* Heavy box claws */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={`claw-${i}`} position={[x, 0, 0.2]} rotation={[0, i ? -0.2 : 0.2, i ? -0.2 : 0.2]}>
          <boxGeometry args={[0.12, 0.08, 0.25]} />
          <meshStandardMaterial color={accent} metalness={0.7} roughness={0.2} emissive={color} emissiveIntensity={emissive * 0.8} />
        </mesh>
      ))}
      {/* 4 thick legs */}
      {[[-0.25, 0.15], [0.25, 0.15], [-0.25, -0.15], [0.25, -0.15]].map(([x, z], i) => (
        <mesh key={`leg-${i}`} position={[x, -0.28, z]}>
          <cylinderGeometry args={[0.05, 0.06, 0.2, 6]} />
          <meshStandardMaterial color={accent} metalness={0.6} roughness={0.3} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Visor eye slits */}
      <mesh position={[0, 0.12, 0.26]}>
        <boxGeometry args={[0.35, 0.04, 0.02]} />
        <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.1} />
      </mesh>
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.12, 0.28]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Center ridge */}
      <mesh position={[0, 0.19, 0]}>
        <boxGeometry args={[0.6, 0.02, 0.03]} />
        <meshStandardMaterial color={accent} metalness={0.8} roughness={0.1} emissive={accent} emissiveIntensity={emissive * 0.3} />
      </mesh>
    </group>
  );
}

// 3: Razorshrimp — Glass shrimp (transparent)
function RazorshrimpGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group rotation={[0, 0, 0.1]}>
      {/* Elongated body */}
      <mesh rotation={[0, 0, Math.PI * 0.5]}>
        <cylinderGeometry args={[0.1, 0.08, 0.65, 8]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.3} emissive={color} emissiveIntensity={emissive} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Tail segments */}
      {[0.38, 0.48, 0.56].map((x, i) => (
        <mesh key={i} position={[-x, -0.02 * i, 0]}>
          <boxGeometry args={[0.08, 0.06 - i * 0.01, 0.1 - i * 0.015]} />
          <meshStandardMaterial color={accent} metalness={0.2} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.5} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Tail fan */}
      {[-0.15, 0.15].map((r, i) => (
        <mesh key={`fan-${i}`} position={[-0.62, 0, r * 0.3]} rotation={[r, 0, 0.1]}>
          <coneGeometry args={[0.08, 0.03, 4]} />
          <meshStandardMaterial color={accent} metalness={0.2} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.4} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Rostrum spike */}
      <mesh position={[0.4, 0.04, 0]} rotation={[0, 0, Math.PI * 0.5]}>
        <coneGeometry args={[0.025, 0.25, 4]} />
        <meshStandardMaterial color={accent} metalness={0.3} roughness={0.3} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Swimmerets */}
      {[-0.1, 0, 0.1, 0.2].map((x, i) => (
        <mesh key={`swim-${i}`} position={[x, -0.12, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.08, 4]} />
          <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.2} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Eyes */}
      {[-0.04, 0.04].map((z, i) => (
        <mesh key={`eye-${i}`} position={[0.3, 0.08, z]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffcc00" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// 4: Boulderclaw — Giant isopod
function BoulderclawGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Large bulky body */}
      <mesh scale={[1.0, 0.75, 0.85]}>
        <sphereGeometry args={[0.55, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Ribbed armor arcs */}
      {[0, 0.6, 1.2, 1.8, 2.4].map((a, i) => (
        <mesh key={i} position={[0, 0.05, 0]} rotation={[0, a, 0]}>
          <torusGeometry args={[0.5, 0.025, 6, 12, Math.PI]} />
          <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={accent} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Head shield */}
      <mesh position={[0, 0.05, 0.4]} scale={[0.8, 0.5, 0.5]}>
        <sphereGeometry args={[0.35, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      {/* Stubby claws */}
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={`claw-${i}`} position={[x, -0.1, 0.3]} rotation={[0, i ? -0.3 : 0.3, 0]}>
          <coneGeometry args={[0.08, 0.18, 5]} />
          <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.6} />
        </mesh>
      ))}
      {/* 6 short legs */}
      {[-0.3, -0.15, 0, 0, 0.15, 0.3].map((x, i) => (
        <mesh key={`leg-${i}`} position={[x < 0 ? x - 0.1 : x > 0 ? x + 0.1 : (i < 3 ? -0.1 : 0.1), -0.4, (i % 2) * 0.05]} rotation={[0, 0, x * 0.3]}>
          <cylinderGeometry args={[0.03, 0.04, 0.15, 5]} />
          <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Antennae */}
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={`ant-${i}`} position={[x, 0.15, 0.45]} rotation={[0.4, i ? 0.15 : -0.15, 0]}>
          <cylinderGeometry args={[0.015, 0.01, 0.2, 4]} />
          <meshStandardMaterial color={accent} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.2} />
        </mesh>
      ))}
      {/* Eyes */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.12, 0.48]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffcc00" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// MOLLUSKS (5-9) — #aa55ff
// ═══════════════════════════════════════════════════════════

// 5: Inkshade — Octopus
function InkshadeGeo({ color, accent, emissive }: GeoProps) {
  const tentacleAngles = useMemo(() => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2), []);
  return (
    <group>
      {/* Bulbous head */}
      <mesh position={[0, 0.25, 0]} scale={[0.9, 1.1, 0.8]}>
        <sphereGeometry args={[0.45, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Eyes */}
      {[-0.22, 0.22].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.3, 0.32]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Ink sac */}
      <mesh position={[0, 0.05, -0.2]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3} transparent opacity={0.3} />
      </mesh>
      {/* 8 tentacles */}
      {tentacleAngles.map((angle, i) => {
        const x = Math.cos(angle) * 0.3;
        const z = Math.sin(angle) * 0.3;
        const len = 0.35 + (i % 2) * 0.12;
        return (
          <group key={i} position={[x, -0.15, z]} rotation={[0.3 + (i % 3) * 0.1, angle, 0]}>
            <mesh>
              <cylinderGeometry args={[0.04, 0.012, len, 5]} />
              <meshStandardMaterial color={accent} metalness={0.1} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 6: Coilshell — Nautilus
function CoilshellGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Torus shell */}
      <mesh rotation={[0, Math.PI * 0.5, 0]}>
        <torusGeometry args={[0.35, 0.18, 10, 20]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Shell ribs */}
      {[0, 1.5, 3.0, 4.5].map((a, i) => (
        <mesh key={i} rotation={[0, Math.PI * 0.5, 0]}>
          <torusGeometry args={[0.34, 0.015, 6, 16]} />
          <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={accent} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Body protruding from opening */}
      <mesh position={[0.35, -0.05, 0]} scale={[0.6, 0.8, 0.6]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color={accent} metalness={0.1} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      {/* Tentacles from opening */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`t-${i}`} position={[0.4, -0.1 - (i % 3) * 0.05, (i - 2.5) * 0.06]} rotation={[0.2, 0, 0.3 + i * 0.05]}>
          <cylinderGeometry args={[0.02, 0.008, 0.22, 4]} />
          <meshStandardMaterial color={accent} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.2} />
        </mesh>
      ))}
      {/* Hood */}
      <mesh position={[0.35, 0.1, 0]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.12, 0.05, 6]} />
        <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
      {/* Eyes */}
      {[-0.04, 0.04].map((z, i) => (
        <mesh key={`eye-${i}`} position={[0.42, 0, z]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// 7: Pearlmouth — Giant clam
function PearlmouthGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Bottom shell */}
      <mesh position={[0, -0.08, 0]} rotation={[0.1, 0, 0]}>
        <sphereGeometry args={[0.5, 8, 6, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} side={THREE.DoubleSide} />
      </mesh>
      {/* Top shell (open) */}
      <mesh position={[0, 0.08, -0.05]} rotation={[-0.45, 0, 0]}>
        <sphereGeometry args={[0.5, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} side={THREE.DoubleSide} />
      </mesh>
      {/* Lip torus */}
      <mesh position={[0, 0, 0.15]} rotation={[Math.PI * 0.5, 0, 0]}>
        <torusGeometry args={[0.35, 0.04, 6, 16]} />
        <meshStandardMaterial color={accent} metalness={0.2} roughness={0.6} emissive={accent} emissiveIntensity={emissive * 0.4} />
      </mesh>
      {/* Pearl! */}
      <mesh position={[0, 0.05, 0.05]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#ffeecc" emissive="#ffcc00" emissiveIntensity={0.9} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Shell ridges on both halves */}
      {[0.08, -0.08].map((y, i) => (
        <group key={i}>
          {[0, 1.2, 2.4, 3.6].map((a, j) => (
            <mesh key={j} position={[0, y, 0]} rotation={[i ? 0.1 : -0.45, a, 0]}>
              <torusGeometry args={[0.45, 0.012, 4, 10, Math.PI * 0.8]} />
              <meshStandardMaterial color={accent} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.2} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// 8: Spiralhorn — Sea snail
function SpiralhornGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Spiral tower — stacked toruses */}
      {[0, 1, 2, 3, 4].map((level) => {
        const r = 0.28 - level * 0.04;
        const y = level * 0.14;
        const xOff = level * 0.03;
        return (
          <mesh key={level} position={[xOff, y, 0]}>
            <torusGeometry args={[r, 0.07, 6, 12]} />
            <meshStandardMaterial color={level % 2 ? accent : color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive * (0.5 + level * 0.1)} />
          </mesh>
        );
      })}
      {/* Flat foot */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.06, 8]} />
        <meshStandardMaterial color={accent} metalness={0.1} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0.2, -0.1, 0.2]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color={accent} metalness={0.1} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.4} />
      </mesh>
      {/* Tentacles */}
      {[0.1, -0.05].map((z, i) => (
        <mesh key={`t-${i}`} position={[0.3, -0.05 + i * 0.02, z]} rotation={[0.2, 0, 0.4]}>
          <cylinderGeometry args={[0.015, 0.008, 0.18 + i * 0.05, 4]} />
          <meshStandardMaterial color={accent} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.2} />
        </mesh>
      ))}
      {/* Eyes at tentacle tips */}
      {[0.1, -0.05].map((z, i) => (
        <mesh key={`eye-${i}`} position={[0.38, 0.02, z]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffcc00" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// 9: Venomcone — Cone snail
function VenomconeGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Cone shell */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Shell ring bands */}
      {[0.05, 0.18, 0.32].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
          <torusGeometry args={[0.25 - i * 0.04, 0.015, 6, 14]} />
          <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={accent} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Body at opening */}
      <mesh position={[0, -0.2, 0.1]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color={accent} metalness={0.1} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      {/* Foot */}
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.05, 8]} />
        <meshStandardMaterial color={accent} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
      {/* Proboscis (venom harpoon) */}
      <mesh position={[0, -0.15, 0.25]} rotation={[Math.PI * 0.5, 0, 0]}>
        <coneGeometry args={[0.02, 0.35, 4]} />
        <meshStandardMaterial color={accent} metalness={0.3} roughness={0.3} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Venom glow tip */}
      <mesh position={[0, -0.15, 0.44]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={1.0} />
      </mesh>
      {/* Eyes */}
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, -0.16, 0.18]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffcc00" emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// JELLYFISH (10-14) — #00ffd5
// ═══════════════════════════════════════════════════════════

// 10: Driftbloom — Ethereal jelly (transparent)
function DriftbloomGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Transparent bell */}
      <mesh position={[0, 0.2, 0]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.45, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.3} emissive={color} emissiveIntensity={emissive} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner ghost sphere */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.25, 10, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3} transparent opacity={0.25} />
      </mesh>
      {/* Frilly margin ring */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
        <torusGeometry args={[0.42, 0.015, 6, 18]} />
        <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.4} transparent opacity={0.6} />
      </mesh>
      {/* 4 long oral arms */}
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * 0.15;
        const z = Math.sin(angle) * 0.15;
        return (
          <mesh key={i} position={[x, -0.2, z]}>
            <cylinderGeometry args={[0.025, 0.005, 0.4 + (i % 2) * 0.1, 4]} />
            <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.3} transparent opacity={0.6} />
          </mesh>
        );
      })}
      {/* Bioluminescent dots */}
      {[[-0.1, 0.2, 0.1], [0.08, 0.25, -0.05], [0, 0.15, 0.12]].map((pos, i) => (
        <mesh key={`glow-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={1.0} />
        </mesh>
      ))}
    </group>
  );
}

// 11: Stormbell — Electric jelly
function StormbellGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Bell */}
      <mesh position={[0, 0.2, 0]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.3} emissive={color} emissiveIntensity={emissive} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner glow */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} transparent opacity={0.3} />
      </mesh>
      {/* Electric arc toruses */}
      {[0.3, 0.4, 0.5].map((r, i) => (
        <mesh key={i} position={[0, 0.1, 0]} rotation={[Math.PI * 0.5 + i * 0.4, i * 0.8, i * 0.3]}>
          <torusGeometry args={[r, 0.01, 6, 20]} />
          <meshStandardMaterial color="#ffff66" emissive="#ffff44" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* 6 short tentacles */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.25, -0.15, Math.sin(angle) * 0.25]}>
            <cylinderGeometry args={[0.02, 0.008, 0.22, 4]} />
            <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.3} transparent opacity={0.7} />
          </mesh>
        );
      })}
      {/* Spark nodes at tentacle tips */}
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={`spark-${i}`} position={[Math.cos(angle) * 0.25, -0.28, Math.sin(angle) * 0.25]}>
            <icosahedronGeometry args={[0.025, 0]} />
            <meshStandardMaterial color="#ffff66" emissive="#ffff44" emissiveIntensity={1.0} />
          </mesh>
        );
      })}
      {/* Eyes */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.2, 0.3]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// 12: Ghostveil — Phantom jelly (very transparent)
function GhostveilGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Transparent icosahedron */}
      <mesh scale={[0.6, 0.9, 0.6]}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.2} emissive={color} emissiveIntensity={emissive} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh scale={[0.63, 0.93, 0.63]}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color={accent} wireframe emissive={accent} emissiveIntensity={emissive * 0.5} transparent opacity={0.2} />
      </mesh>
      {/* Bright core */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.8} transparent opacity={0.6} />
      </mesh>
      {/* 4 long veil tendrils */}
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.2, -0.35, Math.sin(angle) * 0.2]}>
            <cylinderGeometry args={[0.012, 0.003, 0.5 + (i % 2) * 0.15, 4]} />
            <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.4} transparent opacity={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

// 13: Warbloom — War jelly
function WarbloomGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Thick bell (less transparent) */}
      <mesh position={[0, 0.2, 0]} scale={[1, 0.75, 1]}>
        <sphereGeometry args={[0.45, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.4} emissive={color} emissiveIntensity={emissive} transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
      {/* Helmet spike */}
      <mesh position={[0, 0.45, 0]}>
        <coneGeometry args={[0.1, 0.2, 5]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.3} emissive={color} emissiveIntensity={emissive * 0.6} />
      </mesh>
      {/* Armored rim torus */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
        <torusGeometry args={[0.42, 0.04, 6, 18]} />
        <meshStandardMaterial color={accent} metalness={0.3} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.4} />
      </mesh>
      {/* 8 thick stinger tentacles */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i}>
            <mesh position={[Math.cos(angle) * 0.3, -0.15, Math.sin(angle) * 0.3]}>
              <cylinderGeometry args={[0.03, 0.015, 0.28, 5]} />
              <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.3} />
            </mesh>
            {/* Stinger tip */}
            <mesh position={[Math.cos(angle) * 0.3, -0.32, Math.sin(angle) * 0.3]}>
              <coneGeometry args={[0.02, 0.06, 4]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive * 0.6} />
            </mesh>
          </group>
        );
      })}
      {/* Warrior eyes */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.22, 0.32]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// 14: Moonpulse — Moon jelly (flat disc)
function MoonpulseGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Flat disc bell */}
      <mesh position={[0, 0.1, 0]} scale={[1.0, 0.35, 1.0]}>
        <sphereGeometry args={[0.5, 14, 10]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.3} emissive={color} emissiveIntensity={emissive} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* 4-leaf clover pattern (4 toruses on top) */}
      {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((rot, i) => (
        <mesh key={i} position={[Math.cos(rot) * 0.12, 0.15, Math.sin(rot) * 0.12]} rotation={[Math.PI * 0.5, rot, 0]}>
          <torusGeometry args={[0.1, 0.025, 6, 12]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={emissive * 0.6} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Inner pulsing glow */}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.3, 10, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3} transparent opacity={0.2} />
      </mesh>
      {/* Fringe ring */}
      <mesh position={[0, -0.01, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
        <torusGeometry args={[0.48, 0.01, 6, 24]} />
        <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.4} transparent opacity={0.5} />
      </mesh>
      {/* 12 tiny fringe tentacles */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh key={`t-${i}`} position={[Math.cos(angle) * 0.42, -0.12, Math.sin(angle) * 0.42]}>
            <cylinderGeometry args={[0.008, 0.003, 0.15, 4]} />
            <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.2} transparent opacity={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// FISH (15-19) — #00aaff
// ═══════════════════════════════════════════════════════════

// 15: Deepmaw — Anglerfish
function DeepmawGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Round body */}
      <mesh scale={[0.9, 0.8, 0.7]}>
        <sphereGeometry args={[0.4, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Upper jaw */}
      <mesh position={[0, 0.08, 0.35]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.25, 0.3, 6]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.8} />
      </mesh>
      {/* Lower jaw */}
      <mesh position={[0, -0.12, 0.35]} rotation={[Math.PI - 0.3, 0, 0]}>
        <coneGeometry args={[0.22, 0.25, 6]} />
        <meshStandardMaterial color={accent} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.6} />
      </mesh>
      {/* Teeth */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={`tooth-${i}`} position={[Math.cos(angle) * 0.15, Math.sin(angle) * 0.08 - 0.02, 0.45]}>
            <coneGeometry args={[0.02, 0.08, 4]} />
            <meshStandardMaterial color="#ffeecc" emissive="#ffcc00" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      {/* Lure stalk */}
      <mesh position={[0, 0.35, 0.15]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.35, 4]} />
        <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
      {/* Glowing lure tip */}
      <mesh position={[0, 0.5, 0.35]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffff66" emissive="#ffff44" emissiveIntensity={1.2} />
      </mesh>
      {/* Tiny eyes */}
      {[-0.15, 0.15].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.12, 0.25]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.7} />
        </mesh>
      ))}
      {/* Pectoral fins */}
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={`fin-${i}`} position={[x, -0.05, 0]} rotation={[0, i ? 0.3 : -0.3, i ? 0.5 : -0.5]}>
          <coneGeometry args={[0.08, 0.05, 4]} />
          <meshStandardMaterial color={accent} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// 16: Flashfin — Lanternfish
function FlashfinGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group rotation={[0, 0, 0.05]}>
      {/* Sleek elongated body */}
      <mesh scale={[0.5, 0.45, 1.0]}>
        <sphereGeometry args={[0.4, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Head taper */}
      <mesh position={[0, 0, 0.35]} scale={[0.7, 0.6, 0.5]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.3} emissive={color} emissiveIntensity={emissive * 0.8} />
      </mesh>
      {/* Photophore row (6 dots along sides) */}
      {Array.from({ length: 6 }, (_, i) => {
        const z = -0.2 + i * 0.1;
        return (
          <group key={`photo-${i}`}>
            <mesh position={[-0.18, -0.08, z]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial color="#ffff99" emissive="#ffff66" emissiveIntensity={0.9} />
            </mesh>
            <mesh position={[0.18, -0.08, z]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial color="#ffff99" emissive="#ffff66" emissiveIntensity={0.9} />
            </mesh>
          </group>
        );
      })}
      {/* Dorsal fin */}
      <mesh position={[0, 0.22, 0]} rotation={[0.15, 0, 0]}>
        <coneGeometry args={[0.1, 0.2, 4]} />
        <meshStandardMaterial color={accent} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Forked tail */}
      {[-0.06, 0.06].map((y, i) => (
        <mesh key={`tail-${i}`} position={[0, y, -0.42]} rotation={[i ? 0.3 : -0.3, 0, 0]}>
          <coneGeometry args={[0.06, 0.12, 4]} />
          <meshStandardMaterial color={accent} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Large eyes */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.06, 0.35]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.7} />
        </mesh>
      ))}
      {/* Lantern organ under chin */}
      <mesh position={[0, -0.12, 0.3]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#66ccff" emissive="#00aaff" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

// 17: Gulpjaw — Gulper eel
function GulpjawGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group rotation={[0, 0, 0.05]}>
      {/* Long thin body */}
      <mesh rotation={[0, 0, Math.PI * 0.5]}>
        <cylinderGeometry args={[0.06, 0.04, 0.7, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Upper jaw (enormous) */}
      <mesh position={[0.35, 0.08, 0]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.25, 0.2, 6]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.8} />
      </mesh>
      {/* Lower jaw */}
      <mesh position={[0.35, -0.1, 0]} rotation={[0, 0, Math.PI - 0.2]}>
        <coneGeometry args={[0.22, 0.18, 6]} />
        <meshStandardMaterial color={accent} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.6} />
      </mesh>
      {/* Expandable pouch */}
      <mesh position={[0.2, -0.1, 0]} scale={[0.8, 0.6, 0.6]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.3} transparent opacity={0.6} />
      </mesh>
      {/* Whip tail */}
      <mesh position={[-0.45, 0, 0]} rotation={[0, 0, Math.PI * 0.5]}>
        <coneGeometry args={[0.03, 0.3, 4]} />
        <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
      {/* Tail tip glow */}
      <mesh position={[-0.62, 0, 0]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#ffff66" emissive="#ffff44" emissiveIntensity={0.8} />
      </mesh>
      {/* Small eyes near jaw */}
      {[-0.04, 0.04].map((z, i) => (
        <mesh key={`eye-${i}`} position={[0.3, 0.05, z]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// 18: Mirrorfin — Hatchetfish (mirror-like)
function MirrorfinGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Thin tall body (hatchet shape) */}
      <mesh scale={[0.3, 1, 0.7]}>
        <boxGeometry args={[0.3, 0.45, 0.35]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.15} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Ventral keel (hatchet blade) */}
      <mesh position={[0, -0.28, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.12, 0.12, 4]} />
        <meshStandardMaterial color={accent} metalness={0.8} roughness={0.15} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      {/* Upward-facing tubular eyes */}
      {[-0.06, 0.06].map((x, i) => (
        <group key={`eye-${i}`} position={[x, 0.22, 0.08]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.08, 6]} />
            <meshStandardMaterial color={accent} metalness={0.6} roughness={0.3} emissive={color} emissiveIntensity={emissive * 0.3} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.9} />
          </mesh>
        </group>
      ))}
      {/* Photophores along belly */}
      {[-0.12, -0.04, 0.04, 0.12].map((z, i) => (
        <mesh key={`photo-${i}`} position={[0, -0.18, z]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial color="#ffff99" emissive="#ffff66" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Small pectoral fins */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={`fin-${i}`} position={[x, -0.05, 0.05]} rotation={[0, i ? 0.3 : -0.3, i ? 0.4 : -0.4]}>
          <coneGeometry args={[0.04, 0.04, 3]} />
          <meshStandardMaterial color={accent} roughness={0.3} metalness={0.7} emissive={color} emissiveIntensity={emissive * 0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Tiny dorsal fin */}
      <mesh position={[0, 0.24, -0.05]}>
        <coneGeometry args={[0.04, 0.08, 3]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.7} emissive={color} emissiveIntensity={emissive * 0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// 19: Stonescale — Coelacanth (prehistoric, robust)
function StonescaleGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group rotation={[0, 0, 0.05]}>
      {/* Thick robust body */}
      <mesh scale={[0.8, 0.7, 1.0]}>
        <sphereGeometry args={[0.4, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Armor band toruses */}
      {[-0.15, 0, 0.15].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI * 0.5, 0, 0]}>
          <torusGeometry args={[0.3 - i * 0.02, 0.018, 6, 16]} />
          <meshStandardMaterial color={accent} metalness={0.5} roughness={0.3} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* 4 lobed fins (cylinders with sphere tips) */}
      {[
        [-0.28, -0.1, 0.1, -0.5], [0.28, -0.1, 0.1, 0.5],
        [-0.25, -0.1, -0.15, -0.4], [0.25, -0.1, -0.15, 0.4],
      ].map(([x, y, z, rot], i) => (
        <group key={`fin-${i}`} position={[x, y, z]} rotation={[0, 0, rot]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.03, 0.12, 5]} />
            <meshStandardMaterial color={accent} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.3} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.4} />
          </mesh>
        </group>
      ))}
      {/* Thick tail */}
      <mesh position={[0, 0, -0.38]} rotation={[Math.PI * 0.5, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.15, 6]} />
        <meshStandardMaterial color={accent} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
      <mesh position={[0, 0, -0.48]} rotation={[Math.PI * 0.5, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 6, 12]} />
        <meshStandardMaterial color={accent} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.4} />
      </mesh>
      {/* Head / jaw */}
      <mesh position={[0, 0, 0.35]}>
        <boxGeometry args={[0.2, 0.1, 0.12]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      {/* Eyes */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.08, 0.3]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// FLORA (20-24) — #00ff88
// ═══════════════════════════════════════════════════════════

// 20: Reefling — Coral symbiote
function ReeflingGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Base stump */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.25, 8]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.7} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* 5 branching cones */}
      {[
        { pos: [0, 0.15, 0] as [number, number, number], rot: [0, 0, 0] as [number, number, number], h: 0.4 },
        { pos: [-0.2, 0.05, 0.1] as [number, number, number], rot: [0, 0, 0.5] as [number, number, number], h: 0.3 },
        { pos: [0.2, 0.05, -0.1] as [number, number, number], rot: [0, 0.5, -0.5] as [number, number, number], h: 0.35 },
        { pos: [-0.1, 0.1, -0.15] as [number, number, number], rot: [0.4, 0, 0.3] as [number, number, number], h: 0.25 },
        { pos: [0.1, 0.1, 0.15] as [number, number, number], rot: [-0.3, 0, -0.4] as [number, number, number], h: 0.3 },
      ].map((branch, i) => (
        <group key={i} position={branch.pos} rotation={branch.rot}>
          <mesh>
            <coneGeometry args={[0.05, branch.h, 5]} />
            <meshStandardMaterial color={accent} metalness={0.1} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.5} />
          </mesh>
          {/* Polyp dot at tip */}
          <mesh position={[0, branch.h * 0.45, 0]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
      {/* Extra polyp clusters */}
      {[[-0.12, 0, 0.15], [0.15, -0.05, -0.1], [0, -0.05, 0.18]].map((pos, i) => (
        <mesh key={`poly-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Emissive inner glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} transparent opacity={0.2} />
      </mesh>
      {/* Base roots */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={`root-${i}`} position={[x, -0.32, (i - 1) * 0.08]} rotation={[0, 0, x * 0.3]}>
          <cylinderGeometry args={[0.03, 0.02, 0.12, 4]} />
          <meshStandardMaterial color={color} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.2} />
        </mesh>
      ))}
    </group>
  );
}

// 21: Thorncoil — Thorny coral
function ThorncoilGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Tall column */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.15, 0.65, 8]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.7} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Thorns radiating outward */}
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const y = -0.25 + (i % 5) * 0.12;
        return (
          <group key={i} position={[Math.cos(angle) * 0.13, y, Math.sin(angle) * 0.13]} rotation={[0, -angle, Math.PI * 0.5]}>
            <mesh>
              <coneGeometry args={[0.02, 0.12, 4]} />
              <meshStandardMaterial color={accent} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.5} />
            </mesh>
            {/* Emissive tip (on some) */}
            {i % 3 === 0 && (
              <mesh position={[0, 0.07, 0]}>
                <sphereGeometry args={[0.012, 6, 6]} />
                <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.8} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* Coiled vine toruses */}
      {[0, 1].map((i) => (
        <mesh key={`coil-${i}`} position={[0, -0.1 + i * 0.25, 0]} rotation={[Math.PI * 0.5 + i * 0.3, i * 0.5, 0]}>
          <torusGeometry args={[0.16, 0.02, 6, 14]} />
          <meshStandardMaterial color={accent} metalness={0.1} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Base */}
      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.08, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
    </group>
  );
}

// 22: Bloomsire — Anemone
function BloomsireGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Pedal disc base */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.25, 0.28, 0.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
      {/* Column */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 8]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Tentacle crown (12 tentacles in ring) */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 0.13;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.2, Math.sin(angle) * r]} rotation={[Math.sin(angle) * 0.3, 0, -Math.cos(angle) * 0.3]}>
            <cylinderGeometry args={[0.018, 0.008, 0.22, 4]} />
            <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.5} />
          </mesh>
        );
      })}
      {/* Oral disc */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={emissive * 0.4} />
      </mesh>
      {/* Central mouth */}
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#004422" emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

// 23: Tendrilwrap — Kelp creature
function TendrilwrapGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Central stipe */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.06, 0.8, 6]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Frond blades at various heights */}
      {[
        { y: 0.2, rot: 0.3, side: -1 }, { y: 0.1, rot: -0.2, side: 1 },
        { y: -0.05, rot: 0.4, side: -1 }, { y: -0.15, rot: -0.35, side: 1 },
        { y: -0.3, rot: 0.25, side: -1 },
      ].map((f, i) => (
        <mesh key={i} position={[f.side * 0.1, f.y, 0]} rotation={[0, f.rot, f.side * 0.4]}>
          <boxGeometry args={[0.12, 0.02, 0.2]} />
          <meshStandardMaterial color={accent} metalness={0.1} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Gas bladder */}
      <mesh position={[0.03, 0.35, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
      </mesh>
      {/* Holdfast base */}
      {[-0.06, 0.02, 0.06].map((x, i) => (
        <mesh key={`hold-${i}`} position={[x, -0.42, (i - 1) * 0.04]} rotation={[0, 0, x * 1.5]}>
          <cylinderGeometry args={[0.025, 0.015, 0.1, 4]} />
          <meshStandardMaterial color={color} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.2} />
        </mesh>
      ))}
      {/* Wrapping tendril */}
      <mesh position={[0, 0, 0]} rotation={[0.3, 0.5, 0]}>
        <torusGeometry args={[0.08, 0.012, 6, 14]} />
        <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
    </group>
  );
}

// 24: Sporeling — Deep fungus
function SporelingGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Mushroom cap */}
      <mesh position={[0, 0.15, 0]} scale={[1.0, 0.55, 1.0]}>
        <sphereGeometry args={[0.35, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.6} emissive={color} emissiveIntensity={emissive} side={THREE.DoubleSide} />
      </mesh>
      {/* Stipe */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.35, 6]} />
        <meshStandardMaterial color={accent} metalness={0.1} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.4} />
      </mesh>
      {/* Gill plates underneath cap */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`gill-${i}`} position={[Math.cos(angle) * 0.12, 0.1, Math.sin(angle) * 0.12]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.01, 0.04, 0.18]} />
            <meshStandardMaterial color={accent} emissive={color} emissiveIntensity={emissive * 0.3} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Floating spore cloud */}
      {[
        [0.2, 0.3, 0.1], [-0.15, 0.35, -0.1], [0.1, 0.4, -0.15],
        [-0.2, 0.25, 0.15], [0.25, 0.2, -0.05], [-0.1, 0.45, 0],
        [0.05, 0.5, 0.1], [-0.25, 0.35, 0.05],
      ].map((pos, i) => (
        <mesh key={`spore-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Mycelium base */}
      {[-0.08, 0, 0.08].map((x, i) => (
        <mesh key={`myc-${i}`} position={[x, -0.3, (i - 1) * 0.06]} rotation={[0, 0, x * 1.2]}>
          <cylinderGeometry args={[0.02, 0.012, 0.1, 4]} />
          <meshStandardMaterial color={color} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.2} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// ABYSSAL (25-29) — #ff00aa
// ═══════════════════════════════════════════════════════════

// 25: Voidmaw — Abyssal predator
function VoidmawGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Dodecahedron body */}
      <mesh>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Large mouth cone */}
      <mesh position={[0, -0.1, 0.3]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.28, 0.35, 6]} />
        <meshStandardMaterial color="#110022" metalness={0.4} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.2} />
      </mesh>
      {/* Teeth ring */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`tooth-${i}`} position={[Math.cos(angle) * 0.18, -0.1 + Math.sin(angle) * 0.1, 0.42]}>
            <coneGeometry args={[0.02, 0.1, 4]} />
            <meshStandardMaterial color="#ffeecc" emissive="#ffcc00" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      {/* 4 scattered eyes */}
      {[
        [0.15, 0.25, 0.25], [-0.2, 0.2, 0.2],
        [0.25, 0.05, 0.3], [-0.1, 0.3, 0.15],
      ].map((pos, i) => (
        <mesh key={`eye-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={1.0} />
        </mesh>
      ))}
      {/* Back spines */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`spine-${i}`} position={[(i - 2) * 0.1, 0.25 + Math.abs(i - 2) * 0.04, -0.15]}>
          <coneGeometry args={[0.025, 0.15, 4]} />
          <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.5} />
        </mesh>
      ))}
      {/* Dark wireframe aura */}
      <mesh>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={emissive * 0.3} transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

// 26: Pressureking — Barreleye fish
function PressurekingGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group rotation={[0, 0, 0.05]}>
      {/* Streamlined body */}
      <mesh scale={[0.6, 0.5, 1.0]}>
        <sphereGeometry args={[0.35, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Transparent dome on top of head */}
      <mesh position={[0, 0.2, 0.1]} scale={[0.8, 0.6, 0.7]}>
        <sphereGeometry args={[0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={accent} metalness={0.1} roughness={0.2} emissive={color} emissiveIntensity={emissive * 0.3} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Barrel eye tubes pointing up */}
      {[-0.06, 0.06].map((x, i) => (
        <group key={`eye-${i}`} position={[x, 0.18, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 6]} />
            <meshStandardMaterial color={accent} metalness={0.3} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.3} />
          </mesh>
          {/* Green emissive eye tips */}
          <mesh position={[0, 0.07, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={1.0} />
          </mesh>
        </group>
      ))}
      {/* Small mouth */}
      <mesh position={[0, -0.05, 0.3]}>
        <boxGeometry args={[0.08, 0.04, 0.06]} />
        <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
      {/* Fins */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={`fin-${i}`} position={[x, -0.05, 0]} rotation={[0, i ? 0.3 : -0.3, i ? 0.5 : -0.5]}>
          <coneGeometry args={[0.06, 0.05, 4]} />
          <meshStandardMaterial color={accent} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Dorsal */}
      <mesh position={[0, 0.18, -0.1]}>
        <coneGeometry args={[0.06, 0.1, 4]} />
        <meshStandardMaterial color={accent} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Forked tail */}
      {[-0.05, 0.05].map((y, i) => (
        <mesh key={`tail-${i}`} position={[0, y, -0.35]} rotation={[i ? 0.3 : -0.3, 0, 0]}>
          <coneGeometry args={[0.04, 0.08, 4]} />
          <meshStandardMaterial color={accent} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// 27: Darkdrifter — Sea cucumber (matte)
function DarkdrifterGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group rotation={[0, 0, 0.1]}>
      {/* Elongated body */}
      <mesh rotation={[0, 0, Math.PI * 0.5]}>
        <cylinderGeometry args={[0.15, 0.12, 0.6, 8]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      {/* Sphere caps */}
      <mesh position={[0.3, 0, 0]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      <mesh position={[-0.3, 0, 0]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      {/* Tube feet rows */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`foot-${i}`} position={[(i - 4.5) * 0.06, -0.15, (i % 2) * 0.05 - 0.025]}>
          <cylinderGeometry args={[0.012, 0.012, 0.05, 4]} />
          <meshStandardMaterial color={accent} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.2} />
        </mesh>
      ))}
      {/* Papillae bumps */}
      {[
        [0.1, 0.12, 0.05], [-0.05, 0.13, -0.04], [0.2, 0.1, 0],
        [-0.15, 0.11, 0.06], [0, 0.14, -0.03], [-0.2, 0.1, 0.02],
        [0.15, 0.12, -0.05], [-0.1, 0.13, 0.03],
      ].map((pos, i) => (
        <mesh key={`bump-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color={accent} metalness={0.1} roughness={0.8} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
      {/* Feeding tentacles at front */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`feed-${i}`} position={[0.35, -0.02 + (i - 2) * 0.04, (i - 2) * 0.03]} rotation={[0, 0, 0.4 + i * 0.05]}>
          <cylinderGeometry args={[0.02, 0.01, 0.1, 4]} />
          <meshStandardMaterial color={accent} roughness={0.7} emissive={color} emissiveIntensity={emissive * 0.3} />
        </mesh>
      ))}
    </group>
  );
}

// 28: Abysswatcher — Giant squid
function AbysswatcherGeo({ color, accent, emissive }: GeoProps) {
  const armAngles = useMemo(() => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2), []);
  return (
    <group>
      {/* Torpedo mantle */}
      <mesh position={[0, 0.3, 0]} rotation={[0.1, 0, 0]}>
        <coneGeometry args={[0.22, 0.55, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Head sphere */}
      <mesh position={[0, 0, 0]} scale={[1, 0.9, 0.9]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color={accent} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.8} />
      </mesh>
      {/* Giant eyes */}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.05, 0.12]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* 8 arms */}
      {armAngles.map((angle, i) => {
        const x = Math.cos(angle) * 0.15;
        const z = Math.sin(angle) * 0.15;
        return (
          <mesh key={i} position={[x, -0.2, z]} rotation={[0.4 + (i % 2) * 0.15, angle, 0]}>
            <cylinderGeometry args={[0.03, 0.01, 0.3, 5]} />
            <meshStandardMaterial color={accent} metalness={0.2} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.3} />
          </mesh>
        );
      })}
      {/* 2 long feeding tentacles */}
      {[-0.08, 0.08].map((x, i) => (
        <group key={`tent-${i}`} position={[x, -0.2, 0.1]} rotation={[0.3, i ? 0.15 : -0.15, 0]}>
          <mesh>
            <cylinderGeometry args={[0.018, 0.008, 0.5, 4]} />
            <meshStandardMaterial color={accent} roughness={0.6} emissive={color} emissiveIntensity={emissive * 0.2} />
          </mesh>
          {/* Club tip */}
          <mesh position={[0, -0.28, 0]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive * 0.5} />
          </mesh>
        </group>
      ))}
      {/* Tail fins */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={`fin-${i}`} position={[x, 0.55, 0]} rotation={[0.1, 0, i ? 0.4 : -0.4]}>
          <coneGeometry args={[0.08, 0.1, 4]} />
          <meshStandardMaterial color={accent} roughness={0.4} emissive={color} emissiveIntensity={emissive * 0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// 29: Depthcrown — Sea dragon
function DepthcrownGeo({ color, accent, emissive }: GeoProps) {
  return (
    <group>
      {/* Elongated serpentine body */}
      <mesh scale={[0.5, 0.5, 1.1]}>
        <sphereGeometry args={[0.38, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} emissive={color} emissiveIntensity={emissive} />
      </mesh>
      {/* Crown (5 cones in ring) */}
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh key={`crown-${i}`} position={[Math.cos(angle) * 0.08, 0.22, 0.3 + Math.sin(angle) * 0.08]}>
            <coneGeometry args={[0.03, 0.12, 4]} />
            <meshStandardMaterial color={accent} metalness={0.4} roughness={0.3} emissive={color} emissiveIntensity={emissive * 0.8} />
          </mesh>
        );
      })}
      {/* Leafy appendages (flat boxes on sides) */}
      {[
        { x: -0.22, y: 0.05, z: 0.1, ry: 0.3 },
        { x: 0.22, y: 0.05, z: 0.1, ry: -0.3 },
        { x: -0.2, y: -0.05, z: -0.1, ry: 0.5 },
        { x: 0.2, y: -0.05, z: -0.1, ry: -0.5 },
        { x: -0.18, y: 0, z: -0.25, ry: 0.2 },
        { x: 0.18, y: 0, z: -0.25, ry: -0.2 },
      ].map((leaf, i) => (
        <mesh key={`leaf-${i}`} position={[leaf.x, leaf.y, leaf.z]} rotation={[0, leaf.ry, Math.sign(leaf.x) * 0.3]}>
          <boxGeometry args={[0.08, 0.01, 0.12]} />
          <meshStandardMaterial color={accent} metalness={0.1} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Long snout */}
      <mesh position={[0, 0.02, 0.5]} rotation={[Math.PI * 0.5, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.02, 0.2, 5]} />
        <meshStandardMaterial color={accent} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.5} />
      </mesh>
      {/* Curling tail */}
      <mesh position={[0, 0, -0.45]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.05, 0.2, 5]} />
        <meshStandardMaterial color={accent} roughness={0.5} emissive={color} emissiveIntensity={emissive * 0.3} />
      </mesh>
      {/* Eyes */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={`eye-${i}`} position={[x, 0.1, 0.38]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* Royal aura torus */}
      <mesh rotation={[Math.PI * 0.5, 0, 0]}>
        <torusGeometry args={[0.5, 0.008, 6, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive * 0.4} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// SPECIES → GEOMETRY MAPPING
// ═══════════════════════════════════════════════════════════

const CREATURE_GEOMETRY: Record<number, React.FC<GeoProps>> = {
  0: SnapclawGeo, 1: TidecrawlerGeo, 2: IronpincerGeo, 3: RazorshrimpGeo, 4: BoulderclawGeo,
  5: InkshadeGeo, 6: CoilshellGeo, 7: PearlmouthGeo, 8: SpiralhornGeo, 9: VenomconeGeo,
  10: DriftbloomGeo, 11: StormbellGeo, 12: GhostveilGeo, 13: WarbloomGeo, 14: MoonpulseGeo,
  15: DeepmawGeo, 16: FlashfinGeo, 17: GulpjawGeo, 18: MirrorfinGeo, 19: StonescaleGeo,
  20: ReeflingGeo, 21: ThorncoilGeo, 22: BloomsireGeo, 23: TendrilwrapGeo, 24: SporelingGeo,
  25: VoidmawGeo, 26: PressurekingGeo, 27: DarkdrifterGeo, 28: AbysswatcherGeo, 29: DepthcrownGeo,
};

// ═══════════════════════════════════════════════════════════
// SIZE CONFIG
// ═══════════════════════════════════════════════════════════

const SIZE_CONFIG = {
  sm: { w: 64, h: 64, dpr: 1, antialias: false, camZ: 3.5 },
  md: { w: 100, h: 100, dpr: 1.5, antialias: true, camZ: 3.2 },
  lg: { w: 160, h: 160, dpr: 1.5, antialias: true, camZ: 3.0 },
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function CreatureModel3D({
  species,
  size = "md",
  className = "",
  animate = true,
}: {
  species: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const config = useMemo(() => getCreatureConfig(species), [species]);
  const GeoComponent = CREATURE_GEOMETRY[species] || CREATURE_GEOMETRY[0];
  const dims = SIZE_CONFIG[size];

  // IntersectionObserver — only mount Canvas when visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: dims.w, height: dims.h }}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {visible ? (
        <Canvas
          camera={{ position: [0, 0, dims.camZ], fov: 40 }}
          gl={{ antialias: dims.antialias, alpha: true, powerPreference: "low-power" }}
          dpr={Math.min(dims.dpr, window.devicePixelRatio)}
          frameloop={animate ? "always" : "demand"}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[3, 3, 3]} intensity={1.2} color={config.color} />
          <pointLight position={[-2, -1, 2]} intensity={0.6} color={config.accent} />
          <RotatingGroup hovered={hovered} speed={animate ? 0.3 : 0}>
            <GeoComponent color={config.color} accent={config.accent} emissive={config.emissive} />
          </RotatingGroup>
        </Canvas>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: `${config.color}15`,
            boxShadow: `0 0 8px ${config.color}22`,
          }}
        />
      )}
    </div>
  );
}
