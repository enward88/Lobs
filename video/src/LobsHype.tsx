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

// ─── Colors ─────────────────────────────────────────────────────
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
};

// ─── Shared: Screen flash on cut ────────────────────────────────
function FlashOverlay({ trigger, color = C.cyan }: { trigger: number; color?: string }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [trigger, trigger + 3], [0.8, 0], {
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

// ─── Shared: Scan lines overlay ─────────────────────────────────
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
          rgba(0,0,0,0.08) ${2 + offset}px,
          rgba(0,0,0,0.08) ${4 + offset}px
        )`,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Shared: Vignette ───────────────────────────────────────────
function Vignette() {
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Shared: Particle field ─────────────────────────────────────
function Particles({ count = 50, speed = 0.3 }: { count?: number; speed?: number }) {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: count }, (_, i) => ({
    x: (i * 137.5) % 100,
    baseY: (i * 73.1) % 100,
    size: (i % 4) + 1,
    spd: speed + (i % 7) * 0.08,
    color: [C.cyan, C.blue, C.purple, C.pink][i % 4],
    opacity: 0.08 + (i % 8) * 0.04,
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
              boxShadow: `0 0 ${p.size * 6}px ${p.color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// ─── 3D: Rotating Icosahedron ───────────────────────────────────
function SpinningGeo() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const rotX = frame * 0.03;
  const rotY = frame * 0.05;
  const pulse = Math.sin(frame * 0.08) * 0.15 + 1;

  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute" }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color={C.cyan} />
      <pointLight position={[-5, -3, 3]} intensity={0.8} color={C.purple} />
      <mesh rotation={[rotX, rotY, 0]} scale={[pulse, pulse, pulse]}>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshStandardMaterial
          color={C.cyan}
          wireframe
          emissive={new THREE.Color(C.cyan)}
          emissiveIntensity={0.4}
        />
      </mesh>
    </ThreeCanvas>
  );
}

// ─── 3D: Rotating Torus Knot ────────────────────────────────────
function SpinningTorus() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const rotX = frame * 0.04;
  const rotY = frame * 0.06;

  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute" }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color={C.purple} />
      <pointLight position={[-4, -2, 3]} intensity={0.6} color={C.pink} />
      <mesh rotation={[rotX, rotY, frame * 0.02]}>
        <torusKnotGeometry args={[1.8, 0.5, 128, 16]} />
        <meshStandardMaterial
          color={C.purple}
          wireframe
          emissive={new THREE.Color(C.purple)}
          emissiveIntensity={0.3}
        />
      </mesh>
    </ThreeCanvas>
  );
}

// ─── 3D: Rotating Octahedron ────────────────────────────────────
function SpinningOcta() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute" }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 5, 4]} intensity={1.5} color={C.gold} />
      <pointLight position={[-3, -2, 5]} intensity={0.5} color={C.red} />
      <mesh rotation={[frame * 0.05, frame * 0.03, frame * 0.04]} scale={2.5}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={C.gold}
          wireframe
          emissive={new THREE.Color(C.gold)}
          emissiveIntensity={0.5}
        />
      </mesh>
    </ThreeCanvas>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 1: HARD OPEN — "LOBS" slams in with zoom + shake
// ═══════════════════════════════════════════════════════════════
function Scene1_TitleSlam() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title slams from huge scale to normal
  const slam = spring({ frame, fps, config: { damping: 8, stiffness: 200, mass: 0.8 } });
  const scale = interpolate(slam, [0, 1], [6, 1]);
  const opacity = interpolate(frame, [0, 2], [0, 1], { extrapolateRight: "clamp" });

  // Screen shake on impact
  const shakeX = frame < 8 ? Math.sin(frame * 15) * (8 - frame) * 1.5 : 0;
  const shakeY = frame < 8 ? Math.cos(frame * 12) * (8 - frame) * 1.2 : 0;

  // Glitch bars
  const glitch1 = frame > 2 && frame < 6;
  const glitch2 = frame > 4 && frame < 7;

  // Subtitle stagger
  const sub1 = spring({ frame, fps, delay: 12, config: { damping: 15, stiffness: 150 } });
  const sub2 = spring({ frame, fps, delay: 18, config: { damping: 15, stiffness: 150 } });

  const glowPulse = Math.sin(frame * 0.15) * 15 + 30;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, #0a1628 0%, ${C.bg} 80%)`,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <SpinningGeo />
      <Particles count={60} speed={0.5} />

      {/* Glitch bars */}
      {glitch1 && (
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: C.cyan,
            opacity: 0.6,
            boxShadow: `0 0 20px ${C.cyan}`,
          }}
        />
      )}
      {glitch2 && (
        <div
          style={{
            position: "absolute",
            top: "65%",
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: C.purple,
            opacity: 0.5,
            boxShadow: `0 0 15px ${C.purple}`,
          }}
        />
      )}

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
            fontSize: 220,
            fontWeight: 900,
            letterSpacing: 30,
            fontFamily: "system-ui, -apple-system, sans-serif",
            background: `linear-gradient(135deg, ${C.cyan}, ${C.blue}, ${C.purple})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transform: `scale(${scale})`,
            opacity,
            filter: `drop-shadow(0 0 ${glowPulse}px rgba(0, 255, 213, 0.5))`,
          }}
        >
          LOBS
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: C.cyan,
              letterSpacing: 8,
              opacity: sub1,
              transform: `translateY(${interpolate(sub1, [0, 1], [40, 0])}px)`,
              textShadow: `0 0 20px ${C.cyan}88`,
            }}
          >
            ON-CHAIN
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: C.purple,
              letterSpacing: 8,
              opacity: sub2,
              transform: `translateY(${interpolate(sub2, [0, 1], [40, 0])}px)`,
              textShadow: `0 0 20px ${C.purple}88`,
            }}
          >
            SOLANA
          </div>
        </div>
      </AbsoluteFill>

      <FlashOverlay trigger={0} color={C.white} />
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 2: "FOR AGENTS ONLY" — hard cut, text zooms
// ═══════════════════════════════════════════════════════════════
function Scene2_AgentsOnly() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = [
    { text: "BUILT FOR", color: C.white, delay: 0 },
    { text: "AI AGENTS", color: C.cyan, delay: 6 },
    { text: "ONLY", color: C.red, delay: 14 },
  ];

  // Background zoom
  const bgScale = interpolate(frame, [0, 60], [1, 1.15], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        transform: `scale(${bgScale})`,
      }}
    >
      <SpinningTorus />
      <Particles count={40} speed={0.6} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {lines.map((line, i) => {
          const entrance = spring({
            frame,
            fps,
            delay: line.delay,
            config: { damping: 10, stiffness: 200, mass: 0.6 },
          });
          const lineScale = interpolate(entrance, [0, 1], [3, 1]);
          const shake = frame >= line.delay && frame < line.delay + 5
            ? Math.sin(frame * 20) * (line.delay + 5 - frame) * 0.8
            : 0;

          return (
            <div
              key={i}
              style={{
                fontSize: i === 1 ? 100 : i === 2 ? 80 : 50,
                fontWeight: 900,
                letterSpacing: i === 1 ? 14 : 8,
                color: line.color,
                opacity: entrance,
                transform: `scale(${lineScale}) translateX(${shake}px)`,
                textShadow: `0 0 40px ${line.color}88`,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </AbsoluteFill>

      <FlashOverlay trigger={0} color={C.cyan} />
      <FlashOverlay trigger={6} color={C.cyan} />
      <FlashOverlay trigger={14} color={C.red} />
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 3: SPECIES — rapid fire family showcase
// ═══════════════════════════════════════════════════════════════
function Scene3_Species() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const families = [
    { emoji: "🦀", name: "CRUSTACEAN", color: C.red, count: "5" },
    { emoji: "🐙", name: "MOLLUSK", color: C.purple, count: "5" },
    { emoji: "🪼", name: "JELLYFISH", color: C.cyan, count: "5" },
    { emoji: "🐟", name: "FISH", color: C.blue, count: "5" },
    { emoji: "🌿", name: "FLORA", color: C.green, count: "5" },
    { emoji: "👁️", name: "ABYSSAL", color: C.pink, count: "5" },
  ];

  // Header slam
  const headerSlam = spring({ frame, fps, config: { damping: 10, stiffness: 180 } });

  // Counter animation
  const counterVal = Math.min(30, Math.floor(interpolate(frame, [5, 30], [0, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  })));

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Particles count={30} speed={0.4} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        {/* Big number counter */}
        <div
          style={{
            fontSize: 160,
            fontWeight: 900,
            fontFamily: "system-ui",
            color: C.cyan,
            opacity: headerSlam,
            transform: `scale(${interpolate(headerSlam, [0, 1], [4, 1])})`,
            textShadow: `0 0 60px ${C.cyan}66`,
            lineHeight: 1,
          }}
        >
          {counterVal}
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: C.white,
            letterSpacing: 12,
            opacity: headerSlam,
            marginBottom: 40,
          }}
        >
          SPECIES
        </div>

        {/* Family grid — rapid pop-in */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "center",
            maxWidth: 900,
          }}
        >
          {families.map((fam, i) => {
            const popIn = spring({
              frame,
              fps,
              delay: 15 + i * 4,
              config: { damping: 8, stiffness: 250, mass: 0.5 },
            });

            return (
              <div
                key={fam.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 22px",
                  borderRadius: 14,
                  border: `2px solid ${fam.color}55`,
                  backgroundColor: `${fam.color}15`,
                  opacity: popIn,
                  transform: `scale(${interpolate(popIn, [0, 1], [0.3, 1])}) rotate(${interpolate(popIn, [0, 1], [-10, 0])}deg)`,
                  boxShadow: `0 0 25px ${fam.color}33`,
                }}
              >
                <div style={{ fontSize: 40 }}>{fam.emoji}</div>
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: fam.color,
                      letterSpacing: 3,
                    }}
                  >
                    {fam.name}
                  </div>
                  <div style={{ fontSize: 12, color: `${C.white}66`, letterSpacing: 2 }}>
                    {fam.count} SPECIES
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <FlashOverlay trigger={0} color={C.purple} />
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 4: GAME LOOP — each action slams in from alternating sides
// ═══════════════════════════════════════════════════════════════
function Scene4_GameLoop() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { icon: "🥚", label: "MINT", desc: "RANDOM CREATURE", color: C.cyan, from: "left" },
    { icon: "🍖", label: "FEED", desc: "BURN $LOBS", color: C.red, from: "right" },
    { icon: "⚔️", label: "BATTLE", desc: "ON-CHAIN PVP", color: C.purple, from: "left" },
    { icon: "💰", label: "WAGER", desc: "STAKE $LOBS", color: C.gold, from: "right" },
    { icon: "🧬", label: "EVOLVE", desc: "2X POWER", color: C.green, from: "left" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Particles count={35} speed={0.5} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {steps.map((step, i) => {
          const entrance = spring({
            frame,
            fps,
            delay: i * 8,
            config: { damping: 10, stiffness: 200, mass: 0.5 },
          });
          const dir = step.from === "left" ? -1 : 1;
          const shake = frame >= i * 8 && frame < i * 8 + 4
            ? Math.sin(frame * 25) * (i * 8 + 4 - frame) * 1.5
            : 0;

          return (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: entrance,
                transform: `translateX(${interpolate(entrance, [0, 1], [300 * dir, 0]) + shake}px)`,
              }}
            >
              <div style={{ fontSize: 52, width: 70, textAlign: "center" }}>{step.icon}</div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: step.color,
                  letterSpacing: 6,
                  textShadow: `0 0 30px ${step.color}66`,
                  minWidth: 240,
                }}
              >
                {step.label}
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: `${C.white}88`,
                  letterSpacing: 4,
                  fontWeight: 700,
                }}
              >
                {step.desc}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      <FlashOverlay trigger={0} color={C.blue} />
      {steps.map((_, i) => (
        <FlashOverlay key={i} trigger={i * 8} color={steps[i].color} />
      ))}
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 5: BURN — fire, destruction, deflationary
// ═══════════════════════════════════════════════════════════════
function Scene5_Burn() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fireSlam = spring({ frame, fps, config: { damping: 6, stiffness: 200, mass: 0.7 } });
  const textSlam = spring({ frame, fps, delay: 8, config: { damping: 8, stiffness: 180 } });
  const statsIn = spring({ frame, fps, delay: 18, config: { damping: 12, stiffness: 150 } });

  const fireFlicker = Math.sin(frame * 0.4) * 0.2 + 0.8;
  const bgPulse = Math.sin(frame * 0.15) * 0.3 + 0.7;

  // Shake on slam
  const shakeX = frame < 5 ? Math.sin(frame * 18) * (5 - frame) * 2 : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        transform: `translateX(${shakeX}px)`,
      }}
    >
      {/* Red pulsing bg */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 60%, rgba(255,50,50,${bgPulse * 0.15}) 0%, transparent 60%)`,
        }}
      />

      <SpinningOcta />
      <Particles count={40} speed={0.7} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {/* Fire emoji slam */}
        <div
          style={{
            fontSize: 140,
            opacity: fireSlam,
            transform: `scale(${interpolate(fireSlam, [0, 1], [5, 1])})`,
            filter: `brightness(${fireFlicker + 0.2})`,
          }}
        >
          🔥
        </div>

        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: C.gold,
            letterSpacing: 6,
            opacity: textSlam,
            transform: `scale(${interpolate(textSlam, [0, 1], [2.5, 1])})`,
            textShadow: `0 0 40px ${C.gold}88`,
          }}
        >
          DEFLATIONARY
        </div>

        <div style={{ display: "flex", gap: 30, opacity: statsIn }}>
          {[
            { label: "FEED", value: "10K BURNED", color: C.red },
            { label: "WAGER FEE", value: "2.5% BURNED", color: C.gold },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "18px 28px",
                borderRadius: 14,
                border: `2px solid ${stat.color}55`,
                backgroundColor: `${stat.color}15`,
                boxShadow: `0 0 20px ${stat.color}33`,
              }}
            >
              <div style={{ fontSize: 13, color: `${C.white}66`, letterSpacing: 4, fontWeight: 700 }}>
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: stat.color,
                  letterSpacing: 2,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 18,
            color: `${C.white}66`,
            letterSpacing: 5,
            fontWeight: 700,
            opacity: statsIn,
            marginTop: 5,
          }}
        >
          SUPPLY DECREASES FOREVER
        </div>
      </AbsoluteFill>

      <FlashOverlay trigger={0} color={C.red} />
      <FlashOverlay trigger={8} color={C.gold} />
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENE 6: CTA — final slam, npm install, CA coming soon
// ═══════════════════════════════════════════════════════════════
function Scene6_CTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSlam = spring({ frame, fps, config: { damping: 8, stiffness: 180, mass: 0.7 } });
  const installIn = spring({ frame, fps, delay: 12, config: { damping: 15, stiffness: 150 } });
  const caIn = spring({ frame, fps, delay: 22, config: { damping: 12, stiffness: 120 } });

  const caPulse = Math.sin(frame * 0.15) * 0.2 + 0.8;
  const glowPulse = Math.sin(frame * 0.1) * 20 + 40;

  const shakeX = frame < 6 ? Math.sin(frame * 16) * (6 - frame) * 1.8 : 0;
  const shakeY = frame < 6 ? Math.cos(frame * 13) * (6 - frame) * 1.2 : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <SpinningGeo />
      <Particles count={60} speed={0.4} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 25,
        }}
      >
        {/* Logo slam */}
        <div
          style={{
            fontSize: 180,
            fontWeight: 900,
            letterSpacing: 24,
            fontFamily: "system-ui, -apple-system, sans-serif",
            background: `linear-gradient(135deg, ${C.cyan}, ${C.blue}, ${C.purple})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: logoSlam,
            transform: `scale(${interpolate(logoSlam, [0, 1], [4, 1])})`,
            filter: `drop-shadow(0 0 ${glowPulse}px rgba(0, 255, 213, 0.5))`,
          }}
        >
          LOBS
        </div>

        {/* npm install box */}
        <div
          style={{
            opacity: installIn,
            transform: `translateY(${interpolate(installIn, [0, 1], [30, 0])}px)`,
            padding: "16px 40px",
            borderRadius: 14,
            backgroundColor: `${C.cyan}18`,
            border: `2px solid ${C.cyan}44`,
            boxShadow: `0 0 30px ${C.cyan}22`,
          }}
        >
          <code
            style={{
              fontSize: 26,
              color: C.cyan,
              fontFamily: "Consolas, Monaco, monospace",
              letterSpacing: 1,
              fontWeight: 700,
            }}
          >
            npm install lobs-sdk
          </code>
        </div>

        {/* CA: COMING SOON */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 900,
            letterSpacing: 10,
            color: C.gold,
            opacity: caIn * caPulse,
            transform: `scale(${interpolate(caIn, [0, 1], [2, 1])})`,
            textShadow: `0 0 30px ${C.gold}66`,
          }}
        >
          CA: COMING SOON
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            opacity: caIn,
            marginTop: 5,
          }}
        >
          <span style={{ fontSize: 14, color: `${C.white}55`, letterSpacing: 4, fontWeight: 700 }}>
            🤖 PLAYED BY AGENTS
          </span>
          <span style={{ fontSize: 14, color: `${C.white}33` }}>|</span>
          <span style={{ fontSize: 14, color: `${C.white}55`, letterSpacing: 4, fontWeight: 700 }}>
            👀 SPECTATED BY HUMANS
          </span>
        </div>
      </AbsoluteFill>

      <FlashOverlay trigger={0} color={C.white} />
      <FlashOverlay trigger={12} color={C.cyan} />
      <FlashOverlay trigger={22} color={C.gold} />
      <Vignette />
      <ScanLines />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPOSITION — HARD CUTS, no fades
// ═══════════════════════════════════════════════════════════════
export const LobsHype = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* Phonk audio */}
      <Audio
        src={staticFile("phonk.mp3")}
        volume={0.85}
      />

      {/* Hard cuts — no transitions, just sequences */}
      <Sequence durationInFrames={70} premountFor={fps}>
        <Scene1_TitleSlam />
      </Sequence>

      <Sequence from={70} durationInFrames={55} premountFor={fps}>
        <Scene2_AgentsOnly />
      </Sequence>

      <Sequence from={125} durationInFrames={75} premountFor={fps}>
        <Scene3_Species />
      </Sequence>

      <Sequence from={200} durationInFrames={75} premountFor={fps}>
        <Scene4_GameLoop />
      </Sequence>

      <Sequence from={275} durationInFrames={70} premountFor={fps}>
        <Scene5_Burn />
      </Sequence>

      <Sequence from={345} durationInFrames={105} premountFor={fps}>
        <Scene6_CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
