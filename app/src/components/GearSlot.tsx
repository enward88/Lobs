import { useState } from "react";
import { GearItem, GearSlot as GearSlotType, RARITY_CONFIG, GEAR_SLOTS } from "../lib/gear";

interface Props {
  slot: GearSlotType;
  item?: GearItem;
  creatureFamily?: string;
}

export function GearSlot({ slot, item, creatureFamily }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const slotMeta = GEAR_SLOTS.find((s) => s.slot === slot)!;
  const rarity = item ? RARITY_CONFIG[item.rarity] : null;
  const hasAffinity = item?.familyAffinity && item.familyAffinity === creatureFamily;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Slot box */}
      <div
        className="w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-300 cursor-pointer select-none"
        style={
          item && rarity
            ? {
                border: `1.5px solid ${rarity.color}`,
                backgroundColor: `${rarity.color}${rarity.bgAlpha}`,
                boxShadow: `${rarity.glow}, inset 0 0 12px ${rarity.color}11`,
              }
            : {
                border: "1.5px dashed rgba(100, 116, 139, 0.3)",
                backgroundColor: "rgba(15, 23, 42, 0.3)",
              }
        }
      >
        <span
          className="text-lg leading-none"
          style={{
            color: item && rarity ? rarity.color : "rgba(100, 116, 139, 0.25)",
            filter: item && rarity ? `drop-shadow(0 0 4px ${rarity.color}44)` : "none",
          }}
        >
          {item ? item.icon : slotMeta.icon}
        </span>
      </div>

      {/* Slot label */}
      <div
        className="text-center mt-1"
        style={{ fontSize: "8px", color: item && rarity ? rarity.color : "#475569", letterSpacing: "0.05em" }}
      >
        {slotMeta.label}
      </div>

      {/* Tooltip */}
      {showTooltip && item && rarity && (
        <div
          className="absolute z-50 w-56 rounded-xl p-3 pointer-events-none"
          style={{
            [slotMeta.side === "left" ? "left" : "right"]: "100%",
            top: "50%",
            transform: "translateY(-50%)",
            marginLeft: slotMeta.side === "left" ? "8px" : undefined,
            marginRight: slotMeta.side === "right" ? "8px" : undefined,
            backgroundColor: "rgba(5, 10, 25, 0.95)",
            border: `1px solid ${rarity.color}44`,
            boxShadow: `0 0 20px rgba(0,0,0,0.6), 0 0 8px ${rarity.color}22`,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Item name + rarity */}
          <div className="mb-2">
            <div className="font-semibold text-sm" style={{ color: rarity.color }}>
              {item.name}
            </div>
            <div
              className="text-[9px] uppercase tracking-wider mt-0.5 font-mono"
              style={{ color: `${rarity.color}aa` }}
            >
              {rarity.label} &middot; {slotMeta.label}
            </div>
          </div>

          {/* Stat bonuses */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
            {item.statBonuses.str && (
              <StatBonus label="STR" value={item.statBonuses.str} color="#ff4466" />
            )}
            {item.statBonuses.vit && (
              <StatBonus label="VIT" value={item.statBonuses.vit} color="#00ff88" />
            )}
            {item.statBonuses.spd && (
              <StatBonus label="SPD" value={item.statBonuses.spd} color="#00aaff" />
            )}
            {item.statBonuses.lck && (
              <StatBonus label="LCK" value={item.statBonuses.lck} color="#ffcc00" />
            )}
          </div>

          {/* Description */}
          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            {item.description}
          </p>

          {/* Family affinity */}
          {item.familyAffinity && (
            <div
              className="mt-2 text-[9px] rounded-md px-2 py-1 font-mono"
              style={{
                backgroundColor: hasAffinity ? "rgba(0, 255, 136, 0.1)" : "rgba(100, 116, 139, 0.1)",
                color: hasAffinity ? "#00ff88" : "#64748b",
                border: `1px solid ${hasAffinity ? "rgba(0, 255, 136, 0.2)" : "rgba(100, 116, 139, 0.15)"}`,
              }}
            >
              {hasAffinity ? "\u2713 " : ""}
              {item.familyAffinity} affinity {hasAffinity ? "(+2 all stats)" : ""}
            </div>
          )}
        </div>
      )}

      {/* Empty slot tooltip */}
      {showTooltip && !item && (
        <div
          className="absolute z-50 w-36 rounded-lg p-2 pointer-events-none"
          style={{
            [slotMeta.side === "left" ? "left" : "right"]: "100%",
            top: "50%",
            transform: "translateY(-50%)",
            marginLeft: slotMeta.side === "left" ? "8px" : undefined,
            marginRight: slotMeta.side === "right" ? "8px" : undefined,
            backgroundColor: "rgba(5, 10, 25, 0.9)",
            border: "1px solid rgba(100, 116, 139, 0.2)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="text-[10px] text-slate-500">
            {slotMeta.label} — Empty
          </div>
          <div className="text-[9px] text-slate-600 mt-0.5">
            No gear equipped
          </div>
        </div>
      )}
    </div>
  );
}

function StatBonus({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="text-[10px] font-mono font-semibold" style={{ color }}>
      +{value} <span style={{ color: `${color}88`, fontSize: "8px" }}>{label}</span>
    </span>
  );
}
