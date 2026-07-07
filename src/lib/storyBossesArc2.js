// Arc 2: "The Society" — an original superhero-academy-flavored arc.
// Every character, name, and ability here is invented for Power Clash.
// The archetype ladder is a generic game-design shape, not IP.

export const ARC2_BOSSES = [
  {
    key: "the_puddle_problem", level: 8, name: "The Puddle Problem",
    theme: "Ooze · No bones to break · Defensive nuisance",
    power_source: "Poison", fighting_style: "Defender", character_type: "Monster",
    intro: "A shapeless, faintly glowing puddle slides out from a storm drain, entirely unbothered by the concept of a skeleton.",
    signature_move: "Full-Body Glomp",
    tell: "The puddle widens dramatically right before it tries to swallow your whole arm.",
    phase2_health_pct: 40,
    phase2_behavior: "It splits into two smaller puddles that both keep fighting — punches just aren't landing like they used to.",
    difficultyMult: 1.75,
    stats: { strength: 15, speed: 10, durability: 40, battle_iq: 15, stamina: 20 },
    abilities: [
      { key: "no_hands_discount", name: "No-Hands Discount", type: "defense", desc: "Physical strikes just kind of squelch through without doing much.", visual: "ooze_shimmer" },
      { key: "puddle_slap", name: "Puddle Slap", type: "attack", desc: "A surprisingly firm slap made entirely of goo.", visual: "ooze_hand" },
      { key: "gutter_dive", name: "Gutter Dive", type: "mobility", desc: "Escapes into any nearby drain, gap, or crack.", visual: "ooze_fade" }
    ],
    primaryReward: "no_hands_discount",
    helpsAgainst: "test_dummy_zero",
    hints: {
      0: "It doesn't have bones, muscles, or a face you can punch meaningfully. This will be a patience fight.",
      1: "Full-Body Glomp starts with a wide, telegraphed lunge. Step back before it commits.",
      3: "Recommended counter: raw Strength doesn't work here — Battle IQ and consistent chip damage do."
    },
    dialogue: {
      lowSpeed: "You can't outrun a puddle. That should have been easier for you.",
      lowDurability: "Being made of goo, I don't actually understand how that hurt you so much.",
      hadCounter: "Ah, you brought something clever this time. Rude, but effective.",
      manyLosses: "Back again? I don't have feelings, but if I did, I'd feel great right now.",
      barelySurvived: "Nearly had you fully absorbed. Puddles remember. Sort of."
    }
  },
  {
    key: "test_dummy_zero", level: 9, name: "Test Dummy Zero",
    theme: "Lab-grown · Built to take a hit · Aggressive prototype",
    power_source: "Technology", fighting_style: "Brawler", character_type: "Cyborg",
    intro: "A hulking, stitched-together prototype flexes experimentally, like it's testing its own warranty.",
    signature_move: "Prototype Overdrive",
    tell: "Its joints hiss with released pressure right before Prototype Overdrive.",
    phase2_health_pct: 40,
    phase2_behavior: "Internal safety limiters disengage — it hits noticeably harder and stops flinching entirely.",
    difficultyMult: 1.85,
    stats: { strength: 32, speed: 12, durability: 28, battle_iq: 8, stamina: 20 },
    abilities: [
      { key: "it_just_bounces_off", name: "It Just Bounces Off", type: "passive", desc: "Absorbs and redistributes shock from incoming hits.", visual: "impact_ripple" },
      { key: "overdrive_haymaker", name: "Overdrive Haymaker", type: "attack", desc: "A telegraphed but devastating full-body swing.", visual: "impact_cracks" },
      { key: "warranty_void", name: "Warranty Void", type: "buff", desc: "A late-fight surge once safety limiters disengage.", visual: "tech_glow" }
    ],
    primaryReward: "it_just_bounces_off",
    helpsAgainst: "quiet_guy_with_knives",
    hints: {
      0: "Built to absorb punishment, not to think. Straightforward, but heavy-handed.",
      1: "Prototype Overdrive is preceded by a hiss of releasing pressure from its joints.",
      3: "Recommended counter: Puddle-style passive resistance transfers surprisingly well here."
    },
    dialogue: {
      lowSpeed: "Test log: subject too slow to avoid basic prototype swing.",
      lowDurability: "Test log: subject structurally inadequate.",
      hadCounter: "Test log: subject prepared. Unexpected. Noted.",
      manyLosses: "Test log: subject returns. Again. Data appreciated.",
      barelySurvived: "Test log: subject nearly succeeded. Recalibrating."
    }
  },
  {
    key: "quiet_guy_with_knives", level: 10, name: "The Quiet Guy With Knives",
    theme: "Silent · Precise · Deeply unbothered",
    power_source: "Shadow", fighting_style: "Assassin", character_type: "Antihero",
    intro: "A gaunt figure leans against a wall, cleaning a blade, and doesn't look up until you're already close.",
    signature_move: "Nerve Pinch Special",
    tell: "His eyes flick to one specific pressure point right before Nerve Pinch Special lands.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops toying with you — every strike now aims for something that actually hurts.",
    difficultyMult: 1.95,
    stats: { strength: 20, speed: 30, durability: 15, battle_iq: 20, stamina: 15 },
    abilities: [
      { key: "tingly_numb_poke", name: "Tingly Numb Poke", type: "counter", desc: "A precise strike that temporarily deadens a limb.", visual: "nerve_flash" },
      { key: "quiet_step", name: "Quiet Step", type: "mobility", desc: "Closes distance without a sound.", visual: "shadow_fade" },
      { key: "blade_lecture", name: "Blade Lecture", type: "passive", desc: "Delivers unsolicited commentary on your fighting form mid-swing.", visual: "shadow_symbol" }
    ],
    primaryReward: "tingly_numb_poke",
    helpsAgainst: "protein_shake_enjoyer",
    hints: {
      0: "Doesn't waste movement. Every strike he throws is meant to land somewhere specific.",
      1: "Watch his eyes — they flick to the exact spot Nerve Pinch Special is aiming for.",
      3: "Recommended counter: Test Dummy's shock-absorption passive dulls the paralysis effect nicely."
    },
    dialogue: {
      lowSpeed: "You told me where you'd be three moves in advance. Slow.",
      lowDurability: "One nerve strike and you're already reconsidering your life choices.",
      hadCounter: "You dulled the strike. Fine. I have a knife for that too.",
      manyLosses: "You keep coming back with the same footwork. I keep noticing.",
      barelySurvived: "The pinch almost held longer than you could recover from. Almost."
    }
  },
  {
    key: "protein_shake_enjoyer", level: 11, name: "The Protein Shake Enjoyer",
    theme: "All muscle · No subtlety · Deeply, deeply buff",
    power_source: "Nature", fighting_style: "Brawler", character_type: "Monster",
    intro: "An enormous figure cracks his knuckles, neck, and possibly the pavement just by existing near it.",
    signature_move: "One More Rep",
    tell: "His muscles visibly swell mid-fight right before One More Rep.",
    phase2_health_pct: 40,
    phase2_behavior: "Decides warming up is over — every hit lands like it's the last set of the day.",
    difficultyMult: 2.05,
    stats: { strength: 38, speed: 10, durability: 22, battle_iq: 5, stamina: 25 },
    abilities: [
      { key: "one_more_rep", name: "One More Rep", type: "attack", desc: "A stat-boosting flex that precedes a devastating strike.", visual: "muscle_glow" },
      { key: "protein_reserves", name: "Protein Reserves", type: "passive", desc: "Recovers stamina unusually fast between exchanges.", visual: "stamina_ring" },
      { key: "gym_bro_wisdom", name: "Gym Bro Wisdom", type: "passive", desc: "Offers genuinely decent unsolicited fitness advice mid-battle.", visual: "muscle_flex" }
    ],
    primaryReward: "one_more_rep",
    helpsAgainst: "the_middleman",
    hints: {
      0: "There is exactly one plan here, and it is 'hit you extremely hard.' Respect the simplicity.",
      1: "One More Rep is preceded by a visible muscle swell — that's your cue to get out of the way.",
      3: "Recommended counter: the paralysis strike from the Quiet Guy shuts this down fast."
    },
    dialogue: {
      lowSpeed: "You gotta work on your leg day. Speed comes from the legs.",
      lowDurability: "Core strength, my friend. You're all core strength, and it's not enough.",
      hadCounter: "Nerve strikes? Sneaky. I respect a fellow student of the craft.",
      manyLosses: "Back again? Consistency is the secret to gains. Also to beating me, apparently not yet.",
      barelySurvived: "That was a heavy set. You almost matched my reps."
    }
  },
  {
    key: "the_middleman", level: 12, name: "The Middleman",
    theme: "Broker of borrowed power · Unsettlingly polite",
    power_source: "Psychic", fighting_style: "Strategist", character_type: "Villain",
    intro: "A well-dressed figure straightens his cuffs and smiles like he already knows how this ends.",
    signature_move: "Five-Finger Discount",
    tell: "His hand glows faintly right before Five-Finger Discount tries to lift one of your abilities mid-fight.",
    phase2_health_pct: 40,
    phase2_behavior: "Starts using whatever ability he just lifted from you against you.",
    difficultyMult: 2.15,
    stats: { strength: 15, speed: 20, durability: 18, battle_iq: 32, stamina: 15 },
    abilities: [
      { key: "five_finger_discount", name: "Five-Finger Discount", type: "debuff", desc: "Temporarily borrows one of the opponent's abilities mid-fight.", visual: "psychic_glow" },
      { key: "polite_negotiation", name: "Polite Negotiation", type: "passive", desc: "Reads and adapts to the opponent's patterns unusually fast.", visual: "scan_lines" },
      { key: "return_policy", name: "Return Policy", type: "counter", desc: "Gives back whatever he borrowed, with interest.", visual: "psychic_ring" }
    ],
    primaryReward: "five_finger_discount",
    helpsAgainst: "mister_crumble",
    hints: {
      0: "Something of a collector. He'd very much like to borrow whatever makes you dangerous.",
      1: "Five-Finger Discount is preceded by a faint glow in his hand — that's the tell it's coming.",
      3: "Recommended counter: overwhelming raw Strength from a Protein Shake-style build leaves little worth borrowing."
    },
    dialogue: {
      lowSpeed: "I simply borrowed a bit of your speed. You had plenty to spare, clearly not.",
      lowDurability: "You really should diversify your build. All your eggs, one basket, etc.",
      hadCounter: "Ah — you brought a build with nothing worth taking. Refreshing, actually.",
      manyLosses: "I've borrowed quite a bit from you by now. Consider it a loyalty program.",
      barelySurvived: "I nearly kept that one permanently. Nearly."
    }
  },
  {
    key: "mister_crumble", level: 13, name: "Mister Crumble",
    theme: "Turns things to dust · Deeply unbothered by architecture",
    power_source: "Earth", fighting_style: "Mage", character_type: "Sorcerer",
    intro: "A calm figure rests two fingers against a nearby wall, and the wall quietly stops existing.",
    signature_move: "It's Just Dust Now",
    tell: "Both his hands press together right before It's Just Dust Now.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops being careful with the area around him — collateral damage becomes a genuine hazard.",
    difficultyMult: 2.25,
    stats: { strength: 18, speed: 15, durability: 20, battle_iq: 27, stamina: 20 },
    abilities: [
      { key: "its_just_dust_now", name: "It's Just Dust Now", type: "attack", desc: "Disintegrates whatever he touches, gradually.", visual: "void_distortion" },
      { key: "structural_integrity_denial", name: "Structural Integrity Denial", type: "area", desc: "Weakens the arena itself around him.", visual: "impact_cracks" },
      { key: "calm_before_the_crumble", name: "Calm Before the Crumble", type: "passive", desc: "Never seems to be in a hurry, which is somehow worse.", visual: "stone_stance" }
    ],
    primaryReward: "its_just_dust_now",
    helpsAgainst: "the_understudy",
    hints: {
      0: "He doesn't need to hit hard. He needs to touch you at all.",
      1: "It's Just Dust Now begins the moment both his hands press together.",
      3: "Recommended counter: The Middleman's borrowing trick works shockingly well against a one-note kit like this."
    },
    dialogue: {
      lowSpeed: "You stood still long enough for me to finish the thought. Unwise.",
      lowDurability: "It doesn't take much force. Just... patience.",
      hadCounter: "Borrowed my own trick against me. Bold. Slightly annoying.",
      manyLosses: "You keep returning in one piece. I'll allow it, for now.",
      barelySurvived: "You were most of the way to dust. Most of the way."
    }
  },
  {
    key: "the_understudy", level: 14, name: "The Understudy",
    theme: "Fast, fragile, refuses to stay down",
    power_source: "Nature", fighting_style: "Speedster", character_type: "Mutant",
    intro: "A wiry figure bounces on the balls of his feet, grinning like he's already recovering from a hit that hasn't happened yet.",
    signature_move: "Regenerate.exe",
    tell: "A faint green shimmer runs across his skin right before Regenerate.exe kicks in.",
    phase2_health_pct: 40,
    phase2_behavior: "Regeneration accelerates noticeably — damage that should finish the fight just doesn't quite land.",
    difficultyMult: 2.35,
    stats: { strength: 15, speed: 30, durability: 15, battle_iq: 15, stamina: 25 },
    abilities: [
      { key: "regenerate_exe", name: "Regenerate.exe", type: "passive", desc: "Recovers from damage at an unusual rate.", visual: "healglow" },
      { key: "understudy_footwork", name: "Understudy Footwork", type: "mobility", desc: "Constant, hard-to-read repositioning.", visual: "wind_rings" },
      { key: "second_wind_drink", name: "Second Wind (Energy Drink Brand)", type: "buff", desc: "A late-fight stamina surge, allegedly sponsored.", visual: "stamina_ring" }
    ],
    primaryReward: "regenerate_exe",
    helpsAgainst: "ceo_of_rage_quitting",
    hints: {
      0: "Damage that would finish most fighters just doesn't stick to this one for long.",
      1: "Regenerate.exe is preceded by a faint green shimmer across his skin.",
      3: "Recommended counter: Mister Crumble's disintegration effect outpaces standard regeneration."
    },
    dialogue: {
      lowSpeed: "I was already healed by the time that landed. Try again, but faster.",
      lowDurability: "Funny thing about regeneration — it means I don't have to worry about that stat much.",
      hadCounter: "Ah, disintegration. That one doesn't heal back quite as easily. Rude.",
      manyLosses: "I heal fast. You return often. We're basically the same, honestly.",
      barelySurvived: "That nearly outpaced my healing. Nearly is a fun word, isn't it."
    }
  },
  {
    key: "ceo_of_rage_quitting", level: 15, name: "The CEO of Rage Quitting",
    theme: "Gets angrier the longer the fight goes",
    power_source: "Fire", fighting_style: "Tank", character_type: "Villain",
    intro: "A stone-faced executive-type rolls up his sleeves, visibly counting to ten and failing.",
    signature_move: "Big Mad Energy",
    tell: "His aura flares red right before Big Mad Energy erupts.",
    phase2_health_pct: 40,
    phase2_behavior: "Anger compounds — attacks get faster and harder the longer you drag the fight out.",
    difficultyMult: 2.45,
    stats: { strength: 25, speed: 15, durability: 30, battle_iq: 10, stamina: 20 },
    abilities: [
      { key: "big_mad_energy", name: "Big Mad Energy", type: "attack", desc: "Converts accumulated frustration directly into damage output.", visual: "fire_trail" },
      { key: "corporate_composure", name: "Corporate Composure", type: "defense", desc: "A thin veneer of calm that absorbs early provocation.", visual: "stone_stance" },
      { key: "email_the_whole_team", name: "Email the Whole Team", type: "debuff", desc: "An oddly effective verbal barrage that throws off focus.", visual: "storm_ring" }
    ],
    primaryReward: "big_mad_energy",
    helpsAgainst: "the_awakened_understudy",
    hints: {
      0: "The longer this fight runs, the worse it gets for you. Speed matters here.",
      1: "Big Mad Energy is preceded by his aura visibly flaring red.",
      3: "Recommended counter: The Understudy's speed lets you end this before the anger compounds too far."
    },
    dialogue: {
      lowSpeed: "You let this drag on. That was your first mistake, and your last.",
      lowDurability: "I've been building up to this for the entire fight. You have not.",
      hadCounter: "You ended it quickly. Smart. I hate that you're right.",
      manyLosses: "Every loss you hand me becomes fuel. You're doing me a favor, unfortunately for you.",
      barelySurvived: "One more minute and the anger would have finished the job for me."
    }
  },
  {
    key: "the_awakened_understudy", level: 16, name: "The Awakened Understudy",
    theme: "Fragile, but capable of erasing a city block",
    power_source: "Cosmic Energy", fighting_style: "Balanced", character_type: "God-tier (heavily limited)",
    intro: "A once-minor figure now crackles with far too much power for his own body to safely contain.",
    signature_move: "Delete City.bat",
    tell: "Reality visibly glitches around him right before Delete City.bat triggers.",
    phase2_health_pct: 45,
    phase2_behavior: "Power output becomes unstable — hits harder, but starts damaging himself in the process.",
    difficultyMult: 2.60,
    stats: { strength: 25, speed: 22, durability: 12, battle_iq: 20, stamina: 21 },
    abilities: [
      { key: "delete_city_bat", name: "Delete City.bat", type: "ultimate", desc: "A city-block-scale decay effect, executed with visible discomfort.", visual: "void_distortion" },
      { key: "too_much_power", name: "Too Much Power", type: "passive", desc: "Output far exceeds what his body can comfortably handle.", visual: "storm_ring" },
      { key: "unstable_flicker", name: "Unstable Flicker", type: "mobility", desc: "Involuntary short-range teleportation from power overflow.", visual: "void_echo" }
    ],
    primaryReward: "delete_city_bat",
    helpsAgainst: "the_everything_guy",
    hints: {
      0: "This much power in a body this fragile is genuinely dangerous — to both of you.",
      1: "Reality itself glitches visibly right before Delete City.bat goes off.",
      3: "Recommended counter: The CEO's sustained pressure punishes his fragile Durability before he can fully unleash."
    },
    dialogue: {
      lowSpeed: "You stood in the blast radius. I did warn you, structurally speaking.",
      lowDurability: "I didn't even mean to hit that hard. This power doesn't really have a dial.",
      hadCounter: "You pressured me before I could vent it properly. Smart, and slightly terrifying.",
      manyLosses: "Every time you come back, I understand this power a little less and fear it a little more.",
      barelySurvived: "That almost cost me more than the fight. This power isn't free to use."
    }
  },
  {
    key: "the_everything_guy", level: 17, name: "The Everything Guy",
    theme: "Every archetype at once · The actual final boss",
    power_source: "Cosmic Energy", fighting_style: "Balanced", character_type: "God-tier (heavily limited)",
    intro: "A figure steps forward wearing pieces of every fighter who has ever stood in this arena, and somehow makes it look tidy.",
    signature_move: "The One Power To Rule Them All",
    tell: "Every element in the arena briefly reacts at once right before The One Power To Rule Them All.",
    phase2_health_pct: 55,
    phase3_health_pct: 20,
    phase2_behavior: "Begins freely borrowing whatever tactic you lean on most, mid-fight.",
    phase3_behavior: "Every hint stops mattering — this is a pure test of your complete, whole build.",
    difficultyMult: 2.80,
    stats: { strength: 30, speed: 28, durability: 26, battle_iq: 30, stamina: 26 },
    abilities: [
      { key: "one_power_to_rule", name: "The One Power To Rule Them All", type: "ultimate", desc: "A devastating finisher drawing on every archetype at once.", visual: "void_distortion" },
      { key: "collector_of_everything", name: "Collector of Everything", type: "passive", desc: "Reads and briefly mirrors whichever ability you rely on most.", visual: "scan_lines" },
      { key: "final_form_no_really", name: "Final Form, No Really", type: "buff", desc: "A last-phase surge that touches every stat at once.", visual: "tech_glow" }
    ],
    primaryReward: "one_power_to_rule",
    helpsAgainst: null,
    hints: {
      0: "He's taken a piece from everyone who ever stood here. There's no single clean answer to this fight.",
      1: "Every elemental effect in the arena flickers at once right before his ultimate goes off.",
      3: "Recommended counter: no single stat wins this. Bring your most complete, most balanced build."
    },
    dialogue: {
      lowSpeed: "Even the fastest ones who stood here couldn't outrun everything at once.",
      lowDurability: "You brought a fraction of a build to the sum of every build.",
      hadCounter: "Clever. I've seen that trick before — probably from someone you'd recognize.",
      manyLosses: "Every version of you that fell here becomes part of what I understand. You are not the first. You will not be the last — yet.",
      barelySurvived: "It very nearly wasn't enough. That's the highest compliment this arena has to offer."
    }
  }
];
