// Maps gameplay values to visual layer parameters. Placeholder CSS/SVG
// driven now; swap values for PNG asset keys later without touching pages.

export const AURA_COLORS = {
  Fire: "#ff6a3d", Water: "#3da9ff", Ice: "#8fe3ff", Lightning: "#f5e14a",
  Earth: "#a67c3d", Wind: "#c9f0d8", Light: "#fff6c9", Shadow: "#8b5cf6",
  "Cosmic Energy": "#c084fc", Ki: "#e6b84a", Chakra: "#4ade80", Magic: "#f472b6",
  Technology: "#38bdf8", Psychic: "#a78bfa", Nature: "#4d9e5c", Poison: "#7ee081",
  Gravity: "#818cf8", Sound: "#fca5a5", "Spirit Energy": "#93c5fd"
};

export const TYPE_SHAPES = {
  "Hero":      { w: 88, h: 150, r: "44px 44px 18px 18px", tint: "#1c2233", extra: null },
  "Villain":   { w: 88, h: 150, r: "36px 36px 14px 14px", tint: "#241a24", extra: "spikes" },
  "Antihero":  { w: 92, h: 150, r: "40px 40px 16px 16px", tint: "#20222b", extra: "cloak" },
  "Monster":   { w: 110, h: 158, r: "40px 40px 22px 22px", tint: "#26202b", extra: "horns" },
  "Alien":     { w: 84, h: 156, r: "52px 52px 16px 16px", tint: "#182430", extra: "marks" },
  "Cyborg":    { w: 90, h: 150, r: "34px 34px 14px 14px", tint: "#1a2530", extra: "tech" },
  "Sorcerer":  { w: 96, h: 154, r: "46px 46px 30px 30px", tint: "#221a2e", extra: "runes" },
  "Mutant":    { w: 94, h: 152, r: "42px 50px 16px 20px", tint: "#22262a", extra: null },
  "Ninja":     { w: 82, h: 148, r: "40px 40px 14px 14px", tint: "#161a22", extra: "mask" },
  "God-tier (heavily limited)": { w: 90, h: 152, r: "44px 44px 18px 18px", tint: "#262238", extra: "halo" }
};

export const STYLE_GEAR = {
  "Brawler": "fists", "Assassin": "blades", "Tank": "armor", "Defender": "shield",
  "Speedster": "trails", "Mage": "runes", "Sniper": "rifle", "Summoner": "circle",
  "Strategist": "visor", "Tactician": "grid", "Weapon Master": "weapon",
  "Support/Healer": "staff", "Balanced": null
};

export const POWER_FX = {
  "Fire Control": "handflame", "Water Control": "spiral", "Ice Control": "crystals",
  "Lightning Control": "arcs", "Earth Control": "rocks", "Wind Control": "streaks",
  "Super Strength": "bigfists", "Super Speed": "trails", "Flight": "wings",
  "Telekinesis": "floaters", "Gravity Control": "rings", "Healing": "healglow",
  "Regeneration": "greenparticles", "Invisibility": "fade", "Portals": "portal",
  "Shadow Control": "tendrils", "Light Beams": "eyeglow", "Illusions": "duplicates",
  "Psychic Reading": "eye", "Ki Blasts": "sphere", "Chakra Techniques": "chakra",
  "Magic Spells": "spellcircle", "Cosmic Blasts": "cosmicsphere",
  "Technology Arsenal": "drones", "Poison Control": "mist", "Sound Waves": "soundrings",
  "Beast Form": "claws", "Energy Shield": "bubble", "Weapon Mastery": "weaponglow",
  "Martial Arts": "stance"
};

export const ULT_FX = {
  "One Huge Attack": "charge", "Temporary Transformation": "transform",
  "Arena Takeover": "field", "Summon Ally": "summon", "Healing Burst": "healring",
  "Finishing Technique": "fistglow", "Power Overload": "surge",
  "Team Combo Setup": "link", "Energy Explosion": "explode", "Mind Game Trap": "psy"
};
