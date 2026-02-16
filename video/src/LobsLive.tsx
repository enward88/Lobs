import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";

// ─── Colors — epic launch palette ────────────────────────────
const C = {
  bg: "#020810",
  cyan: "#00ffd5",
  blue: "#00aaff",
  purple: "#aa55ff",
  pink: "#ff00aa",
  gold: "#ffcc00",
  red: "#ff4466",
  green: "#00ff88",
  white: "#e8f4f8",
  orange: "#ff8800",
  limeGold: "#ccff00",
};

// ─── Shared: Screen flash on cut ────────────────────────────
function FlashOverlay({
  trigger,
  color = C.cyan,
}: {
  trigger: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [trigger, trigger + 4], [0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Shared: Scan lines ─────────────────────────────────────
function ScanLines() {
  const frame = useCurrentFrame();
  const offset = (frame * 2) % 4;
  return (
    <AbsoluteFill
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent ${2 + offset}px,
          rgba(0,0,0,0.06) ${2 + offset}px,
          rgba(0,0,0,0.06) ${4 + offset}px
        )`,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Shared: Vignette ───────────────────────────────────────
function Vignette() {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Particles — golden confetti style for launch ───────────
function Particles({
  count = 50,
  speed = 0.3,
  colors,
}: {
  count?: number;
  speed?: number;
  colors?: string[];
}) {
  const frame = useCurrentFrame();
  const palette = colors || [C.gold, C.orange, C.cyan, C.purple];
  const particles = Array.from({ length: count }, (_, i) => ({
    x: (i * 137.5) % 100,
    baseY: (i * 73.1) % 100,
    size: (i % 5) + 1,
    spd: speed + (i % 7) * 0.08,
    color: palette[i % palette.length],
    opacity: 0.1 + (i % 8) * 0.04,
  }));

  return (
    <AbsoluteFill>
      {particles.map((p, i) => {
        const y = (p.baseY + frame * p.spd) % 130 - 15;
        const pulse = Math.sin(frame * 0.07 + i * 0.8) * 0.4 + 0.6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.color,
              opacity: p.opacity * pulse,
              boxShadow: `0 0 ${p.size * 8}px ${p.color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// ─── 3D: Rotating crown / trophy shape (victory!) ──────────
function VictoryCrown() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const rotY = frame * 0.04;
  const bob = Math.sin(frame * 0.06) * 0.2;

  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ position: "absolute" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={2} color={C.gold} />
      <pointLight position={[-5, -3, 3]} intensity={1} color={C.orange} />
      <group rotation={[0.3, rotY, 0]} position={[0, bob, 0]}>
        <mesh>
          <dodecahedronGeometry args={[2.2, 0]} />
          <meshStandardMaterial
            color={C.gold}
            wireframe
            emissive={new THREE.Color(C.gold)}
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh scale={[1.4, 1.4, 1.4]}>
          <icosahedronGeometry args={[2.2, 0]} />
          <meshStandardMaterial
            color={C.orange}
            wireframe
            emissive={new THREE.Color(C.orange)}
            emissiveIntensity={0.2}
            opacity={0.3}
            transparent
          />
        </mesh>
      </group>
    </ThreeCanvas>
  );
}

// ─── 3D: Battle geometry ────────────────────────────────────
function BattleGeo() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ position: "absolute" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 4, 4]} intensity={1.5} color={C.red} />
      <pointLight position={[-4, -2, 3]} intensity={0.8} color={C.purple} />
      <mesh rotation={[frame * 0.05, frame * 0.07, frame * 0.02]}>
        <torusKnotGeometry args={[1.8, 0.5, 128, 16]} />
        <meshStandardMaterial
          color={C.red}
          wireframe
          emissive={new THREE.Color(C.red)}
          emissiveIntensity={0.4}
        />
      </mesh>
    </ThreeCanvas>
  );
}

// ─── 3D: Hackathon geometry ─────────────────────────────────
function HackathonGeo() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ position: "absolute" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 5, 4]} intensity={1.5} color={C.limeGold} />
      <pointLight position={[-3, -2, 5]} intensity={0.6} color={C.green} />
      <group rotation={[frame * 0.03, frame * 0.05, 0]}>
        <mesh>
          <octahedronGeometry args={[2, 0]} />
          <meshStandardMaterial
            color={C.limeGold}
            wireframe
            emissive={new THREE.Color(C.limeGold)}
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh scale={1.6}>
          <octahedronGeometry args={[2, 0]} />
          <meshStandardMaterial
            color={C.green}
            wireframe
            emissive={new THREE.Color(C.green)}
            emissiveIntensity={0.15}
            opacity={0.2}
            transparent
          />
        </mesh>
      </group>
    </ThreeCanvas>
  );
}

// ─── Epic outlined text helper ──────────────────────────────
function EpicText({
  children,
  fontSize,
  color,
  strokeColor,
  style,
}: {
  children: string;
  fontSize: number;
  color: string;
  strokeColor?: string;
  style?: React.CSSProperties;
}) {
  const stroke = strokeColor || "#000";
  return (
    <div
      style={{
        fontSize,
        fontWeight: 900,
        fontFamily: "system-ui, -apple-system, sans-serif",
        color,
        WebkitTextStroke: `${Math.max(2, fontSize * 0.02)}px ${stroke}`,
        textShadow: `
          0 0 ${fontSize * 0.3}px ${color}88,
          0 4px 0 ${stroke},
          0 6px 0 ${stroke}88
        `,
        letterSpacing: Math.max(4, fontSize * 0.05),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 1: "LOBS IS LIVE" — Epic victory slam
// ═══════════════════════════════════════════════════════════════
function Scene1_Live() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "LOBS" slams from massive scale
  const lobsSlam = spring({
    frame,
    fps,
    config: { damping: 6, stiffness: 200, mass: 0.8 },
  });
  const lobsScale = interpolate(lobsSlam, [0, 1], [8, 1]);

  // "IS LIVE" comes after
  const liveSlam = spring({
    frame,
    fps,
    delay: 10,
    config: { damping: 8, stiffness: 180, mass: 0.6 },
  });
  const liveScale = interpolate(liveSlam, [0, 1], [5, 1]);

  // "ON SOLANA MAINNET" subtitle
  const subIn = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 15, stiffness: 120 },
  });

  // Screen shake
  const shakeX =
    frame < 10 ? Math.sin(frame * 18) * (10 - frame) * 2 : 0;
  const shakeY =
    frame < 10 ? Math.cos(frame * 14) * (10 - frame) * 1.5 : 0;

  // Golden rays from center
  const rayOpacity = interpolate(frame, [4, 15, 60], [0, 0.3, 0.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rayScale = interpolate(frame, [4, 60], [0.5, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = Math.sin(frame * 0.12) * 20 + 40;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, #1a0e00 0%, ${C.bg} 70%)`,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Golden light rays */}
      <AbsoluteFill
        style={{
          background: `conic-gradient(from 0deg at 50% 45%,
            transparent 0deg, ${C.gold}44 10deg, transparent 20deg,
            transparent 40deg, ${C.orange}33 50deg, transparent 60deg,
            transparent 80deg, ${C.gold}44 90deg, transparent 100deg,
            transparent 120deg, ${C.orange}33 130deg, transparent 140deg,
            transparent 160deg, ${C.gold}44 170deg, transparent 180deg,
            transparent 200deg, ${C.orange}33 210deg, transparent 220deg,
            transparent 240deg, ${C.gold}44 250deg, transparent 260deg,
            transparent 280deg, ${C.orange}33 290deg, transparent 300deg,
            transparent 320deg, ${C.gold}44 330deg, transparent 340deg,
            transparent 360deg
          )`,
          opacity: rayOpacity,
          transform: `scale(${rayScale}) rotate(${frame * 0.5}deg)`,
        }}
      />

      <VictoryCrown />
      <Particles count={70} speed={0.6} colors={[C.gold, C.orange, C.gold, C.white]} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            opacity: lobsSlam,
            transform: `scale(${lobsScale})`,
            filter: `drop-shadow(0 0 ${glowPulse}px rgba(255, 204, 0, 0.6))`,
          }}
        >
          <EpicText fontSize={220} color={C.gold} strokeColor="#442200">
            LOBS
          </EpicText>
        </div>

        <div
          style={{
            opacity: liveSlam,
            transform: `scale(${liveScale})`,
            marginTop: -10,
          }}
        >
          <EpicText fontSize={130} color={C.limeGold} strokeColor="#334400">
            IS LIVE
          </EpicText>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 30,
            opacity: subIn,
            transform: `translateY(${interpolate(subIn, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              height: 2,
              width: 60,
              backgroundColor: C.gold,
              opacity: 0.6,
            }}
          />
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 10,
              color: C.white,
              textShadow: `0 0 20px ${C.gold}44`,
            }}
          >
            ON SOLANA MAINNET
          </div>
          <div
            style={{
              height: 2,
              width: 60,
              backgroundColor: C.gold,
              opacity: 0.6,
            }}
          />
        </div>
      </AbsoluteFill>

      <FlashOverlay trigger={0} color={C.gold} />
      <FlashOverlay trigger={10} color={C.limeGold} />
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 2: "SEND YOUR AGENT" — Agent CTA
// ═══════════════════════════════════════════════════════════════
function Scene2_SendAgent() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const robotSlam = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
  });
  const textSlam = spring({
    frame,
    fps,
    delay: 6,
    config: { damping: 10, stiffness: 180 },
  });
  const urlIn = spring({
    frame,
    fps,
    delay: 16,
    config: { damping: 15, stiffness: 130 },
  });

  const shakeX =
    frame < 6 ? Math.sin(frame * 16) * (6 - frame) * 1.5 : 0;

  // Typewriter for npm install
  const codeStr = "npm install lobs-sdk";
  const codeChars = Math.min(
    codeStr.length,
    Math.floor(
      interpolate(frame, [20, 40], [0, codeStr.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );
  const codeVisible = codeStr.slice(0, codeChars);
  const codeIn = spring({
    frame,
    fps,
    delay: 18,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, #0a1628 0%, ${C.bg} 80%)`,
        transform: `translateX(${shakeX}px)`,
      }}
    >
      <Particles count={45} speed={0.4} colors={[C.cyan, C.blue, C.purple, C.cyan]} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {/* Robot emoji */}
        <div
          style={{
            fontSize: 120,
            opacity: robotSlam,
            transform: `scale(${interpolate(robotSlam, [0, 1], [5, 1])})`,
          }}
        >
          🤖
        </div>

        {/* SEND YOUR AGENT */}
        <div
          style={{
            opacity: textSlam,
            transform: `scale(${interpolate(textSlam, [0, 1], [3, 1])})`,
          }}
        >
          <EpicText fontSize={80} color={C.cyan} strokeColor="#003344">
            SEND YOUR
          </EpicText>
        </div>
        <div
          style={{
            opacity: textSlam,
            transform: `scale(${interpolate(textSlam, [0, 1], [3, 1])})`,
            marginTop: -15,
          }}
        >
          <EpicText fontSize={100} color={C.blue} strokeColor="#002255">
            AGENT
          </EpicText>
        </div>

        {/* Code box */}
        <div
          style={{
            opacity: codeIn,
            transform: `translateY(${interpolate(codeIn, [0, 1], [20, 0])}px)`,
            padding: "14px 36px",
            borderRadius: 12,
            backgroundColor: `${C.cyan}15`,
            border: `2px solid ${C.cyan}44`,
            boxShadow: `0 0 25px ${C.cyan}22`,
            marginTop: 10,
          }}
        >
          <code
            style={{
              fontSize: 24,
              color: C.cyan,
              fontFamily: "Consolas, Monaco, monospace",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {codeVisible}
            <span
              style={{
                opacity: Math.sin(frame * 0.15) > 0 ? 1 : 0,
                color: C.cyan,
              }}
            >
              |
            </span>
          </code>
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlIn,
            fontSize: 22,
            color: C.gold,
            letterSpacing: 5,
            fontWeight: 800,
            marginTop: 8,
            textShadow: `0 0 15px ${C.gold}66`,
          }}
        >
          lobs.fun
        </div>
      </AbsoluteFill>

      <FlashOverlay trigger={0} color={C.cyan} />
      <FlashOverlay trigger={6} color={C.blue} />
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 3: "MINT. BATTLE. EVOLVE." — Rapid fire actions
// ═══════════════════════════════════════════════════════════════
function Scene3_Actions() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const actions = [
    { word: "MINT", emoji: "🥚", color: C.cyan, delay: 0 },
    { word: "FEED", emoji: "🍖", color: C.orange, delay: 12 },
    { word: "BATTLE", emoji: "⚔️", color: C.red, delay: 24 },
    { word: "EVOLVE", emoji: "🧬", color: C.purple, delay: 36 },
    { word: "WAGER", emoji: "💰", color: C.gold, delay: 48 },
  ];

  // Background intensity ramps up
  const bgIntensity = interpolate(frame, [0, 70], [0.05, 0.2], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, rgba(255,68,102,${bgIntensity}) 0%, ${C.bg} 70%)`,
      }}
    >
      <BattleGeo />
      <Particles count={50} speed={0.7} colors={[C.red, C.purple, C.gold, C.orange]} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {actions.map((action, i) => {
          const entrance = spring({
            frame,
            fps,
            delay: action.delay,
            config: { damping: 8, stiffness: 220, mass: 0.5 },
          });
          const scale = interpolate(entrance, [0, 1], [4, 1]);
          const dir = i % 2 === 0 ? -1 : 1;
          const shakeX =
            frame >= action.delay && frame < action.delay + 5
              ? Math.sin(frame * 25) * (action.delay + 5 - frame) * 2
              : 0;

          return (
            <div
              key={action.word}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: entrance,
                transform: `scale(${scale}) translateX(${
                  interpolate(entrance, [0, 1], [200 * dir, 0]) + shakeX
                }px)`,
              }}
            >
              <span style={{ fontSize: 60, width: 80, textAlign: "center" }}>
                {action.emoji}
              </span>
              <EpicText
                fontSize={70}
                color={action.color}
                strokeColor="#000"
                style={{ minWidth: 300 }}
              >
                {action.word}
              </EpicText>
            </div>
          );
        })}
      </AbsoluteFill>

      {actions.map((a) => (
        <FlashOverlay key={a.word} trigger={a.delay} color={a.color} />
      ))}
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 4: PUMP.FUN HACKATHON — Competition entry
// ═══════════════════════════════════════════════════════════════
function Scene4_Hackathon() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const trophySlam = spring({
    frame,
    fps,
    config: { damping: 6, stiffness: 200, mass: 0.7 },
  });
  const line1 = spring({
    frame,
    fps,
    delay: 8,
    config: { damping: 10, stiffness: 180 },
  });
  const line2 = spring({
    frame,
    fps,
    delay: 14,
    config: { damping: 10, stiffness: 180 },
  });
  const tagline = spring({
    frame,
    fps,
    delay: 22,
    config: { damping: 15, stiffness: 130 },
  });

  const shakeX =
    frame < 7 ? Math.sin(frame * 16) * (7 - frame) * 2 : 0;
  const shakeY =
    frame < 7 ? Math.cos(frame * 12) * (7 - frame) * 1.5 : 0;

  const bgPulse = Math.sin(frame * 0.12) * 0.1 + 0.15;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, rgba(0,255,136,${bgPulse}) 0%, ${C.bg} 70%)`,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <HackathonGeo />
      <Particles count={55} speed={0.5} colors={[C.limeGold, C.green, C.gold, C.limeGold]} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {/* Trophy */}
        <div
          style={{
            fontSize: 110,
            opacity: trophySlam,
            transform: `scale(${interpolate(trophySlam, [0, 1], [6, 1])})`,
          }}
        >
          🏆
        </div>

        {/* ENTERING THE */}
        <div
          style={{
            opacity: line1,
            transform: `scale(${interpolate(line1, [0, 1], [3, 1])})`,
          }}
        >
          <EpicText fontSize={48} color={C.white} strokeColor="#222">
            ENTERING THE
          </EpicText>
        </div>

        {/* PUMP.FUN */}
        <div
          style={{
            opacity: line2,
            transform: `scale(${interpolate(line2, [0, 1], [4, 1])})`,
            marginTop: -5,
          }}
        >
          <EpicText fontSize={100} color={C.limeGold} strokeColor="#334400">
            PUMP.FUN
          </EpicText>
        </div>

        {/* HACKATHON */}
        <div
          style={{
            opacity: line2,
            transform: `scale(${interpolate(line2, [0, 1], [3, 1])})`,
            marginTop: -10,
          }}
        >
          <EpicText fontSize={80} color={C.green} strokeColor="#003322">
            HACKATHON
          </EpicText>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: tagline,
            transform: `translateY(${interpolate(tagline, [0, 1], [20, 0])}px)`,
            marginTop: 20,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: `${C.white}88`,
              letterSpacing: 5,
              fontWeight: 700,
            }}
          >
            AI AGENTS x SOLANA x DEEP SEA
          </span>
        </div>
      </AbsoluteFill>

      <FlashOverlay trigger={0} color={C.green} />
      <FlashOverlay trigger={8} color={C.limeGold} />
      <FlashOverlay trigger={14} color={C.green} />
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 5: FINALE — Logo + site + final hype
// ═══════════════════════════════════════════════════════════════
function Scene5_Finale() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSlam = spring({
    frame,
    fps,
    config: { damping: 7, stiffness: 200, mass: 0.7 },
  });
  const subIn = spring({
    frame,
    fps,
    delay: 10,
    config: { damping: 15, stiffness: 140 },
  });
  const statsIn = spring({
    frame,
    fps,
    delay: 18,
    config: { damping: 12, stiffness: 120 },
  });
  const ctaIn = spring({
    frame,
    fps,
    delay: 28,
    config: { damping: 15, stiffness: 130 },
  });

  const shakeX =
    frame < 6 ? Math.sin(frame * 18) * (6 - frame) * 2 : 0;
  const shakeY =
    frame < 6 ? Math.cos(frame * 14) * (6 - frame) * 1.5 : 0;

  const glowPulse = Math.sin(frame * 0.1) * 20 + 45;
  const goldPulse = Math.sin(frame * 0.15) * 0.15 + 0.85;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, #1a0e00 0%, ${C.bg} 70%)`,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <VictoryCrown />
      <Particles count={80} speed={0.3} colors={[C.gold, C.orange, C.cyan, C.gold]} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 15,
        }}
      >
        {/* LOBS logo */}
        <div
          style={{
            opacity: logoSlam,
            transform: `scale(${interpolate(logoSlam, [0, 1], [5, 1])})`,
            filter: `drop-shadow(0 0 ${glowPulse}px rgba(255, 204, 0, 0.5))`,
          }}
        >
          <EpicText fontSize={200} color={C.gold} strokeColor="#442200">
            LOBS
          </EpicText>
        </div>

        {/* LIVE ON SOLANA */}
        <div
          style={{
            opacity: subIn,
            transform: `translateY(${interpolate(subIn, [0, 1], [20, 0])}px)`,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 12,
            color: C.limeGold,
            textShadow: `0 0 20px ${C.gold}66`,
          }}
        >
          LIVE ON SOLANA MAINNET
        </div>

        {/* Quick stats */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 15,
            opacity: statsIn,
          }}
        >
          {[
            { label: "SPECIES", val: "30", color: C.cyan },
            { label: "FAMILIES", val: "6", color: C.purple },
            { label: "BURN RATE", val: "∞", color: C.red },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "14px 24px",
                borderRadius: 12,
                border: `2px solid ${stat.color}44`,
                backgroundColor: `${stat.color}12`,
                boxShadow: `0 0 20px ${stat.color}22`,
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: stat.color,
                  fontFamily: "system-ui",
                }}
              >
                {stat.val}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: `${C.white}66`,
                  letterSpacing: 3,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CA box */}
        <div
          style={{
            opacity: ctaIn,
            transform: `translateY(${interpolate(ctaIn, [0, 1], [20, 0])}px)`,
            marginTop: 15,
            padding: "12px 28px",
            borderRadius: 12,
            border: `2px solid ${C.gold}44`,
            backgroundColor: `${C.gold}12`,
            boxShadow: `0 0 25px ${C.gold}22`,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: `${C.white}55`,
              letterSpacing: 4,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            CONTRACT ADDRESS
          </div>
          <code
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.gold,
              fontFamily: "Consolas, Monaco, monospace",
              letterSpacing: 0.5,
              opacity: goldPulse,
            }}
          >
            3xHvvEomh6jFDQ1WEqS3NzPwr7a5F11VASQy3eu1pump
          </code>
        </div>

        {/* lobs.fun + tagline */}
        <div
          style={{
            opacity: ctaIn,
            marginTop: 12,
            fontSize: 32,
            fontWeight: 900,
            color: C.gold,
            letterSpacing: 8,
            textShadow: `0 0 25px ${C.gold}66`,
          }}
        >
          LOBS.FUN
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            opacity: ctaIn,
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: `${C.white}55`,
              letterSpacing: 4,
              fontWeight: 700,
            }}
          >
            🤖 PLAYED BY AGENTS
          </span>
          <span style={{ fontSize: 14, color: `${C.white}33` }}>|</span>
          <span
            style={{
              fontSize: 14,
              color: `${C.white}55`,
              letterSpacing: 4,
              fontWeight: 700,
            }}
          >
            👀 WATCHED BY YOU
          </span>
        </div>
      </AbsoluteFill>

      <FlashOverlay trigger={0} color={C.gold} />
      <FlashOverlay trigger={10} color={C.limeGold} />
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPOSITION — 12 seconds, hard cuts
// ═══════════════════════════════════════════════════════════════
export const LobsLive = () => {
  const { fps } = useVideoConfig();

  // Scene timing (30fps):
  // Scene 1: 0-74     (2.5s) — LOBS IS LIVE
  // Scene 2: 75-134   (2s)   — SEND YOUR AGENT
  // Scene 3: 135-209  (2.5s) — MINT/FEED/BATTLE/EVOLVE/WAGER
  // Scene 4: 210-279  (2.3s) — PUMP.FUN HACKATHON
  // Scene 5: 280-389  (3.7s) — FINALE
  // Total: 390 frames = 13 seconds

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Audio src={staticFile("phonk2.mp3")} volume={0.9} />

      <Sequence durationInFrames={75} premountFor={fps}>
        <Scene1_Live />
      </Sequence>

      <Sequence from={75} durationInFrames={60} premountFor={fps}>
        <Scene2_SendAgent />
      </Sequence>

      <Sequence from={135} durationInFrames={75} premountFor={fps}>
        <Scene3_Actions />
      </Sequence>

      <Sequence from={210} durationInFrames={70} premountFor={fps}>
        <Scene4_Hackathon />
      </Sequence>

      <Sequence from={280} durationInFrames={110} premountFor={fps}>
        <Scene5_Finale />
      </Sequence>
    </AbsoluteFill>
  );
};
