import { FAMILY_COLOR, SPECIES_FAMILY } from "../lib/program";

/** Glow color per family */
function familyGlow(species: number): string {
  const family = SPECIES_FAMILY[species] || "Crustacean";
  const hex = FAMILY_COLOR[family] || "#ff4466";
  return hex;
}

/** Simple procedural creature art based on species ID */
const CREATURE_ART: Record<number, string> = {
  // Crustaceans
  0:  `  ,__\n  | \`\\\n__)\\ \`\\\n__  )  }\n  )/  /\n '  /`,
  1:  ` _V  V_\n/ \\  / \\\n(o\\_/o)\n \\__\\_/\n / \\ / \\`,
  2:  ` [====]\n |o  o|\n |[--]|\n  \\  /\n  |__|`,
  3:  `  /\\/\\\n -    -\n(  <>  )\n  \\  /\n  //\\\\`,
  4:  ` .----.\n/ o  o \\\n| [==] |\n \\ ~~ /\n  '=='`,
  // Mollusks
  5:  `  .-.\n /   \\\n| o o |\n \\~~~/ \n  |V|\n /| |\\`,
  6:  `  @@@\n @@@@\n@@@@@\n @@@@\n  @@`,
  7:  ` .--.\n/ ** \\\n|    |\n \\''/\n  \\/`,
  8:  `   @\n  @@\n @@@\n@@@@\n @@@`,
  9:  `  /\\\n / \\\n/ ! \\\n\\   /\n \\/`,
  // Jellyfish
  10: ` .--.\n/ ~~ \\\n\\ ~~ /\n |  |\n || |\n | ||`,
  11: ` .==.\n/+  +\\\n\\ zz /\n ||\n|||`,
  12: ` .  .\n(    )\n \\  /\n  ||\n  ||`,
  13: ` .XX.\n/X  X\\\n\\ XX /\n |  |\n || |`,
  14: ` .oo.\n/ oo \\\n\\ oo /\n  ||\n  ||`,
  // Fish
  15: ` ___\n/o  \\\n|  _|\n\\___|>`,
  16: `  ><>\n ><>>\n><>>>`,
  17: `  ___\n /   \\\n|  O__>\n \\___/`,
  18: ` <>< \n<><<\n<><`,
  19: ` .--.\n/ oo \\\n|====|\n \\--/`,
  // Flora
  20: ` \\|/\n--*--\n /|\\\n/ | \\`,
  21: ` /\\/\\\n\\/\\/\n/\\/\\\n\\/\\/`,
  22: ` (@@)\n(@@@)\n (@@)\n  ||`,
  23: `  ~\n ~~\n~~~\n ~~\n  ~`,
  24: `  o\n oOo\noOOOo\n oOo\n  o`,
  // Abyssal
  25: ` .===.\n| X X |\n| VVV |\n \\   /\n  '-'`,
  26: ` .OO.\n/ oo \\\n| -- |\n \\  /`,
  27: ` ~~~~~\n~~~~~~\n~~~~~`,
  28: ` /|  |\\\n| |oo| |\n \\|  |/\n  \\  /`,
  29: ` /^^\\\n| oo |\n|/\\/\\|\n \\  /\n  \\/`,
};

interface Props {
  species: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function CreatureArt({ species, size = "md", animate = true }: Props) {
  const art = CREATURE_ART[species] || CREATURE_ART[0];
  const glowHex = familyGlow(species);

  const sizeClass = {
    sm: "text-[8px] leading-[10px]",
    md: "text-[10px] leading-[12px]",
    lg: "text-xs leading-[14px]",
  }[size];

  return (
    <div className={`relative ${animate ? "animate-float" : ""}`}>
      <pre
        className={`font-mono ${sizeClass} select-none whitespace-pre`}
        style={{
          color: glowHex,
          textShadow: `0 0 6px ${glowHex}66, 0 0 15px ${glowHex}33`,
          filter: "brightness(1.2)",
        }}
      >
        {art}
      </pre>
    </div>
  );
}

/** Inline colored dot for compact views */
export function CreatureDot({ species }: { species: number }) {
  const hex = familyGlow(species);
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{
        backgroundColor: hex,
        boxShadow: `0 0 6px ${hex}66`,
      }}
    />
  );
}
