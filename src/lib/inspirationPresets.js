// Original Inspiration Archetypes. Names, abilities, and visuals are
// entirely original — the "reference" field is just a playstyle pointer
// shown to the player, never a copied name/costume/likeness.

export const INSPIRATION_CATEGORIES = ["Anime-Inspired", "Marvel-Inspired", "DC-Inspired"];

export const INSPIRATION_PRESETS = [
  // ---------------- Anime-Inspired ----------------
  {
    key: "celestial_martial_artist", category: "Anime-Inspired", name: "Celestial Martial Artist",
    reference: "Balanced energy brawler", difficulty: "Beginner friendly",
    playstyle: "A balanced energy brawler who becomes more dangerous during extended battles.",
    concern: "Can fall behind against fast, evasive opponents early on.",
    stats: { strength: 30, speed: 25, durability: 15, battle_iq: 10, stamina: 20 },
    build: { character_type: "Alien", fighting_style: "Brawler", power_source: "Ki", main_power: "Ki Blasts", secondary_power: "Flight", special_skill: "Martial Arts", ultimate_move: "Temporary Transformation", weakness: "Overconfident" }
  },
  {
    key: "shadow_clone_ninja", category: "Anime-Inspired", name: "Shadow Clone Ninja",
    reference: "Fast, unpredictable trickster", difficulty: "Intermediate",
    playstyle: "A fast and unpredictable fighter who uses copies, tricks, and stamina to wear opponents down.",
    concern: "Runs out of steam if the fight drags on without landing a finisher.",
    stats: { strength: 15, speed: 30, durability: 15, battle_iq: 20, stamina: 20 },
    build: { character_type: "Ninja", fighting_style: "Assassin", power_source: "Wind", main_power: "Illusions", secondary_power: "Wind Control", special_skill: "Stealth", ultimate_move: "Summon Ally", weakness: "Ultimate Drains Body" }
  },
  {
    key: "elastic_freedom_brawler", category: "Anime-Inspired", name: "Elastic Freedom Brawler",
    reference: "Durable, creative close-range fighter", difficulty: "Beginner friendly",
    playstyle: "A durable close-range fighter with reach, creativity, and relentless pressure.",
    concern: "Predictable at low Battle IQ against a patient, defensive opponent.",
    stats: { strength: 28, speed: 15, durability: 27, battle_iq: 10, stamina: 20 },
    build: { character_type: "Hero", fighting_style: "Brawler", power_source: "Nature", main_power: "Super Strength", secondary_power: "Martial Arts", special_skill: "Pain Tolerance", ultimate_move: "One Huge Attack", weakness: "Can Be Overwhelmed" }
  },
  {
    key: "shadow_legion_commander", category: "Anime-Inspired", name: "Shadow Legion Commander",
    reference: "Fast controller who commands allies", difficulty: "Intermediate",
    playstyle: "A fast shadow fighter who summons allies and controls the pace of the battlefield.",
    concern: "Vulnerable to Light-based counters and burst pressure before summons arrive.",
    stats: { strength: 18, speed: 27, durability: 15, battle_iq: 20, stamina: 20 },
    build: { character_type: "Sorcerer", fighting_style: "Summoner", power_source: "Shadow", main_power: "Shadow Control", secondary_power: "Portals", special_skill: "Leadership", ultimate_move: "Summon Ally", weakness: "Weak to Light" }
  },
  {
    key: "spirit_blade_reaper", category: "Anime-Inspired", name: "Spirit Blade Reaper",
    reference: "High-impact weapon fighter", difficulty: "Intermediate",
    playstyle: "A high-impact weapon fighter combining spiritual energy with burst damage.",
    concern: "Needs setup time — weaker before reaching full power.",
    stats: { strength: 26, speed: 22, durability: 15, battle_iq: 17, stamina: 20 },
    build: { character_type: "Hero", fighting_style: "Weapon Master", power_source: "Spirit Energy", main_power: "Weapon Mastery", secondary_power: "Energy Shield", special_skill: "Swordsmanship", ultimate_move: "Temporary Transformation", weakness: "Power Cooldown" }
  },
  {
    key: "infinity_space_sorcerer", category: "Anime-Inspired", name: "Infinity Space Sorcerer",
    reference: "Tactical spatial controller", difficulty: "Advanced",
    playstyle: "A tactical controller who manipulates distance, space, defense, and positioning.",
    concern: "Complex to pilot — weak if you don't actively manage positioning.",
    stats: { strength: 10, speed: 25, durability: 15, battle_iq: 30, stamina: 20 },
    build: { character_type: "Sorcerer", fighting_style: "Strategist", power_source: "Gravity", main_power: "Gravity Control", secondary_power: "Portals", special_skill: "Genius IQ", ultimate_move: "Arena Takeover", weakness: "Needs Focus" }
  },
  {
    key: "inherited_power_hero", category: "Anime-Inspired", name: "Inherited Power Hero",
    reference: "Explosive glass-cannon striker", difficulty: "Intermediate",
    playstyle: "An explosive physical fighter who trades safety for tremendous output.",
    concern: "Fragile — big damage windows come with real risk to yourself.",
    stats: { strength: 32, speed: 25, durability: 8, battle_iq: 15, stamina: 20 },
    build: { character_type: "Hero", fighting_style: "Brawler", power_source: "Ki", main_power: "Super Strength", secondary_power: "Super Speed", special_skill: "Trap Maker", ultimate_move: "Power Overload", weakness: "Ultimate Drains Body" }
  },

  // ---------------- Marvel-Inspired ----------------
  {
    key: "web_acrobat", category: "Marvel-Inspired", name: "Web Acrobat",
    reference: "Fast evasive controller", difficulty: "Beginner friendly",
    playstyle: "A fast, evasive controller who uses mobility, traps, and quick reactions.",
    concern: "Lower raw power — relies on outmaneuvering rather than trading hits.",
    stats: { strength: 15, speed: 30, durability: 15, battle_iq: 20, stamina: 20 },
    build: { character_type: "Hero", fighting_style: "Assassin", power_source: "Technology", main_power: "Super Speed", secondary_power: "Portals", special_skill: "Trap Maker", ultimate_move: "Mind Game Trap", weakness: "Can Be Overwhelmed" }
  },
  {
    key: "tech_armor_blaster", category: "Marvel-Inspired", name: "Tech Armor Blaster",
    reference: "Ranged technology fighter", difficulty: "Intermediate",
    playstyle: "A ranged technology fighter combining armor, flight, weapons, and utility.",
    concern: "Struggles against powers that specifically counter Technology.",
    stats: { strength: 18, speed: 20, durability: 24, battle_iq: 23, stamina: 15 },
    build: { character_type: "Cyborg", fighting_style: "Sniper", power_source: "Technology", main_power: "Technology Arsenal", secondary_power: "Flight", special_skill: "Tech Expert", ultimate_move: "Power Overload", weakness: "Weak to Sound" }
  },
  {
    key: "gamma_titan", category: "Marvel-Inspired", name: "Gamma Titan",
    reference: "Rage-fueled tank", difficulty: "Beginner friendly",
    playstyle: "An extremely powerful tank who becomes more dangerous under pressure.",
    concern: "Low Battle IQ makes it easy to bait into bad exchanges.",
    stats: { strength: 33, speed: 10, durability: 32, battle_iq: 5, stamina: 20 },
    build: { character_type: "Monster", fighting_style: "Tank", power_source: "Earth", main_power: "Super Strength", secondary_power: "Beast Form", special_skill: "Pain Tolerance", ultimate_move: "Power Overload", weakness: "Emotional Control Issues" }
  },
  {
    key: "storm_hammer_guardian", category: "Marvel-Inspired", name: "Storm Hammer Guardian",
    reference: "Heavy weapon bruiser", difficulty: "Intermediate",
    playstyle: "A heavy weapon bruiser using lightning, flight, and area damage.",
    concern: "Countered hard by Earth-based defensive fighters.",
    stats: { strength: 27, speed: 18, durability: 25, battle_iq: 10, stamina: 20 },
    build: { character_type: "God-tier (heavily limited)", fighting_style: "Weapon Master", power_source: "Lightning", main_power: "Lightning Control", secondary_power: "Flight", special_skill: "Swordsmanship", ultimate_move: "Energy Explosion", weakness: "Overconfident" }
  },
  {
    key: "mystic_portal_master", category: "Marvel-Inspired", name: "Mystic Portal Master",
    reference: "High-IQ magic controller", difficulty: "Advanced",
    playstyle: "A high-IQ magic controller using portals, barriers, and counters.",
    concern: "Low physical stats — punished hard if closed down quickly.",
    stats: { strength: 8, speed: 22, durability: 15, battle_iq: 35, stamina: 20 },
    build: { character_type: "Sorcerer", fighting_style: "Strategist", power_source: "Magic", main_power: "Magic Spells", secondary_power: "Portals", special_skill: "Genius IQ", ultimate_move: "Mind Game Trap", weakness: "Needs Focus" }
  },
  {
    key: "regenerating_claw_berserker", category: "Marvel-Inspired", name: "Regenerating Claw Berserker",
    reference: "Relentless recovery fighter", difficulty: "Intermediate",
    playstyle: "A relentless close-range fighter with recovery and sustained pressure.",
    concern: "Recovery isn't instant — burst damage can still overwhelm it.",
    stats: { strength: 28, speed: 20, durability: 22, battle_iq: 10, stamina: 20 },
    build: { character_type: "Mutant", fighting_style: "Brawler", power_source: "Nature", main_power: "Regeneration", secondary_power: "Martial Arts", special_skill: "Pain Tolerance", ultimate_move: "Finishing Technique", weakness: "Weak to Sound" }
  },
  {
    key: "kinetic_panther_tactician", category: "Marvel-Inspired", name: "Kinetic Panther Tactician",
    reference: "Fast precision tactician", difficulty: "Intermediate",
    playstyle: "A fast tactical fighter using advanced armor, precision, and stored energy.",
    concern: "Needs good decision-making — punished for reckless play.",
    stats: { strength: 20, speed: 27, durability: 23, battle_iq: 20, stamina: 10 },
    build: { character_type: "Hero", fighting_style: "Tactician", power_source: "Technology", main_power: "Technology Arsenal", secondary_power: "Super Speed", special_skill: "Tech Expert", ultimate_move: "Team Combo Setup", weakness: "Low Stamina" }
  },

  // ---------------- DC-Inspired ----------------
  {
    key: "solar_paragon", category: "DC-Inspired", name: "Solar Paragon",
    reference: "Elite all-around powerhouse", difficulty: "Beginner friendly",
    playstyle: "An elite all-around powerhouse with flight, durability, speed, and energy attacks.",
    concern: "No glaring weakness, but no standout edge either — countered by focused specialists.",
    stats: { strength: 24, speed: 22, durability: 24, battle_iq: 10, stamina: 20 },
    build: { character_type: "Hero", fighting_style: "Balanced", power_source: "Light", main_power: "Light Beams", secondary_power: "Flight", special_skill: "None", ultimate_move: "Energy Explosion", weakness: "Weak to Sound" }
  },
  {
    key: "night_detective", category: "DC-Inspired", name: "Night Detective",
    reference: "High-IQ prep strategist", difficulty: "Intermediate",
    playstyle: "A high-IQ strategist using gadgets, traps, counters, and preparation.",
    concern: "Weak raw stats if the fight goes off-script.",
    stats: { strength: 15, speed: 22, durability: 18, battle_iq: 25, stamina: 20 },
    build: { character_type: "Antihero", fighting_style: "Strategist", power_source: "Technology", main_power: "Technology Arsenal", secondary_power: "Invisibility", special_skill: "Trap Maker", ultimate_move: "Mind Game Trap", weakness: "Needs Focus" }
  },
  {
    key: "lightning_speedster", category: "DC-Inspired", name: "Lightning Speedster",
    reference: "Extreme-initiative speedster", difficulty: "Intermediate",
    playstyle: "An extreme-speed fighter who wins through initiative and repeated attacks.",
    concern: "Low Durability — a single big hit can swing the fight.",
    stats: { strength: 12, speed: 35, durability: 13, battle_iq: 20, stamina: 20 },
    build: { character_type: "Hero", fighting_style: "Speedster", power_source: "Lightning", main_power: "Super Speed", secondary_power: "Lightning Control", special_skill: "None", ultimate_move: "One Huge Attack", weakness: "Weak Defense" }
  },
  {
    key: "amazon_warrior", category: "DC-Inspired", name: "Amazon Warrior",
    reference: "Balanced weapon master", difficulty: "Beginner friendly",
    playstyle: "A balanced weapon master combining strength, defense, and combat skill.",
    concern: "No single dominant stat to lean on in a stat-check matchup.",
    stats: { strength: 25, speed: 15, durability: 25, battle_iq: 15, stamina: 20 },
    build: { character_type: "Hero", fighting_style: "Weapon Master", power_source: "Light", main_power: "Weapon Mastery", secondary_power: "Energy Shield", special_skill: "Swordsmanship", ultimate_move: "Finishing Technique", weakness: "Overconfident" }
  },
  {
    key: "emerald_construct_wielder", category: "DC-Inspired", name: "Emerald Construct Wielder",
    reference: "Creative ranged controller", difficulty: "Intermediate",
    playstyle: "A creative ranged fighter forming weapons, shields, and battlefield tools on demand.",
    concern: "Depends entirely on willpower/focus stat — punished when disrupted.",
    stats: { strength: 12, speed: 18, durability: 20, battle_iq: 30, stamina: 20 },
    build: { character_type: "Hero", fighting_style: "Sniper", power_source: "Cosmic Energy", main_power: "Energy Shield", secondary_power: "Telekinesis", special_skill: "Genius IQ", ultimate_move: "Arena Takeover", weakness: "Needs Focus" }
  },
  {
    key: "ocean_king", category: "DC-Inspired", name: "Ocean King",
    reference: "Durable command bruiser", difficulty: "Beginner friendly",
    playstyle: "A durable bruiser using water, strength, command presence, and a powerful weapon.",
    concern: "Loses some effectiveness far from water-themed arenas.",
    stats: { strength: 27, speed: 15, durability: 28, battle_iq: 10, stamina: 20 },
    build: { character_type: "Hero", fighting_style: "Weapon Master", power_source: "Water", main_power: "Water Control", secondary_power: "Weapon Mastery", special_skill: "Leadership", ultimate_move: "One Huge Attack", weakness: "Weak to Water" }
  },
  {
    key: "dark_soul_empath", category: "DC-Inspired", name: "Dark Soul Empath",
    reference: "Shadow and magic controller", difficulty: "Advanced",
    playstyle: "A shadow and magic controller using barriers, telekinesis, and disruption.",
    concern: "Fragile and reliant on controlling the pace — bad matchup vs. aggressive rushdown.",
    stats: { strength: 10, speed: 20, durability: 15, battle_iq: 35, stamina: 20 },
    build: { character_type: "Antihero", fighting_style: "Strategist", power_source: "Shadow", main_power: "Shadow Control", secondary_power: "Telekinesis", special_skill: "Genius IQ", ultimate_move: "Mind Game Trap", weakness: "Weak to Light" }
  }
];

export function getPresetByKey(key) {
  return INSPIRATION_PRESETS.find((p) => p.key === key) || null;
}
