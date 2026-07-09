// Chapter 5: "The Deep" — an oceanic abyss zone. Original characters only,
// continuing the escalation from Arc 4.

export const ARC5_BOSSES = [
  {
    key: "the_tide_warden", level: 38, chapter: 5, name: "The Tide Warden",
    theme: "Guards the entrance to the Deep, and has never once let anyone pass easily",
    power_source: "Water", fighting_style: "Tank", character_type: "Monster",
    intro: "A towering figure of coral and current blocks the descent, entirely unmoved by anything above the surface.",
    signature_move: "Crushing Tide",
    tell: "The water around him pulls inward visibly before Crushing Tide.",
    phase2_health_pct: 40,
    phase2_behavior: "The current itself intensifies — harder to move, harder to breathe, harder to think.",
    difficultyMult: 5.85,
    stats: { strength: 32, speed: 14, durability: 40, battle_iq: 12, stamina: 24 },
    abilities: [
      { key: "crushing_tide", name: "Crushing Tide", type: "attack", desc: "The full weight of the ocean, briefly focused into a strike.", visual: "impact_cracks" },
      { key: "tidal_guard", name: "Tidal Guard", type: "defense", desc: "Nearly impossible to move through directly.", visual: "stone_stance" },
      { key: "current_control", name: "Current Control", type: "area", desc: "Slows anything that isn't him.", visual: "storm_ring" }
    ],
    primaryReward: "tidal_guard",
    helpsAgainst: "bioluminescent_betty",
    hints: {
      0: "He has never once let anything pass this gate easily. You won't be the exception.",
      1: "Water visibly pulls inward before Crushing Tide lands.",
      3: "Recommended counter: keep Durability high — brute-forcing past him rewards raw toughness."
    },
    dialogue: {
      lowSpeed: "The current decides how fast you move down here. Not you.",
      lowDurability: "The Deep doesn't care how much you can take. It takes anyway.",
      hadCounter: "You braced against the tide properly. Few do.",
      manyLosses: "The gate remains. So do you, apparently, trying.",
      barelySurvived: "The tide nearly finished it. The Deep noticed how close."
    }
  },
  {
    key: "bioluminescent_betty", level: 39, chapter: 5, name: "Bioluminescent Betty",
    theme: "The light means safety. It has never once meant safety.",
    power_source: "Light", fighting_style: "Assassin", character_type: "Monster",
    intro: "A soft, inviting glow drifts closer through the dark water, entirely too calm for what's underneath it.",
    signature_move: "Lure and Strike",
    tell: "Her glow brightens invitingly right before Lure and Strike.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops luring and starts hunting directly — the glow becomes a warning, not a trap.",
    difficultyMult: 6.00,
    stats: { strength: 20, speed: 32, durability: 16, battle_iq: 22, stamina: 20 },
    abilities: [
      { key: "lure_and_strike", name: "Lure and Strike", type: "attack", desc: "An inviting glow followed by a precise, sudden strike.", visual: "shadow_fade" },
      { key: "false_safety", name: "False Safety", type: "debuff", desc: "Makes danger look like the safest place to be.", visual: "psychic_glow" },
      { key: "deep_camouflage", name: "Deep Camouflage", type: "passive", desc: "Nearly invisible until it's too late.", visual: "shadow_symbol" }
    ],
    primaryReward: "false_safety",
    helpsAgainst: "the_pressure_cooker",
    hints: {
      0: "The glow looks like safety. Down here, it almost never is.",
      1: "Her glow brightens noticeably right before Lure and Strike.",
      3: "Recommended counter: The Tide Warden's guarded patience resists the lure entirely."
    },
    dialogue: {
      lowSpeed: "You followed the light right into range. Every time.",
      lowDurability: "The glow promised nothing. You assumed the rest yourself.",
      hadCounter: "You didn't follow the light. Unusual, down here.",
      manyLosses: "Drawn back to the glow again. It's almost sweet, really.",
      barelySurvived: "The strike nearly landed clean. The dark helped you, this time."
    }
  },
  {
    key: "the_pressure_cooker", level: 40, chapter: 5, name: "The Pressure Cooker",
    theme: "Built for depths that would crush anything else instantly",
    power_source: "Water", fighting_style: "Tank", character_type: "Monster",
    intro: "Something built for crushing depth surfaces slowly, entirely unbothered by pressure that would flatten most fighters.",
    signature_move: "Depth Charge",
    tell: "Its body visibly compresses right before Depth Charge releases.",
    phase2_health_pct: 40,
    phase2_behavior: "Releases stored pressure continuously instead of in single bursts — sustained, relentless.",
    difficultyMult: 6.15,
    stats: { strength: 30, speed: 12, durability: 36, battle_iq: 14, stamina: 28 },
    abilities: [
      { key: "depth_charge", name: "Depth Charge", type: "attack", desc: "Stored pressure released all at once.", visual: "impact_cracks" },
      { key: "crush_resistant", name: "Crush-Resistant", type: "defense", desc: "Built to survive forces that break everything else.", visual: "stone_stance" },
      { key: "pressure_buildup", name: "Pressure Buildup", type: "buff", desc: "Gets more dangerous the longer the fight runs.", visual: "storm_ring" }
    ],
    primaryReward: "crush_resistant",
    helpsAgainst: "captain_undertow",
    hints: {
      0: "It was built for depths that would crush you instantly. This fight is its home turf.",
      1: "Its whole body visibly compresses before Depth Charge releases.",
      3: "Recommended counter: end the fight fast — Pressure Buildup rewards patience it doesn't deserve."
    },
    dialogue: {
      lowSpeed: "Pressure doesn't rush. Neither did I, and it still worked.",
      lowDurability: "You weren't built for these depths. That became obvious quickly.",
      hadCounter: "You ended it before the pressure built fully. Smart.",
      manyLosses: "The depths remain unchanged. So does the outcome, so far.",
      barelySurvived: "Nearly ruptured completely there. Nearly."
    }
  },
  {
    key: "captain_undertow", level: 41, chapter: 5, name: "Captain Undertow",
    theme: "Went down with a ship that doesn't exist anymore",
    power_source: "Water", fighting_style: "Strategist", character_type: "Antihero",
    intro: "A translucent, waterlogged figure salutes mockingly, still wearing the uniform of a ship long gone.",
    signature_move: "Maelstrom Command",
    tell: "The water begins spiraling visibly before Maelstrom Command.",
    phase2_health_pct: 40,
    phase2_behavior: "Multiple whirlpools open at once — much harder to find safe footing anywhere.",
    difficultyMult: 6.30,
    stats: { strength: 18, speed: 22, durability: 22, battle_iq: 30, stamina: 22 },
    abilities: [
      { key: "maelstrom_command", name: "Maelstrom Command", type: "area", desc: "Commands the water itself into a battlefield-controlling whirlpool.", visual: "storm_ring" },
      { key: "ghostly_authority", name: "Ghostly Authority", type: "passive", desc: "Still commands as if the crew were real.", visual: "shadow_symbol" },
      { key: "sunken_tactics", name: "Sunken Tactics", type: "counter", desc: "Decades of naval strategy, still sharp.", visual: "scan_lines" }
    ],
    primaryReward: "maelstrom_command",
    helpsAgainst: "the_krakens_apprentice",
    hints: {
      0: "He commands the water like he still has a crew to give orders to.",
      1: "Visible spiraling water is the tell for Maelstrom Command.",
      3: "Recommended counter: The Pressure Cooker's raw Durability shrugs off the whirlpool's worst."
    },
    dialogue: {
      lowSpeed: "The current took my ship. It'll take you too, at this pace.",
      lowDurability: "The sea has claimed better fighters than you. Many, actually.",
      hadCounter: "You held your footing against the maelstrom. My old crew struggled with less.",
      manyLosses: "Another vessel added to the wreckage down here. Figuratively, for now.",
      barelySurvived: "Nearly went down with this fight too. Nearly."
    }
  },
  {
    key: "the_krakens_apprentice", level: 42, chapter: 5, name: "The Kraken's Apprentice",
    theme: "Studying under something far too large to actually see",
    power_source: "Water", fighting_style: "Summoner", character_type: "Monster",
    intro: "A smaller creature drags impossibly long tentacles behind it, clearly borrowing techniques from something much bigger.",
    signature_move: "Borrowed Grasp",
    tell: "Extra tentacles unfurl from the dark right before Borrowed Grasp.",
    phase2_health_pct: 40,
    phase2_behavior: "Summons more tentacles at once — harder to isolate a single attack to counter.",
    difficultyMult: 6.45,
    stats: { strength: 24, speed: 20, durability: 24, battle_iq: 24, stamina: 24 },
    abilities: [
      { key: "borrowed_grasp", name: "Borrowed Grasp", type: "attack", desc: "Tentacles from somewhere far larger, borrowed for the occasion.", visual: "shadow_fade" },
      { key: "apprentice_instinct", name: "Apprentice Instinct", type: "passive", desc: "Learning fast, even mid-fight.", visual: "psychic_glow" },
      { key: "many_hands", name: "Many Hands", type: "buff", desc: "More limbs than any fair fight should allow.", visual: "storm_ring" }
    ],
    primaryReward: "borrowed_grasp",
    helpsAgainst: "static_eel_sam",
    hints: {
      0: "Whatever it's apprenticing under is clearly enormous. This is just the borrowed portion.",
      1: "Extra tentacles unfurl from the dark right before Borrowed Grasp.",
      3: "Recommended counter: Captain Undertow's tactical reads expose the pattern in the borrowed technique."
    },
    dialogue: {
      lowSpeed: "Too many limbs, not enough speed on your end to dodge them all.",
      lowDurability: "Even the borrowed grip was more than you could handle.",
      hadCounter: "You read the pattern. My teacher would be almost impressed.",
      manyLosses: "Still learning from every fight, including this one, again.",
      barelySurvived: "The grasp nearly held. Nearly is a lesson too, apparently."
    }
  },
  {
    key: "static_eel_sam", level: 43, chapter: 5, name: "Static Eel Sam",
    theme: "Water and lightning were never supposed to mix. Sam disagrees.",
    power_source: "Lightning", fighting_style: "Speedster", character_type: "Monster",
    intro: "A serpentine shape crackles through the water impossibly fast, sparking with barely contained charge.",
    signature_move: "Shock Current",
    tell: "The water around him visibly crackles before Shock Current.",
    phase2_health_pct: 40,
    phase2_behavior: "The charge stops discharging in bursts and becomes constant — the whole arena carries a current.",
    difficultyMult: 6.60,
    stats: { strength: 16, speed: 38, durability: 14, battle_iq: 20, stamina: 22 },
    abilities: [
      { key: "shock_current", name: "Shock Current", type: "attack", desc: "Electrified water, everywhere at once.", visual: "arc_hands" },
      { key: "eel_speed", name: "Eel Speed", type: "mobility", desc: "Faster than anything should move underwater.", visual: "wind_rings" },
      { key: "live_wire", name: "Live Wire", type: "passive", desc: "Punishes anyone standing still.", visual: "storm_ring" }
    ],
    primaryReward: "eel_speed",
    helpsAgainst: "the_anglerfish_con_artist",
    hints: {
      0: "Water and electricity shouldn't work together this well. He's made it work anyway.",
      1: "The water visibly crackles right before Shock Current.",
      3: "Recommended counter: The Kraken's Apprentice's many limbs make it hard for him to find a clean angle."
    },
    dialogue: {
      lowSpeed: "Water conducts. You conducted. Badly, for you.",
      lowDurability: "A little current goes a long way down here.",
      hadCounter: "You kept moving. Smart — standing still is how most people lose to me.",
      manyLosses: "Still swimming back into the current. Admirable. Shocking, even.",
      barelySurvived: "Nearly discharged everything right there. Nearly."
    }
  },
  {
    key: "the_anglerfish_con_artist", level: 44, chapter: 5, name: "The Anglerfish Con Artist",
    theme: "The light isn't a lure. It's a whole sales pitch.",
    power_source: "Shadow", fighting_style: "Strategist", character_type: "Villain",
    intro: "A toothy grin surfaces first, followed by an unreasonably charming pitch about a 'great opportunity.'",
    signature_move: "Too Good to Be True",
    tell: "The pitch gets suspiciously generous right before Too Good to Be True.",
    phase2_health_pct: 40,
    phase2_behavior: "Drops the act entirely — no more charm, just teeth.",
    difficultyMult: 6.75,
    stats: { strength: 22, speed: 18, durability: 20, battle_iq: 32, stamina: 20 },
    abilities: [
      { key: "too_good_to_be_true", name: "Too Good to Be True", type: "debuff", desc: "An offer that's actually a trap, every time.", visual: "psychic_glow" },
      { key: "smooth_talker", name: "Smooth Talker", type: "passive", desc: "Disarmingly convincing, right up until it isn't.", visual: "shadow_symbol" },
      { key: "bait_and_switch", name: "Bait and Switch", type: "counter", desc: "Turns your own confidence against you.", visual: "shadow_fade" }
    ],
    primaryReward: "bait_and_switch",
    helpsAgainst: "pressures_embrace",
    hints: {
      0: "Whatever this fight seems to be offering you, it isn't actually that.",
      1: "The pitch turns suspiciously generous right before Too Good to Be True.",
      3: "Recommended counter: Static Eel Sam's raw speed doesn't give the pitch time to land."
    },
    dialogue: {
      lowSpeed: "You actually believed the offer. That's on you, honestly.",
      lowDurability: "Too good to be true. I did say that part out loud.",
      hadCounter: "You didn't bite. First smart decision I've seen down here in a while.",
      manyLosses: "Same offer, same teeth. You keep coming back anyway.",
      barelySurvived: "Almost closed the deal completely there. Almost."
    }
  },
  {
    key: "pressures_embrace", level: 45, chapter: 5, name: "Pressure's Embrace",
    theme: "The deepest thing down here, and in no hurry at all",
    power_source: "Water", fighting_style: "Defender", character_type: "Monster",
    intro: "Something vast and slow settles into place, radiating a crushing weight that has nothing to do with size alone.",
    signature_move: "The Deepest Point",
    tell: "The water pressure visibly thickens before The Deepest Point.",
    phase2_health_pct: 45,
    phase2_behavior: "The crushing weight becomes constant instead of periodic — no more safe windows.",
    difficultyMult: 6.90,
    stats: { strength: 26, speed: 8, durability: 42, battle_iq: 18, stamina: 32 },
    abilities: [
      { key: "the_deepest_point", name: "The Deepest Point", type: "attack", desc: "The full crushing weight of the abyss itself.", visual: "impact_cracks" },
      { key: "abyssal_patience", name: "Abyssal Patience", type: "passive", desc: "Has never once been in a hurry, and never will be.", visual: "stone_stance" },
      { key: "crushing_embrace", name: "Crushing Embrace", type: "defense", desc: "Nearly impossible to stagger.", visual: "storm_ring" }
    ],
    primaryReward: "abyssal_patience",
    helpsAgainst: "the_abyss_watches",
    hints: {
      0: "It has been down here longer than anything else. It is in absolutely no rush.",
      1: "The water pressure visibly thickens right before The Deepest Point.",
      3: "Recommended counter: The Con Artist's precision cuts through patience that raw force can't."
    },
    dialogue: {
      lowSpeed: "Speed means nothing at the bottom of everything.",
      lowDurability: "The deepest point does not negotiate with fragile things.",
      hadCounter: "You found the precise gap. Few ever do.",
      manyLosses: "Time passes differently down here. You've spent quite a bit of it.",
      barelySurvived: "The deepest point almost closed around you completely. Almost."
    }
  },
  {
    key: "the_abyss_watches", level: 46, chapter: 5, name: "The Abyss Watches",
    theme: "Something down here has been studying you since Level 38",
    power_source: "Shadow", fighting_style: "Assassin", character_type: "Monster",
    intro: "A presence that's been felt more than seen throughout the whole Deep finally reveals itself.",
    signature_move: "Everything You've Missed",
    tell: "The whole arena darkens completely right before Everything You've Missed.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops hiding entirely — direct, fast, and fully committed.",
    difficultyMult: 7.05,
    stats: { strength: 24, speed: 32, durability: 18, battle_iq: 26, stamina: 20 },
    abilities: [
      { key: "everything_youve_missed", name: "Everything You've Missed", type: "attack", desc: "Strikes at every blind spot you didn't know you had.", visual: "shadow_fade" },
      { key: "watching_presence", name: "Watching Presence", type: "passive", desc: "Has been reading your patterns this entire chapter.", visual: "psychic_glow" },
      { key: "abyssal_speed", name: "Abyssal Speed", type: "mobility", desc: "Closes distance faster than the dark should allow.", visual: "shadow_fade" }
    ],
    primaryReward: "watching_presence",
    helpsAgainst: "the_leviathans_heir",
    hints: {
      0: "It's been watching since you first entered the Deep. It knows this chapter better than you do.",
      1: "Total darkness is the tell — Everything You've Missed follows immediately.",
      3: "Recommended counter: Pressure's Embrace's patience denies the openings it's been waiting for."
    },
    dialogue: {
      lowSpeed: "I've watched you move through this whole chapter. That was slow every time.",
      lowDurability: "I know exactly where this hurts most. I've had a while to learn.",
      hadCounter: "You covered the blind spot. I've been watching you long enough to notice that's new.",
      manyLosses: "I've seen every attempt. This one wasn't different enough.",
      barelySurvived: "That almost caught me watching instead of acting. Almost."
    }
  },
  {
    key: "the_leviathans_heir", level: 47, chapter: 5, name: "The Leviathan's Heir",
    theme: "Everything in the Deep answers to this one, eventually",
    power_source: "Water", fighting_style: "Balanced", character_type: "God-tier (heavily limited)",
    intro: "The entire ocean seems to hold still as something ancient and vast finally rises to meet you directly.",
    signature_move: "Abyssal Reckoning",
    tell: "The whole arena's water pressure spikes at once right before Abyssal Reckoning.",
    phase2_health_pct: 55,
    phase2_behavior: "Draws directly on every threat the Deep has thrown at you this chapter.",
    difficultyMult: 7.30,
    stats: { strength: 32, speed: 28, durability: 34, battle_iq: 28, stamina: 30 },
    abilities: [
      { key: "abyssal_reckoning", name: "Abyssal Reckoning", type: "ultimate", desc: "The full weight and fury of the Deep, focused into one strike.", visual: "void_distortion" },
      { key: "leviathan_bloodline", name: "Leviathan Bloodline", type: "passive", desc: "Carries the strength of everything that has ever ruled these depths.", visual: "storm_ring" },
      { key: "depths_authority", name: "Depths Authority", type: "buff", desc: "Every creature in the Deep answers to this presence.", visual: "psychic_glow" }
    ],
    primaryReward: "abyssal_reckoning",
    helpsAgainst: "the_convergence_point",
    hints: {
      0: "Everything in the Deep answers to this one. That includes every fighter who came before you.",
      1: "The entire arena's water pressure spikes at once right before Abyssal Reckoning.",
      3: "Recommended counter: no single stat wins this — bring the most complete build the Deep has tested."
    },
    dialogue: {
      lowSpeed: "Even the fastest currents answer to the depths eventually.",
      lowDurability: "You brought a fraction of what these depths require.",
      hadCounter: "You've learned this chapter well. Rare, this deep.",
      manyLosses: "Every fighter who has fallen here becomes part of the Deep's memory. You are not the first.",
      barelySurvived: "The reckoning nearly closed completely. The Deep noted how close."
    }
  }
];
