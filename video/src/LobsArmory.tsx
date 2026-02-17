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

// ─── Colors ─────────────────────────────────────────────────
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
  gray: "#9ca3af",
};

// ─── Gear data for visuals ──────────────────────────────────
const RARITY_TIERS = [
  { label: "COMMON", color: "#9ca3af", glow: "none" },
  { label: "UNCOMMON", color: "#00ff88", glow: "0 0 12px rgba(0,255,136,0.4)" },
  { label: "RARE", color: "#00aaff", glow: "0 0 14px rgba(0,170,255,0.5)" },
  { label: "EPIC", color: "#aa55ff", glow: "0 0 16px rgba(170,85,255,0.6)" },
  { label: "LEGENDARY", color: "#ffcc00", glow: "0 0 20px rgba(255,204,0,0.6)" },
  { label: "ABYSSAL", color: "#ff00aa", glow: "0 0 24px rgba(255,0,170,0.7)" },
];

const GEAR_SLOTS = [
  { label: "HEAD", icon: "\u2655", side: "left" },
  { label: "CHEST", icon: "\u2616", side: "left" },
  { label: "CLAW", icon: "\u2694", side: "left" },
  { label: "TAIL", icon: "\u27B0", side: "left" },
  { label: "RANGED", icon: "\u2726", side: "right" },
  { label: "CHARM", icon: "\u2666", side: "right" },
  { label: "SHELL", icon: "\u2B21", side: "right" },
  { label: "FIN", icon: "\u2756", side: "right" },
];

const GEAR_ITEMS = [
  { name: "Abyssal Crown", slot: "HEAD", rarity: 4, icon: "\u2655" },
  { name: "Trenchplate", slot: "CHEST", rarity: 4, icon: "\u2616" },
  { name: "Void Talon", slot: "CLAW", rarity: 4, icon: "\u2694" },
  { name: "Phase Tail", slot: "TAIL", rarity: 3, icon: "\u27B0" },
  { name: "Singularity Barb", slot: "RANGED", rarity: 5, icon: "\u2726" },
  { name: "Fate Breaker", slot: "CHARM", rarity: 5, icon: "\u2666" },
];

// ─── Shared overlays ────────────────────────────────────────
function FlashOverlay({ trigger, color = C.cyan }: { trigger: number; color?: string }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [trigger, trigger + 4], [0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ backgroundColor: color, opacity, mixBlendMode: "screen", pointerEvents: "none" }}
    />
  );
}

function ScanLines() {
  const frame = useCurrentFrame();
  const offset = (frame * 2) % 4;
  return (
    <AbsoluteFill
      style={{
        background: `repeating-linear-gradient(0deg, transparent, transparent ${2 + offset}px, rgba(0,0,0,0.06) ${2 + offset}px, rgba(0,0,0,0.06) ${4 + offset}px)`,
        pointerEvents: "none",
      }}
    />
  );
}

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

function Particles({ count = 40, colors }: { count?: number; colors?: string[] }) {
  const frame = useCurrentFrame();
  const cols = colors || [C.cyan, C.blue, C.purple, C.pink];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = ((i * 137.5) % 100);
        const baseY = ((i * 73.7) % 100);
        const y = (baseY + frame * (0.15 + (i % 5) * 0.08)) % 120 - 10;
        const size = 1.5 + (i % 4) * 1.2;
        const col = cols[i % cols.length];
        const alpha = 0.15 + (i % 3) * 0.1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: col,
              opacity: alpha,
              boxShadow: `0 0 ${size * 3}px ${col}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// ─── 3D spinning geometry ───────────────────────────────────
function SpinningGeo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rot = (frame / fps) * 0.8;
  return (
    <ThreeCanvas
      width={1080}
      height={1080}
      orthographic={false}
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color={C.gold} />
      <pointLight position={[-3, -2, 2]} intensity={0.8} color={C.purple} />
      <mesh rotation={[rot, rot * 1.3, rot * 0.7]}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          color={C.gold}
          wireframe
          emissive={C.gold}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh rotation={[-rot * 0.5, rot, rot * 0.4]}>
        <torusGeometry args={[2.2, 0.03, 16, 80]} />
        <meshStandardMaterial
          color={C.pink}
          emissive={C.pink}
          emissiveIntensity={0.5}
        />
      </mesh>
    </ThreeCanvas>
  );
}

// ─── Scene 1: ARMORY Title Slam (0–55 frames) ──────────────
function Scene1_Title() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [12, 28], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const subtitleOp = interpolate(frame, [12, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gear icons orbiting
  const iconAngle = frame * 0.06;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
      <SpinningGeo />
      <Particles count={30} />

      {/* Orbiting gear icons */}
      {GEAR_SLOTS.map((slot, i) => {
        const angle = iconAngle + (i * Math.PI * 2) / 8;
        const radius = 320;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const rarity = RARITY_TIERS[i < 4 ? i + 2 : 5 - (i - 4)];
        const slotOp = interpolate(frame, [5 + i * 3, 12 + i * 3], [0, 0.7], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              fontSize: 36,
              opacity: slotOp,
              color: rarity.color,
              textShadow: `0 0 12px ${rarity.color}`,
              zIndex: 10,
            }}
          >
            {slot.icon}
          </div>
        );
      })}

      {/* ARMORY title */}
      <div
        style={{
          position: "absolute",
          textAlign: "center",
          zIndex: 20,
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 900,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "0.08em",
            color: C.white,
            textShadow: `0 0 40px ${C.gold}88, 0 0 80px ${C.gold}44, 0 4px 0 ${C.gold}`,
            WebkitTextStroke: `2px ${C.gold}`,
          }}
        >
          ARMORY
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.3em",
            color: C.cyan,
            opacity: subtitleOp,
            transform: `translateY(${subtitleY}px)`,
            textShadow: `0 0 20px ${C.cyan}66`,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          INSPECT &middot; EQUIP &middot; DOMINATE
        </div>
      </div>

      <FlashOverlay trigger={0} color={C.gold} />
      <ScanLines />
      <Vignette />
    </AbsoluteFill>
  );
}

// ─── Scene 2: Character Frame + Gear Slots (55–120 frames) ─
function Scene2_GearSlots() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ASCII creature in center
  const creatureArt = `  .===.\n| X X |\n| VVV |\n \\   /\n  '-'`;
  const creatureOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const creatureScale = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
      <Particles count={20} colors={[C.purple, C.pink, C.gold]} />

      {/* Character frame */}
      <div style={{ display: "flex", alignItems: "center", gap: 40, zIndex: 10 }}>
        {/* Left slots */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {GEAR_SLOTS.filter((s) => s.side === "left").map((slot, i) => (
            <GearSlotBox key={i} slot={slot} index={i} rarityIndex={4} />
          ))}
        </div>

        {/* Creature */}
        <div
          style={{
            width: 280,
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            border: `2px solid ${C.pink}33`,
            backgroundColor: "rgba(0,0,0,0.4)",
            boxShadow: `inset 0 0 60px ${C.pink}11, 0 0 30px ${C.pink}08`,
            opacity: creatureOp,
            transform: `scale(${creatureScale})`,
          }}
        >
          <pre
            style={{
              fontFamily: "monospace",
              fontSize: 28,
              lineHeight: "32px",
              color: C.pink,
              textShadow: `0 0 10px ${C.pink}66, 0 0 25px ${C.pink}33`,
              filter: "brightness(1.2)",
              whiteSpace: "pre",
            }}
          >
            {creatureArt}
          </pre>
        </div>

        {/* Right slots */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {GEAR_SLOTS.filter((s) => s.side === "right").map((slot, i) => (
            <GearSlotBox key={i} slot={slot} index={i + 4} rarityIndex={5 - i} />
          ))}
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          textAlign: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: C.white,
            textShadow: `0 0 20px ${C.cyan}44`,
            fontFamily: "system-ui, sans-serif",
            opacity: interpolate(frame, [20, 32], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          8 GEAR SLOTS
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.15em",
            color: C.cyan,
            opacity: interpolate(frame, [26, 38], [0, 0.8], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            fontFamily: "system-ui, sans-serif",
            marginTop: 8,
          }}
        >
          HEAD &middot; CHEST &middot; CLAW &middot; TAIL &middot; RANGED &middot; CHARM &middot; SHELL &middot; FIN
        </div>
      </div>

      <FlashOverlay trigger={0} color={C.purple} />
      <ScanLines />
      <Vignette />
    </AbsoluteFill>
  );
}

function GearSlotBox({ slot, index, rarityIndex }: { slot: typeof GEAR_SLOTS[0]; index: number; rarityIndex: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = index * 4;
  const rarity = RARITY_TIERS[Math.min(rarityIndex, 5)];

  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 200 } });
  const opacity = interpolate(frame, [delay, delay + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: 14,
        border: `2px solid ${rarity.color}`,
        backgroundColor: `${rarity.color}18`,
        boxShadow: `${rarity.glow}, inset 0 0 20px ${rarity.color}11`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `scale(${s})`,
      }}
    >
      <div style={{ fontSize: 28, color: rarity.color, textShadow: `0 0 8px ${rarity.color}55` }}>
        {slot.icon}
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: rarity.color,
          marginTop: 4,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {slot.label}
      </div>
    </div>
  );
}

// ─── Scene 3: Rarity Cascade (120–175 frames) ──────────────
function Scene3_Rarity() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
      <Particles count={25} colors={[C.gold, C.pink, C.purple]} />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 100,
          textAlign: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: C.white,
            textShadow: `0 0 30px ${C.gold}44`,
            fontFamily: "system-ui, sans-serif",
            opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          6 RARITY TIERS
        </div>
      </div>

      {/* Rarity cascade */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "center",
          zIndex: 10,
          marginTop: 40,
        }}
      >
        {RARITY_TIERS.map((tier, i) => {
          const delay = 6 + i * 5;
          const s = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 220 } });
          const op = interpolate(frame, [delay, delay + 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Width grows with rarity
          const width = 320 + i * 60;

          return (
            <div
              key={i}
              style={{
                width,
                height: 64,
                borderRadius: 16,
                border: `2px solid ${tier.color}`,
                backgroundColor: `${tier.color}15`,
                boxShadow: `${tier.glow !== "none" ? tier.glow : "none"}, inset 0 0 30px ${tier.color}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                opacity: op,
                transform: `scale(${s})`,
              }}
            >
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  color: tier.color,
                  textShadow: `0 0 15px ${tier.color}66`,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {tier.label}
              </span>
              {/* Stat bonus hint */}
              <span
                style={{
                  fontSize: 14,
                  color: `${tier.color}88`,
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                +{[1, 3, 5, 7, 10, 14][i]} STR
              </span>
            </div>
          );
        })}
      </div>

      <FlashOverlay trigger={0} color={C.gold} />
      <ScanLines />
      <Vignette />
    </AbsoluteFill>
  );
}

// ─── Scene 4: Gear Items Showcase (175–210 frames) ──────────
function Scene4_Items() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
      <Particles count={20} colors={[C.gold, C.cyan]} />

      {/* 48 ITEMS */}
      <div
        style={{
          position: "absolute",
          top: 80,
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: "0.15em",
          color: C.white,
          textShadow: `0 0 30px ${C.cyan}44`,
          fontFamily: "system-ui, sans-serif",
          zIndex: 20,
          opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        48 UNIQUE ITEMS
      </div>

      {/* Item grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          maxWidth: 720,
          zIndex: 10,
          marginTop: 60,
        }}
      >
        {GEAR_ITEMS.map((item, i) => {
          const delay = 4 + i * 3;
          const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 200 } });
          const rarity = RARITY_TIERS[item.rarity];
          return (
            <div
              key={i}
              style={{
                padding: "14px 18px",
                borderRadius: 14,
                border: `1.5px solid ${rarity.color}55`,
                backgroundColor: `${rarity.color}12`,
                boxShadow: rarity.glow !== "none" ? rarity.glow : undefined,
                transform: `scale(${s})`,
                opacity: interpolate(frame, [delay, delay + 6], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28, color: rarity.color }}>{item.icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: rarity.color,
                      fontFamily: "system-ui, sans-serif",
                      textShadow: `0 0 8px ${rarity.color}44`,
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      color: `${rarity.color}88`,
                      fontFamily: "monospace",
                      marginTop: 2,
                    }}
                  >
                    {rarity.label} &middot; {item.slot}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <FlashOverlay trigger={0} color={C.cyan} />
      <ScanLines />
      <Vignette />
    </AbsoluteFill>
  );
}

// ─── Scene 5: CTA — Coming Soon (210–240 frames) ───────────
function Scene5_CTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slamScale = spring({ frame, fps, config: { damping: 10, stiffness: 250 } });
  const subtitleOp = interpolate(frame, [10, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlOp = interpolate(frame, [16, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow
  const pulse = 0.8 + Math.sin(frame * 0.2) * 0.2;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
      <SpinningGeo />
      <Particles count={30} colors={[C.gold, C.pink, C.cyan, C.purple]} />

      <div style={{ textAlign: "center", zIndex: 20, transform: `scale(${slamScale})` }}>
        {/* GEAR UPGRADES */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: C.gold,
            textShadow: `0 0 40px ${C.gold}66, 0 0 80px ${C.gold}33`,
            fontFamily: "system-ui, sans-serif",
            WebkitTextStroke: `1px ${C.gold}`,
          }}
        >
          GEAR UPGRADES
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: C.white,
            textShadow: `0 0 50px ${C.pink}55, 0 0 100px ${C.pink}22, 0 4px 0 ${C.pink}`,
            fontFamily: "system-ui, sans-serif",
            WebkitTextStroke: `2px ${C.pink}`,
            marginTop: -10,
            opacity: pulse,
          }}
        >
          COMING SOON
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          textAlign: "center",
          zIndex: 20,
          opacity: subtitleOp,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.2em",
            color: C.cyan,
            textShadow: `0 0 15px ${C.cyan}44`,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          INSPECT NOW AT
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          textAlign: "center",
          zIndex: 20,
          opacity: urlOp,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: "0.08em",
            fontFamily: "monospace",
            color: C.white,
            textShadow: `0 0 20px ${C.cyan}55, 0 2px 0 ${C.cyan}`,
          }}
        >
          lobs.fun/armory
        </div>
      </div>

      <FlashOverlay trigger={0} color={C.pink} />
      <ScanLines />
      <Vignette />
    </AbsoluteFill>
  );
}

// ─── Main Composition ───────────────────────────────────────
export function LobsArmory() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* Audio — drop your file as video/public/armory.mp3 */}
      {/* Start from ~90s into the track (middle of song) — negative from skips ahead */}
      <Sequence from={-2700}>
        <Audio src={staticFile("armory.mp3")} volume={0.9} />
      </Sequence>

      {/* Scene 1: ARMORY Title Slam (0–55 frames, ~1.8s) */}
      <Sequence from={0} durationInFrames={55} premountFor={30}>
        <Scene1_Title />
      </Sequence>

      {/* Scene 2: Character Frame + 8 Gear Slots (55–120, ~2.2s) */}
      <Sequence from={55} durationInFrames={65} premountFor={30}>
        <Scene2_GearSlots />
      </Sequence>

      {/* Scene 3: Rarity Tiers Cascade (120–175, ~1.8s) */}
      <Sequence from={120} durationInFrames={55} premountFor={30}>
        <Scene3_Rarity />
      </Sequence>

      {/* Scene 4: 48 Items Showcase (175–210, ~1.2s) */}
      <Sequence from={175} durationInFrames={35} premountFor={30}>
        <Scene4_Items />
      </Sequence>

      {/* Scene 5: GEAR UPGRADES COMING SOON (210–240, ~1s) */}
      <Sequence from={210} durationInFrames={30} premountFor={30}>
        <Scene5_CTA />
      </Sequence>
    </AbsoluteFill>
  );
}
