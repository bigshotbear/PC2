// Fixed Story Mode bosses. Same boss at the same level every run.
// difficultyMult expresses the spec's approximate 80-160% baseline
// difficulty curve relative to a freshly created fighter.

import { ARC2_BOSSES } from "./storyBossesArc2";

const ARC1_BOSSES = [
  {
    key: "stoneclaw",
    level: 1,
    name: "Stoneclaw",
    theme: "Earth · Stone armor · Defensive bruiser",
    power_source: "Earth",
    fighting_style: "Tank",
    character_type: "Monster",
    intro: "A hulking figure of living rock steps into the arena, arms folded, unbothered.",
    signature_move: "Ground Slam",
    tell: "Cracks spread across the floor beneath Stoneclaw before Ground Slam lands.",
    phase2_health_pct: 40,
    phase2_behavior: "Its armor shatters — Defense drops, but Attack rises sharply and it turns far more aggressive.",
    difficultyMult: 0.80,
    stats: { strength: 30, speed: 10, durability: 35, battle_iq: 10, stamina: 15 },
    abilities: [
      { key: "stone_armor", name: "Stone Armor", type: "defense", desc: "Hardens the skin, reducing incoming burst damage.", visual: "rock_shoulders" },
      { key: "ground_slam", name: "Ground Slam", type: "attack", desc: "A heavy ground-shaking strike with high raw impact.", visual: "impact_cracks" },
      { key: "unbreakable_stance", name: "Unbreakable Stance", type: "passive", desc: "Reduces stagger from incoming hits.", visual: "stone_stance" }
    ],
    primaryReward: "stone_armor",
    helpsAgainst: "ember_fang",
    hints: {
      0: "Stoneclaw wears its strength plainly — this will be a test of raw power and patience.",
      1: "Ground Slam begins the moment cracks spread across the floor. Blocking or spacing helps.",
      3: "Recommended counter: keep Durability high. Stoneclaw's armor breaks below 40% health — press the attack then."
    },
    dialogue: {
      lowSpeed: "You saw the slam coming. Your feet simply weren't fast enough to matter.",
      lowDurability: "Stone does not negotiate with soft things.",
      hadCounter: "You braced well. Bracing is not the same as winning.",
      manyLosses: "You return again. Good. The mountain does not move — but you might, eventually.",
      barelySurvived: "Close. Another slam and this would have ended differently for you, not me."
    }
  },
  {
    key: "ember_fang",
    level: 2,
    name: "Ember Fang",
    theme: "Fire · Aggression · Burst damage",
    power_source: "Fire",
    fighting_style: "Brawler",
    character_type: "Villain",
    intro: "Ember Fang prowls the arena's edge, flames licking off its shoulders, eager to close distance.",
    signature_move: "Inferno Rush",
    tell: "Ember Fang's flames flare brighter right before Inferno Rush.",
    phase2_health_pct: 40,
    phase2_behavior: "Fire damage increases and Ember Fang starts taking small self-damage from its own recklessness — but hits far harder.",
    difficultyMult: 0.90,
    stats: { strength: 28, speed: 22, durability: 15, battle_iq: 10, stamina: 25 },
    abilities: [
      { key: "flame_dash", name: "Flame Dash", type: "mobility", desc: "A burst of speed wrapped in fire, closing distance instantly.", visual: "fire_feet" },
      { key: "burning_counter", name: "Burning Counter", type: "counter", desc: "Punishes a blocked hit with a retaliatory burn.", visual: "ember_hands" },
      { key: "inferno_rush", name: "Inferno Rush", type: "attack", desc: "A relentless flurry of flame-charged strikes.", visual: "fire_trail" }
    ],
    primaryReward: "flame_dash",
    helpsAgainst: "gale_hunter",
    hints: {
      0: "Ember Fang commits completely when the flames reach their brightest.",
      1: "Inferno Rush begins when Ember Fang's aura flashes. Defensive armor can absorb part of the impact.",
      3: "Recommended counter: Stone Armor. Ember Fang has high attack but reduced durability during the final phase."
    },
    dialogue: {
      lowSpeed: "You stood still. Fire does not reward stillness.",
      lowDurability: "Your guard melted before I even reached you.",
      hadCounter: "Stone again? Clever. It won't save you from everything.",
      manyLosses: "Still smoldering from last time? Come closer.",
      barelySurvived: "You almost put me out. Almost."
    }
  },
  {
    key: "gale_hunter",
    level: 3,
    name: "Gale Hunter",
    theme: "Wind · Speed · Ranged pressure",
    power_source: "Wind",
    fighting_style: "Sniper",
    character_type: "Ninja",
    intro: "A cloaked marksman rides the wind at the far end of the arena, already lining up a shot.",
    signature_move: "Cyclone Barrage",
    tell: "Wind gathers visibly behind Gale Hunter before it retreats or unleashes the barrage.",
    phase2_health_pct: 40,
    phase2_behavior: "Gale Hunter creates afterimages, dodges far more often, and fires rapid ranged attacks.",
    difficultyMult: 1.05,
    stats: { strength: 15, speed: 32, durability: 15, battle_iq: 18, stamina: 20 },
    abilities: [
      { key: "cyclone_step", name: "Cyclone Step", type: "mobility", desc: "Closes distance against evasive or ranged opponents.", visual: "wind_rings" },
      { key: "wind_blade", name: "Wind Blade", type: "attack", desc: "A cutting ranged strike carried on wind currents.", visual: "wind_slash" },
      { key: "air_dash", name: "Air Dash", type: "mobility", desc: "A short evasive burst.", visual: "air_trail" }
    ],
    primaryReward: "cyclone_step",
    helpsAgainst: "iron_oracle",
    hints: {
      0: "Gale Hunter never lets an opponent get close — distance is its whole strategy.",
      1: "Cyclone Barrage is preceded by wind gathering at Gale Hunter's back. Closing distance early disrupts it.",
      3: "Recommended counter: Flame Dash. Gale Hunter's evasive phase-two afterimages are hard to punish without a gap-closer."
    },
    dialogue: {
      lowSpeed: "You chased the wind. The wind does not wait.",
      lowDurability: "A dozen small cuts add up faster than one big one.",
      hadCounter: "Flame at your feet — smart. It almost closed the gap in time.",
      manyLosses: "Still hunting me on foot? Adorable.",
      barelySurvived: "One more arrow. Just one. Remember that."
    }
  },
  {
    key: "iron_oracle",
    level: 4,
    name: "Iron Oracle",
    theme: "Technology · Shields · Predictive counters",
    power_source: "Technology",
    fighting_style: "Strategist",
    character_type: "Cyborg",
    intro: "Iron Oracle's chassis hums with quiet calculation, already reading your stance.",
    signature_move: "Reflective Shield",
    tell: "Iron Oracle's shield flashes an instant before reflecting your next attack.",
    phase2_health_pct: 40,
    phase2_behavior: "Its shield breaks and it activates Overclock — Defense drops but Speed and aggression spike sharply.",
    difficultyMult: 1.15,
    stats: { strength: 18, speed: 20, durability: 22, battle_iq: 30, stamina: 10 },
    abilities: [
      { key: "aegis_protocol", name: "Aegis Protocol", type: "defense", desc: "A protective field that resists targeting locks and reflected attacks.", visual: "floating_shields" },
      { key: "target_scan", name: "Target Scan", type: "passive", desc: "Reveals patterns in an opponent's attack habits.", visual: "scan_lines" },
      { key: "overclock", name: "Overclock", type: "buff", desc: "A temporary surge of speed and aggression.", visual: "tech_glow" }
    ],
    primaryReward: "aegis_protocol",
    helpsAgainst: "grave_warden",
    hints: {
      0: "Iron Oracle studies before it strikes — repetition is your enemy here.",
      1: "It counters your most-used attack type. Reflective Shield flashes right before punishing a repeated pattern.",
      3: "Recommended counter: Cyclone Step. Iron Oracle's Overclock phase is faster but far less defended."
    },
    dialogue: {
      lowSpeed: "Predictable, and slow. An unfortunate combination.",
      lowDurability: "Your pattern was clear. Your defense was not.",
      hadCounter: "Aegis Protocol. You read the manual. Good.",
      manyLosses: "Recalculating your habits. You have new ones now — barely.",
      barelySurvived: "Overclock nearly failed me. Noted for next time."
    }
  },
  {
    key: "grave_warden",
    level: 5,
    name: "Grave Warden",
    theme: "Shadow · Curses · Draining attacks",
    power_source: "Shadow",
    fighting_style: "Assassin",
    character_type: "Antihero",
    intro: "Grave Warden emerges from a pool of shadow, a curse already forming in its palm.",
    signature_move: "Soul Drain",
    tell: "A shadow mark appears on your fighter's chest just before Soul Drain activates.",
    phase2_health_pct: 40,
    phase2_behavior: "Grave Warden splits off a shadow duplicate, applies stronger curses, and heals from successful drains.",
    difficultyMult: 1.25,
    stats: { strength: 20, speed: 24, durability: 18, battle_iq: 22, stamina: 16 },
    abilities: [
      { key: "soul_anchor", name: "Soul Anchor", type: "defense", desc: "Resists curse buildup and can block one major curse per fight.", visual: "shadow_symbol" },
      { key: "shadow_step", name: "Shadow Step", type: "mobility", desc: "A brief shadow-melt that avoids one incoming attack.", visual: "shadow_fade" },
      { key: "life_drain", name: "Life Drain", type: "attack", desc: "Converts damage dealt into healing.", visual: "dark_hands" }
    ],
    primaryReward: "soul_anchor",
    helpsAgainst: "storm_herald",
    hints: {
      0: "Grave Warden thrives on drawn-out fights — the longer it lasts, the stronger the curse.",
      1: "Watch for the shadow mark on your own fighter — Soul Drain follows almost immediately.",
      3: "Recommended counter: Aegis Protocol reduces curse buildup. Grave Warden's duplicate shares its health pool below 40%."
    },
    dialogue: {
      lowSpeed: "The mark found you easily. You never had a chance to run.",
      lowDurability: "I took more from you than you had to give.",
      hadCounter: "Aegis again. The curse found less to hold onto this time.",
      manyLosses: "Your shadow grows longer each time you fall to me.",
      barelySurvived: "My duplicate nearly didn't reform in time. Nearly."
    }
  },
  {
    key: "storm_herald",
    level: 6,
    name: "Storm Herald",
    theme: "Lightning · Stuns · Arena control",
    power_source: "Lightning",
    fighting_style: "Speedster",
    character_type: "God-tier (heavily limited)",
    intro: "The sky over the arena churns as Storm Herald descends on a column of lightning.",
    signature_move: "Heaven Strike",
    tell: "Electricity visibly travels across the battlefield before Heaven Strike lands.",
    phase2_health_pct: 40,
    phase2_behavior: "The arena becomes electrified — attacks speed up, area effects multiply, and stuns last longer.",
    difficultyMult: 1.40,
    stats: { strength: 24, speed: 34, durability: 16, battle_iq: 20, stamina: 16 },
    abilities: [
      { key: "lightning_counter", name: "Lightning Counter", type: "counter", desc: "Interrupts or weakens a major incoming attack.", visual: "arc_hands" },
      { key: "thunder_step", name: "Thunder Step", type: "mobility", desc: "An instant repositioning burst.", visual: "thunder_trail" },
      { key: "storm_field", name: "Storm Field", type: "area", desc: "An electrified zone that punishes standing still.", visual: "storm_ring" }
    ],
    primaryReward: "lightning_counter",
    helpsAgainst: "void_king",
    hints: {
      0: "Storm Herald controls the whole arena, not just its own reach.",
      1: "Heaven Strike telegraphs across the entire battlefield in traveling arcs of light.",
      3: "Recommended counter: Soul Anchor reduces stun duration. Storm Herald's electrified arena is most dangerous in the final phase."
    },
    dialogue: {
      lowSpeed: "Lightning does not wait for slow answers.",
      lowDurability: "The storm doesn't care how much you can take. It takes anyway.",
      hadCounter: "You reached for the counter. Barely in time.",
      manyLosses: "Still standing in the rain? Admirable. Foolish.",
      barelySurvived: "Heaven Strike nearly finished there. Remember the arc."
    }
  },
  {
    key: "void_king",
    level: 7,
    name: "The Void King",
    theme: "Void energy · Space distortion · Final test",
    power_source: "Cosmic Energy",
    fighting_style: "Balanced",
    character_type: "God-tier (heavily limited)",
    intro: "Space itself folds inward as the Void King steps through, wearing echoes of every fighter it has ever ended.",
    signature_move: "Oblivion's Edge",
    tell: "Reality thins to a purple-black haze around the Void King before Oblivion's Edge.",
    phase2_health_pct: 60,
    phase3_health_pct: 25,
    phase2_behavior: "Its active weakness shifts and space distortion disrupts equipped abilities.",
    phase3_behavior: "Most hints vanish. Oblivion's Edge becomes a full-arena ultimate that tests your complete build.",
    difficultyMult: 1.60,
    stats: { strength: 24, speed: 24, durability: 22, battle_iq: 26, stamina: 20 },
    abilities: [
      { key: "void_collapse", name: "Void Collapse", type: "ultimate", desc: "A devastating full-arena finisher.", visual: "void_distortion" },
      { key: "echo_step", name: "Echo Step", type: "mobility", desc: "Splits attention across duplicated afterimages.", visual: "void_echo" },
      { key: "null_field", name: "Null Field", type: "debuff", desc: "Temporarily disrupts one equipped ability.", visual: "void_ring" }
    ],
    primaryReward: "void_collapse",
    helpsAgainst: "the_puddle_problem",
    hints: {
      0: "The Void King has studied every fighter who ever stood here. It will not be predictable.",
      1: "Oblivion's Edge is preceded by reality itself thinning to haze. There is no safe distance from it.",
      3: "Recommended counter: Lightning Counter can interrupt Oblivion's Edge. No single stat wins this fight — bring your whole build."
    },
    dialogue: {
      lowSpeed: "Even light is slower than the void.",
      lowDurability: "You brought a fraction of what this requires.",
      hadCounter: "Lightning in the void. Fitting. Not enough.",
      manyLosses: "Every version of you that fell here remains. You are not the first. You will not be the last — yet.",
      barelySurvived: "The void nearly closed around you completely. Nearly is not victory, but it is not nothing."
    }
  }
];

export const STORY_BOSSES = [...ARC1_BOSSES, ...ARC2_BOSSES];
export const TOTAL_STORY_LEVELS = STORY_BOSSES.length;

export function getBossByLevel(level) {
  return STORY_BOSSES.find((b) => b.level === level) || null;
}

export function getBossByKey(key) {
  return STORY_BOSSES.find((b) => b.key === key) || null;
}

export const ALL_STORY_ABILITIES = STORY_BOSSES.flatMap((b) =>
  b.abilities.map((a) => ({ ...a, source_boss: b.key, source_boss_name: b.name }))
);

export function getAbilityByKey(key) {
  return ALL_STORY_ABILITIES.find((a) => a.key === key) || null;
}
