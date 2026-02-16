import {
  useCurrentFrame,
  interpolate,
  spring,
  Sequence,
  Img,
  AbsoluteFill,
} from "remotion";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

// ─── Species Data ─────────────────────────────────────────
const FIGHTERS = [
  { name: "VOIDMAW", family: "Abyssal", str: 18, vit: 12, spd: 9, color: "#ff1744", record: "47W-3L" },
  { name: "SNAPCLAW", family: "Crustacean", str: 15, vit: 14, spd: 11, color: "#00ffd5", record: "38W-12L" },
  { name: "STORMBELL", family: "Jellyfish", str: 16, vit: 10, spd: 14, color: "#aa55ff", record: "41W-9L" },
  { name: "DEEPMAW", family: "Fish", str: 19, vit: 8, spd: 7, color: "#ff6e40", record: "52W-6L" },
  { name: "INKSHADE", family: "Mollusk", str: 14, vit: 13, spd: 13, color: "#00aaff", record: "35W-15L" },
  { name: "DEPTHCROWN", family: "Abyssal", str: 17, vit: 13, spd: 10, color: "#ffd600", record: "44W-4L" },
];

// Battle sequence: [attackerIdx, defenderIdx, damage, killShot]
const BATTLE_SEQUENCE = [
  { a: 0, b: 1, dmg: 24, kill: false, text: null },
  { a: 1, b: 0, dmg: 18, kill: false, text: null },
  { a: 0, b: 1, dmg: 31, kill: false, text: "CRITICAL" },
  { a: 2, b: 3, dmg: 22, kill: false, text: null },
  { a: 3, b: 2, dmg: 27, kill: false, text: null },
  { a: 2, b: 3, dmg: 35, kill: true, text: "DESTROYED" },
  { a: 4, b: 5, dmg: 19, kill: false, text: null },
  { a: 5, b: 4, dmg: 26, kill: false, text: null },
  { a: 5, b: 4, dmg: 33, kill: true, text: "ANNIHILATED" },
  { a: 0, b: 5, dmg: 29, kill: false, text: "MASSIVE HIT" },
  { a: 0, b: 5, dmg: 38, kill: true, text: "OBLITERATED" },
];

const KILL_TEXTS = ["DESTROYED", "ANNIHILATED", "OBLITERATED", "WRECKED", "DELETED"];

// ─── Helpers ──────────────────────────────────────────────

function shake(frame: number, intensity: number): string {
  const x = Math.sin(frame * 17.3) * intensity;
  const y = Math.cos(frame * 13.7) * intensity;
  return `translate(${x}px, ${y}px)`;
}

function glitchOffset(frame: number): number {
  return Math.sin(frame * 31.4) * 3;
}

// ─── ASCII Creature Art ───────────────────────────────────
const CREATURE_ART: Record<string, string[]> = {
  VOIDMAW: [
    "    ╔══╗    ",
    "   ║@@║   ",
    "  ╔╝~~╚╗  ",
    " ║╬╬╬╬╬║ ",
    " ╚══╦╦══╝ ",
    "   ╚╝╚╝   ",
  ],
  SNAPCLAW: [
    " ╔═╗  ╔═╗ ",
    " ║ ╠══╣ ║ ",
    " ╚═╣@@╠═╝ ",
    "   ║~~║   ",
    "  ╔╝╔╗╚╗  ",
    "  ╚═╝╚═╝  ",
  ],
  STORMBELL: [
    "   ╔════╗   ",
    "  ║ @@ ║  ",
    " ║~~~~~~║ ",
    " ║ ╔══╗ ║ ",
    "  ╚╝  ╚╝  ",
    "   ║║║║   ",
  ],
  DEEPMAW: [
    "  ╔═════╗  ",
    " ║ @  @ ║ ",
    " ╠═╗~~╔═╣ ",
    " ║VVVVVV║ ",
    "  ╚════╝  ",
    "   ~~~~   ",
  ],
  INKSHADE: [
    "  ╔═══╗  ",
    " ║ @@ ║ ",
    " ╠═══╣  ",
    " ║║║║║ ",
    " ╚╝╚╝╚╝ ",
    "  ~~~~~  ",
  ],
  DEPTHCROWN: [
    " ╔╗╔═╗╔╗ ",
    " ║╚╝@╚╝║ ",
    " ║ ~~ ║ ",
    " ╠════╣ ",
    " ╚╗╔╗╔╝ ",
    "  ╚╝╚╝  ",
  ],
};

// Weapon ASCII art for attacks
const WEAPON_ART: Record<string, string[]> = {
  CLAW: [
    "╔═╗",
    "║/║",
    "╚═╝",
  ],
  TRIDENT: [
    "╠╦╣",
    " ║ ",
    " ║ ",
  ],
  TENTACLE: [
    "~~~",
    " ~ ",
    "  ~",
  ],
};

// Map families to weapon type
function getWeapon(family: string): string[] {
  switch (family) {
    case "Crustacean": return WEAPON_ART.CLAW;
    case "Mollusk": return WEAPON_ART.TENTACLE;
    case "Jellyfish": return WEAPON_ART.TENTACLE;
    default: return WEAPON_ART.TRIDENT;
  }
}

// ─── Sub-Components ───────────────────────────────────────

function Scanlines({ opacity }: { opacity: number }) {
  return (
    <AbsoluteFill
      style={{
        opacity,
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        pointerEvents: "none",
      }}
    />
  );
}

function Vignette() {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        pointerEvents: "none",
      }}
    />
  );
}

function Letterbox() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: "black",
          zIndex: 100,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: "black",
          zIndex: 100,
        }}
      />
    </>
  );
}

function FlashOverlay({ frame, triggerFrame, color, duration }: {
  frame: number;
  triggerFrame: number;
  color: string;
  duration: number;
}) {
  if (frame < triggerFrame || frame > triggerFrame + duration) return null;
  const progress = (frame - triggerFrame) / duration;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: interpolate(progress, [0, 1], [0.7, 0], { extrapolateRight: "clamp" }),
        zIndex: 50,
      }}
    />
  );
}

function DamageNumber({ frame, startFrame, damage, x, y, color }: {
  frame: number;
  startFrame: number;
  damage: number;
  x: number;
  y: number;
  color: string;
}) {
  const local = frame - startFrame;
  if (local < 0 || local > 20) return null;
  const yOff = interpolate(local, [0, 20], [0, -80]);
  const opacity = interpolate(local, [0, 5, 15, 20], [0, 1, 1, 0]);
  const scale = interpolate(local, [0, 3, 8], [2.5, 1.2, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + yOff,
        transform: `scale(${scale})`,
        opacity,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        fontSize: 72,
        fontWeight: 900,
        color,
        textShadow: `0 0 20px ${color}, 0 0 40px ${color}88, 2px 2px 0 #000`,
        zIndex: 60,
        letterSpacing: -2,
      }}
    >
      -{damage}
    </div>
  );
}

function KillText({ frame, startFrame, text, color }: {
  frame: number;
  startFrame: number;
  text: string;
  color: string;
}) {
  const local = frame - startFrame;
  if (local < 0 || local > 25) return null;
  const scale = interpolate(local, [0, 4, 8, 25], [5, 1.1, 1, 0.8], { extrapolateRight: "clamp" });
  const opacity = interpolate(local, [0, 2, 18, 25], [0, 1, 1, 0]);
  const rot = interpolate(local, [0, 4], [-5, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "45%",
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`,
        opacity,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        fontSize: 96,
        fontWeight: 900,
        color,
        textShadow: `0 0 30px ${color}, 0 0 60px ${color}88, 3px 3px 0 #000, -1px -1px 0 #000`,
        zIndex: 70,
        letterSpacing: 8,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}

// ─── Animated Creature Card with Attack Motion ───────────
function CreatureCard({ name, family, str, vit, spd, color, record, side, frame, startFrame, attackFrame, isAttacking }: {
  name: string;
  family: string;
  str: number;
  vit: number;
  spd: number;
  color: string;
  record: string;
  side: "left" | "right";
  frame: number;
  startFrame: number;
  attackFrame: number;
  isAttacking: boolean;
}) {
  const local = frame - startFrame;
  const slideIn = interpolate(local, [0, 8], [side === "left" ? -400 : 400, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(local, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const art = CREATURE_ART[name] || CREATURE_ART.VOIDMAW;
  const weapon = getWeapon(family);

  // Attack animation: dash toward center, swing, return
  const attackLocal = frame - attackFrame;
  let attackX = 0;
  let attackRot = 0;
  let weaponOpacity = 0;
  let weaponSwing = 0;

  if (isAttacking && attackLocal >= 0 && attackLocal < 18) {
    // Phase 1 (0-4): Wind up - lean back slightly
    // Phase 2 (4-8): Dash forward toward opponent
    // Phase 3 (8-11): Strike - at opponent position, weapon swing
    // Phase 4 (11-18): Return to position
    const dashDist = side === "left" ? 320 : -320;

    if (attackLocal < 4) {
      // Wind up - lean back
      attackX = interpolate(attackLocal, [0, 4], [0, side === "left" ? -30 : 30], { extrapolateRight: "clamp" });
      attackRot = interpolate(attackLocal, [0, 4], [0, side === "left" ? -8 : 8], { extrapolateRight: "clamp" });
    } else if (attackLocal < 8) {
      // Dash forward
      attackX = interpolate(attackLocal, [4, 8], [side === "left" ? -30 : 30, dashDist], { extrapolateRight: "clamp" });
      attackRot = interpolate(attackLocal, [4, 6], [side === "left" ? -8 : 8, 0], { extrapolateRight: "clamp" });
      weaponOpacity = interpolate(attackLocal, [5, 7], [0, 1], { extrapolateRight: "clamp" });
    } else if (attackLocal < 11) {
      // Strike - hold at opponent, swing weapon
      attackX = dashDist;
      weaponOpacity = 1;
      weaponSwing = interpolate(attackLocal, [8, 10], [0, side === "left" ? 45 : -45], { extrapolateRight: "clamp" });
      attackRot = interpolate(attackLocal, [8, 10], [0, side === "left" ? 5 : -5], { extrapolateRight: "clamp" });
    } else {
      // Return to position
      attackX = interpolate(attackLocal, [11, 18], [dashDist, 0], { extrapolateRight: "clamp" });
      weaponOpacity = interpolate(attackLocal, [11, 13], [1, 0], { extrapolateRight: "clamp" });
      weaponSwing = side === "left" ? 45 : -45;
    }
  }

  // Hit recoil when being attacked (not the attacker)
  let recoilX = 0;
  if (!isAttacking && attackLocal >= 8 && attackLocal < 14) {
    recoilX = interpolate(attackLocal, [8, 10, 14], [0, side === "left" ? -25 : 25, 0], { extrapolateRight: "clamp" });
  }

  const baseX = side === "left" ? 60 : undefined;
  const baseRight = side === "right" ? 60 : undefined;

  return (
    <div
      style={{
        position: "absolute",
        left: baseX,
        right: baseRight,
        top: 180,
        transform: `translateX(${slideIn + attackX + recoilX}px) rotate(${attackRot}deg)`,
        opacity,
        zIndex: isAttacking && attackLocal >= 4 && attackLocal < 11 ? 20 : 10,
      }}
    >
      {/* Creature ASCII art */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 18,
          lineHeight: 1.2,
          color,
          textShadow: `0 0 15px ${color}88`,
          whiteSpace: "pre",
          textAlign: "center",
          marginBottom: 16,
          transform: side === "right" ? "scaleX(-1)" : "none",
        }}
      >
        {art.join("\n")}
      </div>

      {/* Weapon overlay during attack */}
      {weaponOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: -10,
            [side === "left" ? "right" : "left"]: -30,
            fontFamily: "monospace",
            fontSize: 22,
            lineHeight: 1.1,
            color: "#fff",
            textShadow: `0 0 20px ${color}, 0 0 40px ${color}88`,
            whiteSpace: "pre",
            opacity: weaponOpacity,
            transform: `rotate(${weaponSwing}deg)`,
            transformOrigin: side === "left" ? "bottom left" : "bottom right",
          }}
        >
          {weapon.join("\n")}
        </div>
      )}

      {/* Impact sparks at strike moment */}
      {isAttacking && attackLocal >= 8 && attackLocal < 12 && (
        <div
          style={{
            position: "absolute",
            top: 20,
            [side === "left" ? "right" : "left"]: -50,
            zIndex: 25,
          }}
        >
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const dist = interpolate(attackLocal, [8, 12], [0, 40 + i * 8]);
            const sparkOpacity = interpolate(attackLocal, [8, 10, 12], [0, 1, 0]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}`,
                  transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`,
                  opacity: sparkOpacity,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Name plate */}
      <div
        style={{
          background: `linear-gradient(135deg, ${color}22, ${color}08)`,
          border: `1px solid ${color}44`,
          borderRadius: 8,
          padding: "12px 20px",
          minWidth: 200,
        }}
      >
        <div
          style={{
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontSize: 28,
            fontWeight: 900,
            color,
            letterSpacing: 3,
            textShadow: `0 0 10px ${color}66`,
          }}
        >
          {name}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#888", letterSpacing: 2, marginTop: 2 }}>
          {family.toUpperCase()} — {record}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <div style={{ fontFamily: "monospace", fontSize: 13, color: "#ff4466" }}>STR {str}</div>
          <div style={{ fontFamily: "monospace", fontSize: 13, color: "#00ff88" }}>VIT {vit}</div>
          <div style={{ fontFamily: "monospace", fontSize: 13, color: "#00aaff" }}>SPD {spd}</div>
        </div>
      </div>
    </div>
  );
}

function HPBar({ current, max, color, side, frame }: {
  current: number;
  max: number;
  color: string;
  side: "left" | "right";
  frame: number;
}) {
  const pct = Math.max(0, (current / max) * 100);
  const barColor = pct > 50 ? "#00ff88" : pct > 25 ? "#ffcc00" : "#ff1744";
  return (
    <div
      style={{
        position: "absolute",
        [side]: 60,
        top: 440,
        width: 220,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 10, color: "#666", marginBottom: 3 }}>
        <span>HP</span>
        <span>{current}/{max}</span>
      </div>
      <div style={{ height: 8, background: "#111", borderRadius: 4, overflow: "hidden", border: "1px solid #333" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            boxShadow: `0 0 10px ${barColor}66`,
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

// ─── Scene: Intro Countdown ───────────────────────────────
function IntroScene({ frame }: { frame: number }) {
  // 3...2...1...FIGHT
  const nums = [
    { text: "3", start: 5, color: "#ff4466" },
    { text: "2", start: 20, color: "#ffcc00" },
    { text: "1", start: 35, color: "#00ff88" },
    { text: "FIGHT", start: 50, color: "#fff" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,255,213,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,213,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* LOBS ARENA text */}
      <div
        style={{
          position: "absolute",
          top: 120,
          width: "100%",
          textAlign: "center",
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          fontSize: 24,
          color: "#444",
          letterSpacing: 12,
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        LOBS ARENA
      </div>

      {nums.map((n) => {
        const local = frame - n.start;
        if (local < 0 || local > 14) return null;
        const isFight = n.text === "FIGHT";
        const scale = isFight
          ? interpolate(local, [0, 3, 6], [6, 1.2, 1], { extrapolateRight: "clamp" })
          : interpolate(local, [0, 3, 10, 14], [4, 1, 1, 0.5], { extrapolateRight: "clamp" });
        const opacity = isFight
          ? interpolate(local, [0, 2, 10, 14], [0, 1, 1, 0])
          : interpolate(local, [0, 2, 10, 14], [0, 1, 1, 0]);
        return (
          <div
            key={n.text}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              fontSize: isFight ? 120 : 160,
              fontWeight: 900,
              color: n.color,
              textShadow: `0 0 40px ${n.color}88, 0 0 80px ${n.color}44`,
              letterSpacing: isFight ? 16 : 0,
            }}
          >
            {n.text}
          </div>
        );
      })}

      <Scanlines opacity={0.2} />
      <Letterbox />
    </AbsoluteFill>
  );
}

// ─── Scene: Battle with Attack Animations ────────────────
function BattleScene({ frame, battleIdx, fighterA, fighterB, hits }: {
  frame: number;
  battleIdx: number;
  fighterA: typeof FIGHTERS[0];
  fighterB: typeof FIGHTERS[0];
  hits: typeof BATTLE_SEQUENCE;
}) {
  const TICK = 22; // frames per hit — slightly longer to accommodate attack animation
  let hpA = fighterA.vit * 5;
  let hpB = fighterB.vit * 5;
  const maxHpA = hpA;
  const maxHpB = hpB;

  // Determine which fighter index maps to A vs B for this battle
  const aIndices = new Set(hits.map(h => h.a));
  const bIndices = new Set(hits.map(h => h.b));
  // fighterA is always on the left, fighterB on the right
  // Hits where attacker is "left side" reduce right HP, and vice versa

  // Calculate HP at current frame
  for (let i = 0; i < hits.length; i++) {
    const hitFrame = i * TICK + 10; // damage applies at strike moment (frame 10 of attack anim)
    if (frame >= hitFrame) {
      // Figure out if attacker is the left or right fighter
      const attackerIsLeft = hits[i].a === hits[0].a || hits[i].a === hits[0].b && hits[0].b !== hits[0].a ? (hits[i].a % 2 === 0) : true;
      // Simplified: even-indexed fighters attack right, odd attack left
      if (hits[i].a % 2 === 0) {
        hpB = Math.max(0, hpB - hits[i].dmg);
      } else {
        hpA = Math.max(0, hpA - hits[i].dmg);
      }
    }
  }

  // Active hit for shake and attack
  const activeHitIdx = Math.floor(frame / TICK);
  const activeHit = activeHitIdx < hits.length ? hits[activeHitIdx] : null;
  const hitLocal = frame - activeHitIdx * TICK;
  const isStrikeMoment = hitLocal >= 8 && hitLocal < 12;
  const shakeIntensity = isStrikeMoment ? interpolate(hitLocal, [8, 12], [15, 0]) : 0;

  // Determine if left or right creature is attacking this tick
  const leftIsAttacking = activeHit ? activeHit.a % 2 === 0 : false;
  const rightIsAttacking = activeHit ? activeHit.a % 2 !== 0 : false;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050508",
        transform: shake(frame, shakeIntensity),
      }}
    >
      {/* Dark arena background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 30% 50%, ${fighterA.color}06 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 50%, ${fighterB.color}06 0%, transparent 50%)`,
        }}
      />

      {/* VS line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 100,
          bottom: 100,
          width: 1,
          background: `linear-gradient(transparent, #333, transparent)`,
          transform: "translateX(-50%)",
        }}
      />

      {/* Round indicator */}
      <div
        style={{
          position: "absolute",
          top: 100,
          width: "100%",
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 11,
          color: "#444",
          letterSpacing: 4,
          zIndex: 10,
        }}
      >
        ROUND {activeHitIdx + 1}
      </div>

      {/* Fighter cards with attack animations */}
      <CreatureCard
        {...fighterA}
        side="left"
        frame={frame}
        startFrame={0}
        attackFrame={leftIsAttacking ? activeHitIdx * TICK : -100}
        isAttacking={leftIsAttacking && activeHitIdx < hits.length}
      />
      <CreatureCard
        {...fighterB}
        side="right"
        frame={frame}
        startFrame={0}
        attackFrame={rightIsAttacking ? activeHitIdx * TICK : (leftIsAttacking ? activeHitIdx * TICK : -100)}
        isAttacking={rightIsAttacking && activeHitIdx < hits.length}
      />

      {/* HP bars */}
      <HPBar current={hpA} max={maxHpA} color={fighterA.color} side="left" frame={frame} />
      <HPBar current={hpB} max={maxHpB} color={fighterB.color} side="right" frame={frame} />

      {/* Damage numbers — appear at strike moment */}
      {hits.map((hit, i) => {
        const hitFrame = i * TICK + 8; // damage number appears at strike
        const isDefenderRight = hit.a % 2 === 0;
        return (
          <DamageNumber
            key={i}
            frame={frame}
            startFrame={hitFrame}
            damage={hit.dmg}
            x={isDefenderRight ? 750 : 180}
            y={300}
            color={isDefenderRight ? fighterA.color : fighterB.color}
          />
        );
      })}

      {/* Kill text overlays */}
      {hits.map((hit, i) => {
        if (!hit.text) return null;
        return (
          <KillText
            key={`kill-${i}`}
            frame={frame}
            startFrame={i * TICK + 10}
            text={hit.text}
            color={hit.kill ? "#ff1744" : "#ffd600"}
          />
        );
      })}

      {/* Hit flash at strike moment */}
      {hits.map((hit, i) => (
        <FlashOverlay
          key={`flash-${i}`}
          frame={frame}
          triggerFrame={i * TICK + 8}
          color={hit.kill ? "#ff1744" : "#fff"}
          duration={hit.kill ? 6 : 3}
        />
      ))}

      {/* Glitch bars on kills */}
      {hits.filter(h => h.kill).map((hit, i) => {
        const hitFrame = hits.indexOf(hit) * TICK + 8;
        const local = frame - hitFrame;
        if (local < 0 || local > 8) return null;
        return (
          <div key={`glitch-${i}`} style={{ position: "absolute", inset: 0, zIndex: 55, overflow: "hidden" }}>
            {[...Array(5)].map((_, j) => (
              <div
                key={j}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 200 + j * 120 + glitchOffset(frame + j * 7),
                  height: 4,
                  background: `rgba(255,23,68,${0.6 - local * 0.07})`,
                  transform: `translateX(${glitchOffset(frame + j * 13) * 4}px)`,
                }}
              />
            ))}
          </div>
        );
      })}

      {/* SFX: one sound per hit — gunshot for normal, headshot for crits, KO for kills (never stacked) */}
      {hits.map((hit, i) => {
        const triggerFrame = i * TICK + 8;
        if (hit.kill) {
          return (
            <Sequence key={`sfx-hit-${i}`} from={triggerFrame} durationInFrames={60}>
              <Audio src={staticFile("ko.mp3")} volume={0.9} />
            </Sequence>
          );
        }
        if (hit.text) {
          return (
            <Sequence key={`sfx-hit-${i}`} from={triggerFrame} durationInFrames={60}>
              <Audio src={staticFile("headshot.mp3")} volume={0.8} />
            </Sequence>
          );
        }
        return (
          <Sequence key={`sfx-hit-${i}`} from={triggerFrame} durationInFrames={60}>
            <Audio src={staticFile("gunshot.mp3")} volume={0.7} />
          </Sequence>
        );
      })}

      {/* Wager info */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          width: "100%",
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 13,
          color: "#ffcc00",
          letterSpacing: 3,
          textShadow: "0 0 10px rgba(255,204,0,0.3)",
          zIndex: 10,
        }}
      >
        WAGER: 500,000 $LOBS — 2.5% BURNED
      </div>

      <Scanlines opacity={0.15} />
      <Vignette />
      <Letterbox />
    </AbsoluteFill>
  );
}

// ─── Scene: Kill Montage (variable-length cuts) ──────────
// Cuts with killstreak announcements get more time so audio plays out
const MONTAGE_KILLS = [
  { killer: FIGHTERS[0], victim: FIGHTERS[1], dmg: 42, text: "WRECKED", dur: 12 },
  { killer: FIGHTERS[2], victim: FIGHTERS[3], dmg: 38, text: "DELETED", dur: 30 },      // DOUBLE KILL — hold
  { killer: FIGHTERS[5], victim: FIGHTERS[4], dmg: 45, text: "DESTROYED", dur: 30 },     // TRIPLE KILL — hold
  { killer: FIGHTERS[0], victim: FIGHTERS[5], dmg: 51, text: "OBLITERATED", dur: 12 },
  { killer: FIGHTERS[3], victim: FIGHTERS[2], dmg: 36, text: "ANNIHILATED", dur: 30 },   // KILLING SPREE — hold
  { killer: FIGHTERS[0], victim: FIGHTERS[3], dmg: 48, text: "WRECKED", dur: 6 },        // quick finish
];
// Cumulative start frames for each cut
const MONTAGE_STARTS = MONTAGE_KILLS.reduce<number[]>((acc, k, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + MONTAGE_KILLS[i - 1].dur);
  return acc;
}, []);

function KillMontage({ frame }: { frame: number }) {
  // Find which cut we're in
  let cutIdx = 0;
  for (let i = 0; i < MONTAGE_KILLS.length; i++) {
    if (frame >= MONTAGE_STARTS[i]) cutIdx = i;
  }
  const kill = MONTAGE_KILLS[cutIdx];
  const local = frame - MONTAGE_STARTS[cutIdx];
  const CUT = kill.dur;
  const flashOpacity = interpolate(local, [0, 2, CUT], [0.8, 0.3, 0], { extrapolateRight: "clamp" });

  // Killer creature dashes from left to center on each cut
  const killerDash = interpolate(local, [0, 3, 6], [-200, 50, 0], { extrapolateRight: "clamp" });
  const killerScale = interpolate(local, [0, 3, 6], [0.5, 1.2, 1], { extrapolateRight: "clamp" });

  // Victim flies off to the right
  const victimX = interpolate(local, [3, Math.min(7, CUT - 1)], [0, 400], { extrapolateRight: "clamp" });
  const victimRot = interpolate(local, [3, Math.min(7, CUT - 1)], [0, 25], { extrapolateRight: "clamp" });
  const victimOpacity = interpolate(local, [3, Math.min(8, CUT - 1)], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        transform: shake(frame, 8),
      }}
    >
      {/* Desaturated red overlay */}
      <AbsoluteFill style={{ backgroundColor: "#ff174410" }} />

      {/* Killer creature art dashing in */}
      <div
        style={{
          position: "absolute",
          left: `calc(25% + ${killerDash}px)`,
          top: "25%",
          transform: `scale(${killerScale})`,
          fontFamily: "monospace",
          fontSize: 16,
          lineHeight: 1.2,
          color: kill.killer.color,
          textShadow: `0 0 20px ${kill.killer.color}88`,
          whiteSpace: "pre",
          opacity: interpolate(local, [0, 2], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {(CREATURE_ART[kill.killer.name] || CREATURE_ART.VOIDMAW).join("\n")}
      </div>

      {/* Victim creature getting knocked away */}
      <div
        style={{
          position: "absolute",
          right: `calc(25% - ${victimX}px)`,
          top: "25%",
          transform: `scaleX(-1) rotate(${victimRot}deg)`,
          fontFamily: "monospace",
          fontSize: 16,
          lineHeight: 1.2,
          color: kill.victim.color,
          textShadow: `0 0 15px ${kill.victim.color}66`,
          whiteSpace: "pre",
          opacity: victimOpacity,
        }}
      >
        {(CREATURE_ART[kill.victim.name] || CREATURE_ART.VOIDMAW).join("\n")}
      </div>

      {/* Kill name */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "55%",
          transform: `translate(-50%, -50%) scale(${interpolate(local, [0, 3], [2, 1], { extrapolateRight: "clamp" })})`,
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          fontSize: 48,
          fontWeight: 900,
          color: kill.killer.color,
          textShadow: `0 0 20px ${kill.killer.color}88`,
          letterSpacing: 6,
          opacity: CUT <= 8
            ? interpolate(local, [0, 1, CUT], [0, 1, 0])
            : interpolate(local, [0, 2, CUT - 3, CUT], [0, 1, 1, 0]),
        }}
      >
        {kill.killer.name}
      </div>

      {/* Damage */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "68%",
          transform: `translate(-50%, -50%) scale(${interpolate(local, [0, 2, Math.min(5, CUT - 1)], [4, 1.3, 1], { extrapolateRight: "clamp" })})`,
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          fontSize: 90,
          fontWeight: 900,
          color: "#ff1744",
          textShadow: "0 0 40px #ff174488, 0 0 80px #ff174444, 3px 3px 0 #000",
          opacity: CUT <= 8
            ? interpolate(local, [0, 1, CUT], [0, 1, 0])
            : interpolate(local, [0, 1, CUT - 3, CUT], [0, 1, 1, 0]),
        }}
      >
        -{kill.dmg}
      </div>

      {/* Kill text */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "82%",
          transform: `translate(-50%, -50%)`,
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          fontSize: 36,
          fontWeight: 900,
          color: "#ffd600",
          textShadow: "0 0 15px #ffd60066, 2px 2px 0 #000",
          letterSpacing: 8,
          opacity: CUT <= 8
            ? interpolate(local, [0, 1, CUT], [0, 1, 0])
            : interpolate(local, [2, 4, CUT - 3, CUT], [0, 1, 1, 0]),
        }}
      >
        {kill.text}
      </div>

      {/* "ELIMINATED" text */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "92%",
          transform: "translate(-50%, -50%)",
          fontFamily: "monospace",
          fontSize: 14,
          color: "#666",
          letterSpacing: 4,
          opacity: CUT <= 8
            ? interpolate(local, [0, 1, CUT], [0, 1, 0])
            : interpolate(local, [3, 5, CUT - 3, CUT], [0, 1, 1, 0]),
        }}
      >
        {kill.victim.name} ELIMINATED
      </div>

      {/* Flash */}
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flashOpacity, zIndex: 50 }} />

      <Scanlines opacity={0.25} />
      <Letterbox />
    </AbsoluteFill>
  );
}

// ─── Scene: Burn Counter ──────────────────────────────────
function BurnScene({ frame }: { frame: number }) {
  const count = Math.floor(interpolate(frame, [0, 60], [0, 2847291], { extrapolateRight: "clamp" }));
  const formatted = count.toLocaleString();

  return (
    <AbsoluteFill style={{ backgroundColor: "#050508" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, #ff174408 0%, transparent 60%)",
        }}
      />

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "38%",
          transform: "translate(-50%, -50%)",
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          fontSize: 72,
          fontWeight: 900,
          background: "linear-gradient(135deg, #ff4466, #ffcc00)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: -1,
          textAlign: "center",
        }}
      >
        {formatted}
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "monospace",
          fontSize: 16,
          color: "#ff4466",
          letterSpacing: 8,
          textAlign: "center",
        }}
      >
        $LOBS BURNED FOREVER
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "62%",
          transform: "translate(-50%, -50%)",
          fontFamily: "monospace",
          fontSize: 12,
          color: "#444",
          letterSpacing: 4,
          textAlign: "center",
        }}
      >
        SUPPLY ONLY GOES DOWN
      </div>

      <Scanlines opacity={0.1} />
      <Vignette />
      <Letterbox />
    </AbsoluteFill>
  );
}

// ─── Scene: Outro ─────────────────────────────────────────
function OutroScene({ frame }: { frame: number }) {
  const scale = interpolate(frame, [0, 15], [3, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity,
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          fontSize: 100,
          fontWeight: 900,
          background: "linear-gradient(135deg, #00ffd5, #00aaff, #aa55ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 12,
          textAlign: "center",
        }}
      >
        LOBS
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "55%",
          transform: "translate(-50%, -50%)",
          fontFamily: "monospace",
          fontSize: 14,
          color: "#666",
          letterSpacing: 6,
          opacity: interpolate(frame, [15, 25], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        FROM THE DEEP
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "65%",
          transform: "translate(-50%, -50%)",
          fontFamily: "monospace",
          fontSize: 11,
          color: "#444",
          letterSpacing: 4,
          opacity: interpolate(frame, [20, 30], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        PLAYED BY AGENTS — SPECTATED BY HUMANS
      </div>

      <Scanlines opacity={0.1} />
      <Letterbox />
    </AbsoluteFill>
  );
}

// ─── Kill Counter for Killstreak SFX ─────────────────────
// Track cumulative kills for killstreak announcements
const KILLSTREAK_FRAMES: { frame: number; type: "double" | "triple" | "spree" }[] = [];
// Battle 1 hits (scenes at frame 70): hit indices 0,1,2 — no kills
// Battle 2 hits (scenes at frame 170): hit indices 3,4,5 — kill at 5 (1st kill)
// Kill montage (scene at frame 300): 6 rapid kills
// We'll place killstreak SFX in the montage section

// ─── Main Composition ─────────────────────────────────────
export function LobsPvP() {
  const frame = useCurrentFrame();

  // Scene timings (adjusted for longer TICK in battles)
  // Battle TICK = 22 frames, 3 hits per battle = 66 frames + buffer
  const INTRO_END = 70;
  const BATTLE1_DUR = 80; // 3 hits × 22 + buffer
  const BATTLE1_END = INTRO_END + BATTLE1_DUR; // 150
  const BATTLE2_DUR = 80;
  const BATTLE2_END = BATTLE1_END + BATTLE2_DUR; // 230
  const MONTAGE_DUR = 120;
  const MONTAGE_END = BATTLE2_END + MONTAGE_DUR; // 350
  const BURN_DUR = 70;
  const BURN_END = MONTAGE_END + BURN_DUR; // 420
  const OUTRO_DUR = 120;
  const TOTAL = BURN_END + OUTRO_DUR; // 540

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Audio — new phonk track */}
      <Audio src={staticFile("phonk2.mp3")} volume={0.65} />

      {/* Scene 1: Countdown intro (0-70, ~2.3s) */}
      <Sequence from={0} durationInFrames={INTRO_END}>
        <IntroScene frame={frame} />
      </Sequence>

      {/* Scene 2: Battle 1 — Voidmaw vs Snapclaw */}
      <Sequence from={INTRO_END} durationInFrames={BATTLE1_DUR}>
        <BattleScene
          frame={frame - INTRO_END}
          battleIdx={0}
          fighterA={FIGHTERS[0]}
          fighterB={FIGHTERS[1]}
          hits={BATTLE_SEQUENCE.slice(0, 3)}
        />
      </Sequence>

      {/* Scene 3: Battle 2 — Stormbell vs Deepmaw */}
      <Sequence from={BATTLE1_END} durationInFrames={BATTLE2_DUR}>
        <BattleScene
          frame={frame - BATTLE1_END}
          battleIdx={1}
          fighterA={FIGHTERS[2]}
          fighterB={FIGHTERS[3]}
          hits={BATTLE_SEQUENCE.slice(3, 6)}
        />
      </Sequence>

      {/* Scene 4: Kill montage — rapid cuts */}
      <Sequence from={BATTLE2_END} durationInFrames={MONTAGE_DUR}>
        <KillMontage frame={frame - BATTLE2_END} />
      </Sequence>

      {/* Montage SFX: one sound per kill — uses MONTAGE_STARTS for proper timing */}
      {/* Kill 1: gunshot */}
      <Sequence from={BATTLE2_END + MONTAGE_STARTS[0]} durationInFrames={60}>
        <Audio src={staticFile("gunshot.mp3")} volume={0.7} />
      </Sequence>
      {/* Kill 2: DOUBLE KILL (cut holds 30 frames so announcer plays out) */}
      <Sequence from={BATTLE2_END + MONTAGE_STARTS[1]} durationInFrames={90}>
        <Audio src={staticFile("doublekill.mp3")} volume={1} />
      </Sequence>
      {/* Kill 3: TRIPLE KILL */}
      <Sequence from={BATTLE2_END + MONTAGE_STARTS[2]} durationInFrames={90}>
        <Audio src={staticFile("triplekill.mp3")} volume={1} />
      </Sequence>
      {/* Kill 4: headshot */}
      <Sequence from={BATTLE2_END + MONTAGE_STARTS[3]} durationInFrames={60}>
        <Audio src={staticFile("headshot.mp3")} volume={0.8} />
      </Sequence>
      {/* Kill 5: KILLING SPREE */}
      <Sequence from={BATTLE2_END + MONTAGE_STARTS[4]} durationInFrames={90}>
        <Audio src={staticFile("killingspree.mp3")} volume={1} />
      </Sequence>
      {/* Kill 6: KO */}
      <Sequence from={BATTLE2_END + MONTAGE_STARTS[5]} durationInFrames={60}>
        <Audio src={staticFile("ko.mp3")} volume={0.9} />
      </Sequence>

      {/* Killstreak text overlays during montage — match the longer cuts */}
      <Sequence from={BATTLE2_END + MONTAGE_STARTS[1]} durationInFrames={28}>
        <KillstreakOverlay frame={frame - (BATTLE2_END + MONTAGE_STARTS[1])} text="DOUBLE KILL" color="#00ffd5" />
      </Sequence>
      <Sequence from={BATTLE2_END + MONTAGE_STARTS[2]} durationInFrames={28}>
        <KillstreakOverlay frame={frame - (BATTLE2_END + MONTAGE_STARTS[2])} text="TRIPLE KILL" color="#aa55ff" />
      </Sequence>
      <Sequence from={BATTLE2_END + MONTAGE_STARTS[4]} durationInFrames={28}>
        <KillstreakOverlay frame={frame - (BATTLE2_END + MONTAGE_STARTS[4])} text="KILLING SPREE" color="#ff1744" />
      </Sequence>

      {/* Scene 5: Burn counter */}
      <Sequence from={MONTAGE_END} durationInFrames={BURN_DUR}>
        <BurnScene frame={frame - MONTAGE_END} />
      </Sequence>

      {/* Scene 6: Outro */}
      <Sequence from={BURN_END} durationInFrames={OUTRO_DUR}>
        <OutroScene frame={frame - BURN_END} />
      </Sequence>
    </AbsoluteFill>
  );
}

// ─── Killstreak Overlay ──────────────────────────────────
function KillstreakOverlay({ frame, text, color }: { frame: number; text: string; color: string }) {
  const scale = interpolate(frame, [0, 3, 6], [4, 1.15, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 2, 14, 20], [0, 1, 1, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "15%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        fontSize: 52,
        fontWeight: 900,
        color,
        textShadow: `0 0 30px ${color}, 0 0 60px ${color}66, 3px 3px 0 #000`,
        letterSpacing: 6,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        zIndex: 80,
      }}
    >
      {text}
    </div>
  );
}
