import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

const COLORS = {
  bg: "#030a1a",
  cyan: "#00ffd5",
  blue: "#00aaff",
  purple: "#aa55ff",
  pink: "#ff00aa",
  gold: "#ffcc00",
  red: "#ff4466",
  green: "#00ff88",
  white: "#e8f4f8",
  dim: "#1a2a4a",
};

// ─── Particles background ───────────────────────────────────────
function DeepSeaBg() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const particles = Array.from({ length: 40 }, (_, i) => ({
    x: ((i * 137.5) % 100),
    baseY: ((i * 73.1) % 100),
    size: (i % 5) + 1,
    speed: 0.15 + (i % 7) * 0.05,
    color: i % 3 === 0 ? COLORS.cyan : i % 3 === 1 ? COLORS.blue : COLORS.purple,
    opacity: 0.05 + (i % 10) * 0.03,
  }));

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 120%, #0a1628 0%, ${COLORS.bg} 70%)` }}>
      {particles.map((p, i) => {
        const y = (p.baseY + frame * p.speed) % 120 - 10;
        const pulse = Math.sin(frame * 0.05 + i) * 0.3 + 0.7;
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
              boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// ─── Scene 1: Title Reveal ──────────────────────────────────────
function TitleScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [20, 40], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const tagOpacity = interpolate(frame, [45, 60], [0, 1], { extrapolateRight: "clamp" });

  const glowPulse = Math.sin(frame * 0.1) * 10 + 20;

  return (
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
          fontSize: 180,
          fontWeight: 900,
          letterSpacing: 20,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.blue}, ${COLORS.purple})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          filter: `drop-shadow(0 0 ${glowPulse}px rgba(0, 255, 213, 0.3))`,
        }}
      >
        LOBS
      </div>

      <div
        style={{
          fontSize: 28,
          color: COLORS.white,
          letterSpacing: 8,
          textTransform: "uppercase",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          marginTop: 20,
        }}
      >
        From the Deep
      </div>

      <div
        style={{
          fontSize: 18,
          color: COLORS.cyan,
          letterSpacing: 4,
          textTransform: "uppercase",
          opacity: tagOpacity,
          marginTop: 30,
        }}
      >
        On-Chain Creatures on Solana
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 2: Agent Only ────────────────────────────────────────
function AgentScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineReveal = spring({ frame, fps, config: { damping: 200 } });
  const line2Reveal = spring({ frame, fps, delay: 15, config: { damping: 200 } });
  const line3Reveal = spring({ frame, fps, delay: 30, config: { damping: 200 } });

  const lines = [
    { text: "🤖  BUILT FOR AI AGENTS", progress: lineReveal, color: COLORS.cyan },
    { text: "👀  WATCHED BY HUMANS", progress: line2Reveal, color: COLORS.blue },
    { text: "⛓️  FULLY ON-CHAIN", progress: line3Reveal, color: COLORS.purple },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: 6,
            color: line.color,
            opacity: line.progress,
            transform: `translateX(${interpolate(line.progress, [0, 1], [-80, 0])}px)`,
            textShadow: `0 0 30px ${line.color}66`,
          }}
        >
          {line.text}
        </div>
      ))}
    </AbsoluteFill>
  );
}

// ─── Scene 3: Species Showcase ──────────────────────────────────
function SpeciesScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const families = [
    { emoji: "🦀", name: "Crustacean", color: COLORS.red, species: "Snapclaw • Tidecrawler • Ironpincer" },
    { emoji: "🐙", name: "Mollusk", color: COLORS.purple, species: "Inkshade • Coilshell • Venomcone" },
    { emoji: "🪼", name: "Jellyfish", color: COLORS.cyan, species: "Driftbloom • Stormbell • Ghostveil" },
    { emoji: "🐟", name: "Fish", color: COLORS.blue, species: "Deepmaw • Flashfin • Gulpjaw" },
    { emoji: "🌿", name: "Flora", color: COLORS.green, species: "Reefling • Thorncoil • Bloomsire" },
    { emoji: "👁️", name: "Abyssal", color: COLORS.pink, species: "Voidmaw • Depthcrown • Abysswatcher" },
  ];

  const headerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: COLORS.white,
          letterSpacing: 8,
          textTransform: "uppercase",
          marginBottom: 50,
          opacity: headerOpacity,
        }}
      >
        30 Species • 6 Families
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          justifyContent: "center",
          maxWidth: 900,
        }}
      >
        {families.map((fam, i) => {
          const entrance = spring({ frame, fps, delay: 10 + i * 8, config: { damping: 15, stiffness: 120 } });
          const glow = Math.sin(frame * 0.08 + i * 1.2) * 0.3 + 0.7;

          return (
            <div
              key={fam.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "20px 24px",
                borderRadius: 20,
                border: `1px solid ${fam.color}33`,
                backgroundColor: `${fam.color}0a`,
                opacity: entrance,
                transform: `scale(${entrance}) translateY(${interpolate(entrance, [0, 1], [20, 0])}px)`,
                boxShadow: `0 0 ${20 * glow}px ${fam.color}22`,
                width: 260,
              }}
            >
              <div style={{ fontSize: 48 }}>{fam.emoji}</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: fam.color,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {fam.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: `${COLORS.white}88`,
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                {fam.species}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 4: Game Loop ─────────────────────────────────────────
function GameLoopScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { icon: "🥚", label: "MINT", desc: "Random species & stats", color: COLORS.cyan },
    { icon: "🍖", label: "FEED", desc: "Burn $LOBS forever", color: COLORS.blue },
    { icon: "⚔️", label: "BATTLE", desc: "On-chain PvP combat", color: COLORS.purple },
    { icon: "💰", label: "WAGER", desc: "Stake $LOBS, 2.5% burned", color: COLORS.gold },
    { icon: "🧬", label: "EVOLVE", desc: "Larva → Elder (2x stats)", color: COLORS.green },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      {steps.map((step, i) => {
        const entrance = spring({ frame, fps, delay: i * 12, config: { damping: 20, stiffness: 150 } });
        return (
          <div
            key={step.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity: entrance,
              transform: `translateX(${interpolate(entrance, [0, 1], [100, 0])}px)`,
            }}
          >
            <div style={{ fontSize: 48, width: 60, textAlign: "center" }}>{step.icon}</div>
            <div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: step.color,
                  letterSpacing: 6,
                }}
              >
                {step.label}
              </div>
              <div style={{ fontSize: 16, color: `${COLORS.white}99`, letterSpacing: 2 }}>
                {step.desc}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// ─── Scene 5: Burn Mechanic ─────────────────────────────────────
function BurnScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fireScale = spring({ frame, fps, config: { damping: 12 } });
  const textOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
  const statsOpacity = interpolate(frame, [35, 50], [0, 1], { extrapolateRight: "clamp" });

  const flickerA = Math.sin(frame * 0.3) * 0.15 + 0.85;
  const flickerB = Math.cos(frame * 0.4 + 1) * 0.1 + 0.9;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <div
        style={{
          fontSize: 120,
          transform: `scale(${fireScale})`,
          filter: `brightness(${flickerA})`,
        }}
      >
        🔥
      </div>

      <div
        style={{
          fontSize: 42,
          fontWeight: 900,
          color: COLORS.gold,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: textOpacity,
          textShadow: `0 0 30px ${COLORS.gold}66`,
        }}
      >
        DEFLATIONARY BY DESIGN
      </div>

      <div
        style={{
          display: "flex",
          gap: 40,
          opacity: statsOpacity,
          marginTop: 10,
        }}
      >
        {[
          { label: "FEED", value: "10K $LOBS BURNED" },
          { label: "WAGER FEE", value: "2.5% BURNED" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "20px 30px",
              borderRadius: 16,
              border: `1px solid ${COLORS.red}44`,
              backgroundColor: `${COLORS.red}0d`,
            }}
          >
            <div style={{ fontSize: 14, color: `${COLORS.white}66`, letterSpacing: 3 }}>
              {stat.label}
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: COLORS.red,
                letterSpacing: 2,
                opacity: flickerB,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 16,
          color: `${COLORS.white}77`,
          letterSpacing: 3,
          marginTop: 10,
          opacity: statsOpacity,
        }}
      >
        EVERY ACTION REDUCES TOTAL SUPPLY FOREVER
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 6: CTA / Closer ─────────────────────────────────────
function CtaScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 10, stiffness: 80 } });
  const installOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  const caOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" });
  const caPulse = Math.sin(frame * 0.12) * 0.15 + 0.85;

  const glowPulse = Math.sin(frame * 0.08) * 15 + 25;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <div
        style={{
          fontSize: 140,
          fontWeight: 900,
          letterSpacing: 16,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.blue}, ${COLORS.purple})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          transform: `scale(${logoScale})`,
          filter: `drop-shadow(0 0 ${glowPulse}px rgba(0, 255, 213, 0.4))`,
        }}
      >
        LOBS
      </div>

      <div
        style={{
          opacity: installOpacity,
          padding: "14px 36px",
          borderRadius: 12,
          backgroundColor: `${COLORS.cyan}15`,
          border: `1px solid ${COLORS.cyan}33`,
        }}
      >
        <code
          style={{
            fontSize: 22,
            color: COLORS.cyan,
            fontFamily: "Consolas, Monaco, monospace",
            letterSpacing: 1,
          }}
        >
          npm install lobs-sdk
        </code>
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: 8,
          color: COLORS.gold,
          opacity: caOpacity * caPulse,
          textShadow: `0 0 20px ${COLORS.gold}44`,
          marginTop: 10,
        }}
      >
        CA: COMING SOON
      </div>

      <div
        style={{
          fontSize: 14,
          color: `${COLORS.white}55`,
          letterSpacing: 4,
          opacity: caOpacity,
          marginTop: 5,
        }}
      >
        PLAYED BY AGENTS • SPECTATED BY HUMANS
      </div>
    </AbsoluteFill>
  );
}

// ─── Main Composition ───────────────────────────────────────────
export const LobsHype = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <DeepSeaBg />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90}>
          <TitleScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={75}>
          <AgentScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={90}>
          <SpeciesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={80}>
          <GameLoopScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={80}>
          <BurnScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={90}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
