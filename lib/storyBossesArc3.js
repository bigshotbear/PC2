// Chapter 3: "The Wilds" — a survivalist/monster-hunter zone. Original
// characters and abilities only, continuing the escalation from Arc 2.

export const ARC3_BOSSES = [
  {
    key: "the_overgrown_guy", level: 18, chapter: 3, name: "The Overgrown Guy",
    theme: "Nature reclaimed him and never let go",
    power_source: "Nature", fighting_style: "Tank", character_type: "Monster",
    intro: "A hulking figure shuffles out of the treeline, vines and bark fused permanently to his skin.",
    signature_move: "Root Slam",
    tell: "Roots visibly burst from the ground around him before Root Slam lands.",
    phase2_health_pct: 40,
    phase2_behavior: "New growth erupts across his body — slower, but nearly impossible to finish off cleanly.",
    difficultyMult: 2.95,
    stats: { strength: 34, speed: 10, durability: 38, battle_iq: 8, stamina: 22 },
    abilities: [
      { key: "root_slam", name: "Root Slam", type: "attack", desc: "The ground itself becomes a weapon.", visual: "impact_cracks" },
      { key: "bark_skin", name: "Bark Skin", type: "defense", desc: "Passive damage reduction from a body that's more tree than person now.", visual: "stone_stance" },
      { key: "regrowth", name: "Regrowth", type: "passive", desc: "Slowly heals between exchanges.", visual: "healglow" }
    ],
    primaryReward: "bark_skin",
    helpsAgainst: "nightmare_fuel",
    hints: {
      0: "He hasn't moved fast in years. He hasn't needed to.",
      1: "Roots burst from the ground before Root Slam — step wide, not back.",
      3: "Recommended counter: sustained pressure beats his regrowth before Phase Two locks in."
    },
    dialogue: {
      lowSpeed: "You stood in root range. That was the whole plan.",
      lowDurability: "The forest doesn't negotiate with soft things.",
      hadCounter: "You outpaced the regrowth. Rare.",
      manyLosses: "Grown a little more since you last visited. So have I.",
      barelySurvived: "Nearly finished before the bark could close the wound."
    }
  },
  {
    key: "nightmare_fuel", level: 19, chapter: 3, name: "Nightmare Fuel the Raccoon",
    theme: "Small, fast, and deeply unreasonable",
    power_source: "Shadow", fighting_style: "Assassin", character_type: "Monster",
    intro: "Something small and fast circles the arena's edge, eyes glinting with an unsettling amount of intelligence.",
    signature_move: "Trash Panda Frenzy",
    tell: "A low chittering builds right before Trash Panda Frenzy erupts.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops circling and comes in constantly — harder to read, harder to punish.",
    difficultyMult: 3.05,
    stats: { strength: 14, speed: 36, durability: 12, battle_iq: 18, stamina: 20 },
    abilities: [
      { key: "trash_panda_frenzy", name: "Trash Panda Frenzy", type: "attack", desc: "A chaotic flurry of small, fast strikes.", visual: "shadow_fade" },
      { key: "startling_agility", name: "Startling Agility", type: "mobility", desc: "Unnervingly hard to pin down.", visual: "wind_rings" },
      { key: "feral_instinct", name: "Feral Instinct", type: "passive", desc: "Reacts to danger before it fully registers.", visual: "shadow_symbol" }
    ],
    primaryReward: "startling_agility",
    helpsAgainst: "the_landlord",
    hints: {
      0: "Small, fast, and has clearly won fights it had no business winning.",
      1: "A chittering sound builds right before Trash Panda Frenzy.",
      3: "Recommended counter: The Overgrown Guy's raw Durability tanks the flurry better than most builds."
    },
    dialogue: {
      lowSpeed: "You really thought you could out-quick a raccoon?",
      lowDurability: "Small claws. Big problem, apparently, for you.",
      hadCounter: "You didn't flinch at the flurry. Unusual.",
      manyLosses: "Back in my territory again. Bold.",
      barelySurvived: "Nearly got dragged into the bushes there. Nearly."
    }
  },
  {
    key: "the_landlord", level: 20, chapter: 3, name: "The Landlord",
    theme: "This is his territory and he will remind you",
    power_source: "Earth", fighting_style: "Brawler", character_type: "Monster",
    intro: "A territorial beast plants itself in the center of the arena like it owns the deed.",
    signature_move: "Eviction Notice",
    tell: "He stomps twice, cracking the ground, before Eviction Notice.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops defending territory and starts actively hunting — much more aggressive.",
    difficultyMult: 3.15,
    stats: { strength: 36, speed: 16, durability: 28, battle_iq: 10, stamina: 20 },
    abilities: [
      { key: "eviction_notice", name: "Eviction Notice", type: "attack", desc: "A devastating territorial charge.", visual: "impact_cracks" },
      { key: "property_lines", name: "Property Lines", type: "area", desc: "Punishes anyone who tries to retreat.", visual: "storm_ring" },
      { key: "landlord_energy", name: "Landlord Energy", type: "buff", desc: "Gets stronger the longer he holds the center.", visual: "muscle_glow" }
    ],
    primaryReward: "property_lines",
    helpsAgainst: "campfire_cassandra",
    hints: {
      0: "This is his ground. He will make that extremely clear.",
      1: "Two stomps crack the ground before Eviction Notice.",
      3: "Recommended counter: Trash Panda's mobility avoids his territorial punish entirely."
    },
    dialogue: {
      lowSpeed: "You signed no lease. You get no mercy.",
      lowDurability: "This territory doesn't care about your build.",
      hadCounter: "You moved before I could collect. Noted.",
      manyLosses: "Back again? At least pay rent this time.",
      barelySurvived: "Almost lost the deed there. Almost."
    }
  },
  {
    key: "campfire_cassandra", level: 21, chapter: 3, name: "Campfire Cassandra",
    theme: "A ranger who's seen things and set most of them on fire",
    power_source: "Fire", fighting_style: "Sniper", character_type: "Antihero",
    intro: "A weathered ranger nocks a flaming arrow without looking, eyes fixed somewhere past you.",
    signature_move: "Ember Volley",
    tell: "Her bowstring glows before Ember Volley releases.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops single-targeting and starts blanketing the whole arena in fire.",
    difficultyMult: 3.25,
    stats: { strength: 16, speed: 24, durability: 18, battle_iq: 28, stamina: 20 },
    abilities: [
      { key: "ember_volley", name: "Ember Volley", type: "attack", desc: "Precise, burning ranged strikes.", visual: "fire_trail" },
      { key: "controlled_burn", name: "Controlled Burn", type: "area", desc: "Denies ground with lingering fire.", visual: "fire_trail" },
      { key: "ranger_focus", name: "Ranger Focus", type: "passive", desc: "Rarely misses a called shot.", visual: "scan_lines" }
    ],
    primaryReward: "controlled_burn",
    helpsAgainst: "the_swarm",
    hints: {
      0: "She doesn't miss. Closing distance fast is your best option.",
      1: "Her bowstring glows orange right before Ember Volley.",
      3: "Recommended counter: The Landlord's territorial control denies her ideal firing range."
    },
    dialogue: {
      lowSpeed: "You gave me all the time I needed to aim.",
      lowDurability: "Fire finds the weak points. It always does.",
      hadCounter: "You closed the distance. Good instinct.",
      manyLosses: "Still walking into my range. Still burning.",
      barelySurvived: "That arrow was meant to end it. It didn't. This time."
    }
  },
  {
    key: "the_swarm", level: 22, chapter: 3, name: "The Swarm",
    theme: "It's not one enemy. It was never one enemy.",
    power_source: "Poison", fighting_style: "Summoner", character_type: "Monster",
    intro: "A low buzzing fills the arena as thousands of small shapes coalesce into something resembling a fighter.",
    signature_move: "Full Hive Assault",
    tell: "The buzzing pitch rises sharply before Full Hive Assault.",
    phase2_health_pct: 40,
    phase2_behavior: "Splits into multiple smaller swarms, each still dangerous, much harder to fully suppress.",
    difficultyMult: 3.35,
    stats: { strength: 12, speed: 26, durability: 20, battle_iq: 20, stamina: 30 },
    abilities: [
      { key: "full_hive_assault", name: "Full Hive Assault", type: "attack", desc: "Overwhelming numbers, not overwhelming power.", visual: "storm_ring" },
      { key: "sting_over_time", name: "Sting Over Time", type: "debuff", desc: "Poison that lingers well past the exchange.", visual: "ooze_shimmer" },
      { key: "hive_mind", name: "Hive Mind", type: "passive", desc: "Impossible to fully isolate or silence.", visual: "psychic_glow" }
    ],
    primaryReward: "sting_over_time",
    helpsAgainst: "old_man_thunderbeard",
    hints: {
      0: "There's no single point of failure here. That's the whole design.",
      1: "The buzzing pitch climbs sharply right before Full Hive Assault.",
      3: "Recommended counter: Campfire Cassandra's area denial thins the swarm before it can commit."
    },
    dialogue: {
      lowSpeed: "You can't outrun what's already surrounding you.",
      lowDurability: "A thousand small stings add up faster than you'd like.",
      hadCounter: "You thinned us out early. Smart.",
      manyLosses: "The hive remembers every visit. So do I, somehow.",
      barelySurvived: "The hive nearly lost cohesion there. Nearly."
    }
  },
  {
    key: "old_man_thunderbeard", level: 23, chapter: 3, name: "Old Man Thunderbeard",
    theme: "A storm hermit who's been waiting a very long time",
    power_source: "Lightning", fighting_style: "Tank", character_type: "Hero",
    intro: "An ancient hermit steps out from a lightning-scarred cave, beard crackling faintly with static.",
    signature_move: "Storm's Reckoning",
    tell: "His beard sparks visibly before Storm's Reckoning discharges.",
    phase2_health_pct: 40,
    phase2_behavior: "The storm around him intensifies — slower to provoke, far more dangerous once it hits.",
    difficultyMult: 3.45,
    stats: { strength: 24, speed: 18, durability: 32, battle_iq: 22, stamina: 24 },
    abilities: [
      { key: "storms_reckoning", name: "Storm's Reckoning", type: "attack", desc: "Decades of stored charge released at once.", visual: "arc_hands" },
      { key: "grounded_stance", name: "Grounded Stance", type: "defense", desc: "Nearly immovable once set.", visual: "stone_stance" },
      { key: "static_buildup", name: "Static Buildup", type: "passive", desc: "Gets more dangerous the longer the fight runs.", visual: "storm_ring" }
    ],
    primaryReward: "grounded_stance",
    helpsAgainst: "the_apex_predator",
    hints: {
      0: "He's patient. Fights that drag on favor him more, not less.",
      1: "His beard visibly sparks before Storm's Reckoning discharges.",
      3: "Recommended counter: The Swarm's persistent poison punishes his slow, patient rhythm."
    },
    dialogue: {
      lowSpeed: "You gave the storm time to build. That was unwise.",
      lowDurability: "Lightning doesn't ask what you can take. It just takes it.",
      hadCounter: "You ended it before the charge finished. Impressive, actually.",
      manyLosses: "The storm has been waiting longer than you've been trying.",
      barelySurvived: "Reckoning nearly finished there. The beard remembers close calls."
    }
  },
  {
    key: "the_apex_predator", level: 24, chapter: 3, name: "The Apex Predator",
    theme: "Every food chain has a top. This is the Wilds' version.",
    power_source: "Nature", fighting_style: "Assassin", character_type: "Monster",
    intro: "Something moves at the treeline that clearly considers everything else in the arena prey.",
    signature_move: "Ambush Strike",
    tell: "Everything goes quiet — too quiet — right before Ambush Strike.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops stalking and commits fully — faster, more reckless, more dangerous.",
    difficultyMult: 3.55,
    stats: { strength: 28, speed: 34, durability: 18, battle_iq: 20, stamina: 20 },
    abilities: [
      { key: "ambush_strike", name: "Ambush Strike", type: "attack", desc: "A single, devastating first strike.", visual: "shadow_fade" },
      { key: "apex_instincts", name: "Apex Instincts", type: "passive", desc: "Reads and exploits hesitation instantly.", visual: "scan_lines" },
      { key: "predator_focus", name: "Predator Focus", type: "buff", desc: "Locks onto weakened targets.", visual: "storm_ring" }
    ],
    primaryReward: "apex_instincts",
    helpsAgainst: "mossy_the_unkillable",
    hints: {
      0: "It's been at the top of this food chain for a reason. Don't hesitate.",
      1: "Total silence right before Ambush Strike is the tell — it's already too late by then, so preempt it.",
      3: "Recommended counter: Old Man Thunderbeard's grounded patience denies the opening it needs."
    },
    dialogue: {
      lowSpeed: "Prey doesn't get to be slow. You learned that the hard way.",
      lowDurability: "One strike. That's usually all it takes.",
      hadCounter: "You didn't give me an opening. Frustrating. Respectable.",
      manyLosses: "You keep returning to the same hunting ground. Bold, or foolish.",
      barelySurvived: "The strike nearly finished it. You're still standing. For now."
    }
  },
  {
    key: "mossy_the_unkillable", level: 25, chapter: 3, name: "Mossy the Unkillable",
    theme: "Nobody actually knows how old this thing is",
    power_source: "Nature", fighting_style: "Tank", character_type: "Monster",
    intro: "Something ancient and moss-covered rises from the undergrowth, entirely unbothered by the concept of dying.",
    signature_move: "Ancient Resolve",
    tell: "The moss on its body glows faintly right before Ancient Resolve.",
    phase2_health_pct: 45,
    phase2_behavior: "Regeneration accelerates dramatically — this fight becomes a race against time.",
    difficultyMult: 3.65,
    stats: { strength: 26, speed: 12, durability: 38, battle_iq: 16, stamina: 30 },
    abilities: [
      { key: "ancient_resolve", name: "Ancient Resolve", type: "passive", desc: "Refuses to go down easily, ever.", visual: "healglow" },
      { key: "millennia_of_patience", name: "Millennia of Patience", type: "defense", desc: "Barely reacts to anything short of a real threat.", visual: "stone_stance" },
      { key: "root_network", name: "Root Network", type: "attack", desc: "Strikes from unexpected angles via hidden roots.", visual: "impact_cracks" }
    ],
    primaryReward: "ancient_resolve",
    helpsAgainst: "the_forests_final_warning",
    hints: {
      0: "It has survived longer than anything else in these Wilds. That should tell you something.",
      1: "The moss glows before Ancient Resolve triggers — that's when the real regeneration starts.",
      3: "Recommended counter: The Apex Predator's precision strikes outpace its regeneration where raw damage can't."
    },
    dialogue: {
      lowSpeed: "Slow is fine when you're already older than the forest itself.",
      lowDurability: "You brought fragility to a fight against patience.",
      hadCounter: "You out-damaged the regrowth. First time in a while.",
      manyLosses: "Time means very little to something this old. You, however, are getting tired.",
      barelySurvived: "The moss almost stopped glowing entirely. Almost."
    }
  },
  {
    key: "the_forests_final_warning", level: 26, chapter: 3, name: "The Forest's Final Warning",
    theme: "Everything in the Wilds led to this",
    power_source: "Nature", fighting_style: "Balanced", character_type: "Monster",
    intro: "The Wilds itself seems to gather into a single towering shape, roots and storm and fang all at once.",
    signature_move: "Wildfire Cascade",
    tell: "The whole arena dims and rustles right before Wildfire Cascade.",
    phase2_health_pct: 40,
    phase2_behavior: "Every element of the Wilds activates at once — fire, roots, lightning, poison, all together.",
    difficultyMult: 3.85,
    stats: { strength: 30, speed: 26, durability: 28, battle_iq: 24, stamina: 26 },
    abilities: [
      { key: "wildfire_cascade", name: "Wildfire Cascade", type: "ultimate", desc: "Every hazard in the Wilds unleashed simultaneously.", visual: "fire_trail" },
      { key: "natures_fury", name: "Nature's Fury", type: "buff", desc: "Gains strength from every prior fight that happened here.", visual: "muscle_glow" },
      { key: "wilds_memory", name: "Wilds Memory", type: "passive", desc: "Seems to recall every fighter who ever passed through.", visual: "psychic_glow" }
    ],
    primaryReward: "wildfire_cascade",
    helpsAgainst: "the_rangers_final_warning",
    hints: {
      0: "This is everything the Wilds has thrown at you, combined into one final test before you leave this chapter.",
      1: "The whole arena dims before Wildfire Cascade — there's no safe corner once it starts.",
      3: "Recommended counter: no single build wins this cleanly — bring your most complete kit."
    },
    dialogue: {
      lowSpeed: "The Wilds move at their own pace. You never adjusted to it.",
      lowDurability: "Everything here has been sharpening itself against fighters like you.",
      hadCounter: "You brought the whole Wilds' worth of lessons back at me. Fitting.",
      manyLosses: "Every attempt you've made here becomes part of what the forest remembers.",
      barelySurvived: "The cascade nearly finished you. The Wilds noticed how close it was."
    }
  },
  {
    key: "the_rangers_final_warning", level: 27, chapter: 3, name: "The Ranger Who Saw Too Much",
    theme: "The one who mapped the entire Wilds — and everything wrong with it",
    power_source: "Nature", fighting_style: "Strategist", character_type: "Antihero",
    intro: "A lone figure stands at the chapter's edge, having clearly already fought and studied everything you just fought.",
    signature_move: "Everything I've Learned",
    tell: "A calm, total stillness settles over the arena right before Everything I've Learned.",
    phase2_health_pct: 50,
    phase2_behavior: "Starts using tactics borrowed from every earlier Wilds boss you've faced this chapter.",
    difficultyMult: 4.05,
    stats: { strength: 24, speed: 26, durability: 24, battle_iq: 32, stamina: 22 },
    abilities: [
      { key: "everything_ive_learned", name: "Everything I've Learned", type: "ultimate", desc: "A finisher assembled from every threat in the Wilds.", visual: "psychic_glow" },
      { key: "chapter_scholar", name: "Chapter Scholar", type: "passive", desc: "Recognizes and counters overused tactics instantly.", visual: "scan_lines" },
      { key: "final_warning", name: "Final Warning", type: "counter", desc: "Punishes overconfidence precisely.", visual: "shadow_symbol" }
    ],
    primaryReward: "everything_ive_learned",
    helpsAgainst: "the_ref_whos_seen_everything",
    hints: {
      0: "This is the chapter's final test — everything you've learned in the Wilds gets tested right back.",
      1: "Total stillness settles over the arena right before Everything I've Learned.",
      3: "Recommended counter: no single stat or ability wins this — bring the most complete build you have."
    },
    dialogue: {
      lowSpeed: "I watched everyone before you. I know exactly when you'll be too slow.",
      lowDurability: "I studied what breaks fighters like you. It didn't take long to find it.",
      hadCounter: "You brought something I hadn't fully accounted for. Rare. Good.",
      manyLosses: "I have notes on every attempt you've made. They're getting more interesting.",
      barelySurvived: "That was closer than my notes predicted. I'll need to update them."
    }
  }
];
