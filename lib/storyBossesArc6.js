// Chapter 6: "The Convergence" — the finale. Corrupted echoes of earlier
// chapter bosses, building to the true final boss. All original content;
// "echo" framing ties the full 60-level campaign together narratively
// without reusing any real IP.

export const ARC6_BOSSES = [
  {
    key: "the_convergence_point", level: 48, chapter: 6, name: "The Convergence Point",
    theme: "Something is tearing between every arena you've ever fought in",
    power_source: "Cosmic Energy", fighting_style: "Balanced", character_type: "God-tier (heavily limited)",
    intro: "Reality thins at the edge of the arena, and something not quite solid steps through the gap.",
    signature_move: "Rift Pulse",
    tell: "The tear widens visibly right before Rift Pulse.",
    phase2_health_pct: 40,
    phase2_behavior: "The rift destabilizes further, occasionally flickering with images of arenas from earlier chapters.",
    difficultyMult: 7.55,
    stats: { strength: 22, speed: 24, durability: 22, battle_iq: 22, stamina: 22 },
    abilities: [
      { key: "rift_pulse", name: "Rift Pulse", type: "attack", desc: "A burst of unstable, half-formed energy.", visual: "void_distortion" },
      { key: "unstable_form", name: "Unstable Form", type: "passive", desc: "Never quite solid enough to hit cleanly.", visual: "void_echo" },
      { key: "echo_static", name: "Echo Static", type: "debuff", desc: "Faint interference from somewhere else entirely.", visual: "storm_ring" }
    ],
    primaryReward: "unstable_form",
    helpsAgainst: "echo_of_stoneclaw",
    hints: {
      0: "Something is bleeding between every arena you've ever fought in. This is the first sign of it.",
      1: "The rift visibly widens right before Rift Pulse.",
      3: "Recommended counter: consistent pressure — its unstable form can't sustain long exchanges well."
    },
    dialogue: {
      lowSpeed: "The rift moves faster than you do. It always will.",
      lowDurability: "Half-formed energy still hits. You learned that the hard way.",
      hadCounter: "You didn't let the instability work in its favor. Rare.",
      manyLosses: "The tear remains open. So does your losing streak, apparently.",
      barelySurvived: "The rift nearly swallowed that exchange whole. Nearly."
    }
  },
  {
    key: "echo_of_stoneclaw", level: 49, chapter: 6, name: "Echo of Stoneclaw",
    theme: "A corrupted memory of the very first threat you ever faced",
    power_source: "Earth", fighting_style: "Tank", character_type: "Monster",
    intro: "A familiar silhouette forms from rift-static — bigger, wrong, and clearly remembering your very first fight.",
    signature_move: "Remembered Ground Slam",
    tell: "The ground cracks in a pattern you recognize right before Remembered Ground Slam.",
    phase2_health_pct: 40,
    phase2_behavior: "The echo destabilizes into something rockier and angrier than the original ever was.",
    difficultyMult: 7.70,
    stats: { strength: 36, speed: 12, durability: 40, battle_iq: 12, stamina: 18 },
    abilities: [
      { key: "remembered_ground_slam", name: "Remembered Ground Slam", type: "attack", desc: "A corrupted echo of the very first signature move you ever learned to read.", visual: "impact_cracks" },
      { key: "hardened_memory", name: "Hardened Memory", type: "defense", desc: "Armor built from a memory that refuses to fade.", visual: "rock_shoulders" },
      { key: "echo_instability", name: "Echo Instability", type: "passive", desc: "Not quite the original — stronger, and worse for it.", visual: "void_echo" }
    ],
    primaryReward: "hardened_memory",
    helpsAgainst: "echo_of_the_puddle_problem",
    hints: {
      0: "You've seen this pattern before, back at Level 1. It's not friendlier for the familiarity.",
      1: "The ground cracks in the exact pattern you first learned to recognize.",
      3: "Recommended counter: everything you learned from the original Stoneclaw still applies here, just scaled up."
    },
    dialogue: {
      lowSpeed: "Same slam. Same result, apparently, even after everything since.",
      lowDurability: "The armor remembers exactly how this fight goes.",
      hadCounter: "You still remembered the tell. Good. The echo remembers you too.",
      manyLosses: "Every version of this fight ends the same way for you, it seems.",
      barelySurvived: "That nearly cracked the memory itself. Nearly."
    }
  },
  {
    key: "echo_of_the_puddle_problem", level: 50, chapter: 6, name: "Echo of the Puddle Problem",
    theme: "A corrupted memory of a fight that shouldn't have been this hard",
    power_source: "Poison", fighting_style: "Defender", character_type: "Monster",
    intro: "A familiar shapeless form ripples back into existence, denser and far less patient than you remember.",
    signature_move: "Corrupted Glomp",
    tell: "The puddle widens too fast, wrong somehow, before Corrupted Glomp.",
    phase2_health_pct: 40,
    phase2_behavior: "Splits into more copies than the original ever could.",
    difficultyMult: 7.85,
    stats: { strength: 18, speed: 14, durability: 46, battle_iq: 18, stamina: 24 },
    abilities: [
      { key: "corrupted_glomp", name: "Corrupted Glomp", type: "attack", desc: "The original's patience, corrupted into aggression.", visual: "ooze_hand" },
      { key: "echo_resistance", name: "Echo Resistance", type: "defense", desc: "Still doesn't have bones. Still absorbs everything.", visual: "ooze_shimmer" },
      { key: "memory_split", name: "Memory Split", type: "passive", desc: "Splits into more copies than should be possible.", visual: "void_echo" }
    ],
    primaryReward: "echo_resistance",
    helpsAgainst: "echo_of_the_middleman",
    hints: {
      0: "This one remembers being underestimated. It's not making that easy for you this time.",
      1: "The Corrupted Glomp lunge is wider and faster than the original ever managed.",
      3: "Recommended counter: the same patience that beat the original still works, just requires more of it."
    },
    dialogue: {
      lowSpeed: "You can't outrun a puddle. Some lessons don't change.",
      lowDurability: "The echo remembers exactly how much this used to hurt you.",
      hadCounter: "You still know the trick to me. Good. It's harder to use now.",
      manyLosses: "The echo remembers every attempt. So do I, somehow.",
      barelySurvived: "Nearly absorbed everything that time. Nearly."
    }
  },
  {
    key: "echo_of_the_middleman", level: 51, chapter: 6, name: "Echo of the Middleman",
    theme: "A corrupted memory of the one who taught you the cost of borrowing",
    power_source: "Psychic", fighting_style: "Strategist", character_type: "Villain",
    intro: "A well-dressed shape resolves from static, cuffs still straightening themselves out of habit.",
    signature_move: "Corrupted Discount",
    tell: "His hand glows the wrong color right before Corrupted Discount.",
    phase2_health_pct: 40,
    phase2_behavior: "Borrows more than one ability at once — much harder to plan around.",
    difficultyMult: 8.00,
    stats: { strength: 18, speed: 24, durability: 22, battle_iq: 38, stamina: 18 },
    abilities: [
      { key: "corrupted_discount", name: "Corrupted Discount", type: "debuff", desc: "Borrows more than the original ever dared to.", visual: "psychic_glow" },
      { key: "echo_negotiation", name: "Echo Negotiation", type: "passive", desc: "Reads patterns faster than the original ever could.", visual: "scan_lines" },
      { key: "compound_interest", name: "Compound Interest", type: "counter", desc: "Whatever it borrows comes back worse.", visual: "psychic_ring" }
    ],
    primaryReward: "compound_interest",
    helpsAgainst: "echo_of_mister_crumble",
    hints: {
      0: "It remembers exactly what it borrowed from you the first time. It wants more this round.",
      1: "His hand glows an unnatural color right before Corrupted Discount.",
      3: "Recommended counter: an overwhelming, simple build leaves little worth borrowing."
    },
    dialogue: {
      lowSpeed: "I borrowed more than speed this time. Everything, really.",
      lowDurability: "You really should diversify. I did say that the first time too.",
      hadCounter: "Nothing worth taking this round. Refreshing.",
      manyLosses: "I've borrowed from you enough times to open a whole account.",
      barelySurvived: "Nearly kept that one permanently. Nearly, again."
    }
  },
  {
    key: "echo_of_mister_crumble", level: 52, chapter: 6, name: "Echo of Mister Crumble",
    theme: "A corrupted memory of the one who taught patience isn't always safe",
    power_source: "Earth", fighting_style: "Mage", character_type: "Sorcerer",
    intro: "A calm figure reforms from rift-static, two fingers already extended toward the nearest surface.",
    signature_move: "Corrupted Dust",
    tell: "Both hands press together, wrong and hollow, before Corrupted Dust.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops being careful entirely — the whole arena starts crumbling, not just what he touches.",
    difficultyMult: 8.15,
    stats: { strength: 20, speed: 18, durability: 24, battle_iq: 32, stamina: 22 },
    abilities: [
      { key: "corrupted_dust", name: "Corrupted Dust", type: "attack", desc: "Disintegration, corrupted into something far less careful.", visual: "void_distortion" },
      { key: "echo_denial", name: "Echo Denial", type: "area", desc: "Weakens the entire arena, not just a touch.", visual: "impact_cracks" },
      { key: "patient_corruption", name: "Patient Corruption", type: "passive", desc: "Somehow even calmer than the original, which is worse.", visual: "stone_stance" }
    ],
    primaryReward: "echo_denial",
    helpsAgainst: "echo_of_the_ranger",
    hints: {
      0: "He doesn't need to hit hard. He never did. He just needs contact, and patience.",
      1: "Both hands press together, hollow and wrong, before Corrupted Dust.",
      3: "Recommended counter: the Middleman's echo trick works here too — there's not much to borrow, but it disrupts the calm."
    },
    dialogue: {
      lowSpeed: "You stood still long enough again. Some lessons truly don't land.",
      lowDurability: "It never took much force. Just patience. Still doesn't.",
      hadCounter: "Borrowed my own trick against me, echo or not. Bold.",
      manyLosses: "You keep returning in one piece. The echo allows it, for now.",
      barelySurvived: "You were most of the way to dust again. Most of the way."
    }
  },
  {
    key: "echo_of_the_ranger", level: 53, chapter: 6, name: "Echo of the Ranger",
    theme: "A corrupted memory of the one who studied every fighter before you",
    power_source: "Nature", fighting_style: "Strategist", character_type: "Antihero",
    intro: "A familiar figure reforms at the arena's edge, having apparently studied this exact fight before it happened.",
    signature_move: "Corrupted Lessons",
    tell: "Total stillness settles, heavier than before, right before Corrupted Lessons.",
    phase2_health_pct: 45,
    phase2_behavior: "Starts borrowing tactics from every echo you've faced this chapter, not just its own.",
    difficultyMult: 8.35,
    stats: { strength: 24, speed: 26, durability: 24, battle_iq: 36, stamina: 22 },
    abilities: [
      { key: "corrupted_lessons", name: "Corrupted Lessons", type: "ultimate", desc: "Everything the original learned, corrupted into a weapon.", visual: "psychic_glow" },
      { key: "echo_scholarship", name: "Echo Scholarship", type: "passive", desc: "Somehow knows this chapter's echoes even better than the originals did.", visual: "scan_lines" },
      { key: "corrupted_warning", name: "Corrupted Warning", type: "counter", desc: "Punishes confidence with unusual precision.", visual: "shadow_symbol" }
    ],
    primaryReward: "echo_scholarship",
    helpsAgainst: "echo_of_the_ref",
    hints: {
      0: "It remembers studying every fighter who passed through the Wilds. This version studied harder.",
      1: "A heavier stillness than before settles right before Corrupted Lessons.",
      3: "Recommended counter: no single stat or trick wins this — bring your most complete, most tested build."
    },
    dialogue: {
      lowSpeed: "I watched everyone before you, and I watched you the first time too.",
      lowDurability: "I studied exactly what breaks fighters like you. Twice, now.",
      hadCounter: "You brought something even my notes hadn't accounted for. Rare.",
      manyLosses: "I have records on every attempt, echo or original. They're getting long.",
      barelySurvived: "Closer than my notes predicted. I'll need to update them again."
    }
  },
  {
    key: "echo_of_the_ref", level: 54, chapter: 6, name: "Echo of the Ref",
    theme: "A corrupted memory of the one who'd seen everything",
    power_source: "Technology", fighting_style: "Strategist", character_type: "Villain",
    intro: "A grizzled figure reforms, counting on his fingers before the fight has even properly started.",
    signature_move: "Corrupted Count",
    tell: "He counts too fast, wrong somehow, right before Corrupted Count.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops enforcing any rules at all — pure exploitation of every pattern you've shown.",
    difficultyMult: 8.50,
    stats: { strength: 22, speed: 20, durability: 28, battle_iq: 36, stamina: 22 },
    abilities: [
      { key: "corrupted_count", name: "Corrupted Count", type: "attack", desc: "The original's timing, corrupted into something far less fair.", visual: "impact_cracks" },
      { key: "echo_officiating", name: "Echo Officiating", type: "passive", desc: "Recognizes patterns instantly, no rulebook required anymore.", visual: "scan_lines" },
      { key: "corrupted_rulebook", name: "Corrupted Rulebook", type: "counter", desc: "Punishes repetition brutally.", visual: "psychic_glow" }
    ],
    primaryReward: "echo_officiating",
    helpsAgainst: "echo_of_the_promoter",
    hints: {
      0: "It's watched thousands of fights, echo or not. Repetition is still exactly what it wants.",
      1: "The count comes too fast, off-rhythm, right before Corrupted Count.",
      3: "Recommended counter: vary everything — this echo punishes predictability even harder than the original."
    },
    dialogue: {
      lowSpeed: "One. Two. Three. Faster this time. You still didn't beat it.",
      lowDurability: "I've seen worse, echo or not. I've also seen much better.",
      hadCounter: "You didn't repeat yourself. Good. The echo remembers that too.",
      manyLosses: "Back in this ring again, echo and all. I'm still keeping notes.",
      barelySurvived: "That count nearly finished before you got up. Nearly, again."
    }
  },
  {
    key: "echo_of_the_promoter", level: 55, chapter: 6, name: "Echo of the Promoter",
    theme: "A corrupted memory of the one who owned the whole league",
    power_source: "Technology", fighting_style: "Strategist", character_type: "Villain",
    intro: "A sharply dressed figure steps through the rift, contract already in hand, terms already unfavorable.",
    signature_move: "Corrupted Contract",
    tell: "He references a clause that shouldn't exist right before Corrupted Contract.",
    phase2_health_pct: 40,
    phase2_behavior: "Rewrites the arena's rules constantly now, not just occasionally.",
    difficultyMult: 8.65,
    stats: { strength: 20, speed: 22, durability: 26, battle_iq: 40, stamina: 20 },
    abilities: [
      { key: "corrupted_contract", name: "Corrupted Contract", type: "debuff", desc: "Terms that were never actually agreed to.", visual: "psychic_glow" },
      { key: "echo_authority", name: "Echo Authority", type: "area", desc: "Rewrites the battlefield's rules on a whim, more often now.", visual: "tech_glow" },
      { key: "corrupted_fine_print", name: "Corrupted Fine Print", type: "passive", desc: "Every clause somehow favors the echo more than the original ever did.", visual: "scan_lines" }
    ],
    primaryReward: "echo_authority",
    helpsAgainst: "echo_of_the_leviathans_heir",
    hints: {
      0: "It still owns the arena, echo or not. That means the ground beneath you is never fully neutral.",
      1: "He references a clause that shouldn't exist right before Corrupted Contract.",
      3: "Recommended counter: The Ref echo's pattern-reading disrupts the contract's exploits fastest."
    },
    dialogue: {
      lowSpeed: "It's all in the fine print. Corrupted or not, you never read it.",
      lowDurability: "The house always keeps a slight edge. Echo or original, that never changes.",
      hadCounter: "You found the loophole again. Impressive, still annoying.",
      manyLosses: "Another match on the books, echo and all. The league thanks you.",
      barelySurvived: "That contract nearly closed completely. Nearly, once more."
    }
  },
  {
    key: "echo_of_the_leviathans_heir", level: 56, chapter: 6, name: "Echo of the Leviathan's Heir",
    theme: "A corrupted memory of everything the Deep ever answered to",
    power_source: "Water", fighting_style: "Balanced", character_type: "God-tier (heavily limited)",
    intro: "The whole arena seems to flood briefly as something vast and familiar reforms from the rift.",
    signature_move: "Corrupted Reckoning",
    tell: "Pressure spikes everywhere at once, wrong and uneven, before Corrupted Reckoning.",
    phase2_health_pct: 50,
    phase2_behavior: "Draws on every echo you've faced this chapter simultaneously.",
    difficultyMult: 8.85,
    stats: { strength: 34, speed: 26, durability: 36, battle_iq: 26, stamina: 28 },
    abilities: [
      { key: "corrupted_reckoning", name: "Corrupted Reckoning", type: "ultimate", desc: "The Deep's full weight, corrupted into something far less patient.", visual: "void_distortion" },
      { key: "echo_bloodline", name: "Echo Bloodline", type: "passive", desc: "Carries corrupted strength from everything that ruled these depths.", visual: "storm_ring" },
      { key: "corrupted_authority", name: "Corrupted Authority", type: "buff", desc: "Every earlier echo answers to this one now too.", visual: "psychic_glow" }
    ],
    primaryReward: "corrupted_reckoning",
    helpsAgainst: "the_convergence_unstable",
    hints: {
      0: "Everything in the Deep answered to the original. Every echo in this chapter answers to this one.",
      1: "Pressure spikes unevenly across the whole arena right before Corrupted Reckoning.",
      3: "Recommended counter: no single stat wins this — bring the most complete build this whole campaign has tested."
    },
    dialogue: {
      lowSpeed: "Even the fastest currents answered to the depths. The echoes remember that too.",
      lowDurability: "You brought a fraction of what these corrupted depths require.",
      hadCounter: "You've learned this whole campaign well. Rare, even for an echo.",
      manyLosses: "Every version of you that fell here becomes part of what the rift remembers.",
      barelySurvived: "The reckoning nearly closed completely. The rift noted how close."
    }
  },
  {
    key: "the_convergence_unstable", level: 57, chapter: 6, name: "The Convergence, Unstable",
    theme: "Every echo you've faced this chapter, briefly all at once",
    power_source: "Cosmic Energy", fighting_style: "Balanced", character_type: "God-tier (heavily limited)",
    intro: "The rift itself finally destabilizes completely, briefly showing fragments of every echo you've already beaten.",
    signature_move: "Cascading Instability",
    tell: "Every fragment flickers in sync right before Cascading Instability.",
    phase2_health_pct: 45,
    phase2_behavior: "The fragments stop syncing and start attacking independently — much harder to predict.",
    difficultyMult: 9.10,
    stats: { strength: 28, speed: 28, durability: 26, battle_iq: 28, stamina: 26 },
    abilities: [
      { key: "cascading_instability", name: "Cascading Instability", type: "ultimate", desc: "Every echo this chapter, briefly overlapping into one attack.", visual: "void_distortion" },
      { key: "fragmentary_defense", name: "Fragmentary Defense", type: "defense", desc: "Never quite solid enough to land a clean hit on.", visual: "void_echo" },
      { key: "convergent_chaos", name: "Convergent Chaos", type: "debuff", desc: "Unpredictable by design — even it doesn't fully control this.", visual: "storm_ring" }
    ],
    primaryReward: "fragmentary_defense",
    helpsAgainst: "the_architect",
    hints: {
      0: "This isn't one threat. It's the instability of everything you've faced this chapter, briefly given form.",
      1: "Every fragment flickers in unison right before Cascading Instability.",
      3: "Recommended counter: consistent pressure — the instability can't sustain a long, even fight."
    },
    dialogue: {
      lowSpeed: "The instability doesn't wait for slow answers. Nothing here does.",
      lowDurability: "Every fragment took a piece. That adds up faster than you'd like.",
      hadCounter: "You found the pattern in the chaos. Genuinely rare.",
      manyLosses: "Every attempt becomes another fragment in the instability now.",
      barelySurvived: "The cascade nearly held together completely. Nearly."
    }
  },
  {
    key: "the_architect", level: 58, chapter: 6, name: "The Architect",
    theme: "The one actually responsible for the Convergence",
    power_source: "Cosmic Energy", fighting_style: "Strategist", character_type: "God-tier (heavily limited)",
    intro: "A calm, precise figure steps through the settling rift, entirely unsurprised to see you here.",
    signature_move: "Design Flaw",
    tell: "Reality briefly resembles a blueprint right before Design Flaw.",
    phase2_health_pct: 45,
    phase2_behavior: "Stops explaining the design and starts actively rewriting the fight's rules mid-exchange.",
    difficultyMult: 9.40,
    stats: { strength: 24, speed: 26, durability: 28, battle_iq: 42, stamina: 24 },
    abilities: [
      { key: "design_flaw", name: "Design Flaw", type: "debuff", desc: "Exploits a weakness built into the fight itself.", visual: "psychic_glow" },
      { key: "architects_intent", name: "Architect's Intent", type: "passive", desc: "Everything about this Convergence was planned, including this fight.", visual: "scan_lines" },
      { key: "blueprint_shift", name: "Blueprint Shift", type: "counter", desc: "Redraws the terms of engagement mid-fight.", visual: "tech_glow" }
    ],
    primaryReward: "architects_intent",
    helpsAgainst: null,
    hints: {
      0: "Every echo, every rift, every corrupted memory — all of it was built by this one, deliberately.",
      1: "Reality briefly looks like a blueprint right before Design Flaw.",
      3: "Recommended counter: bring your absolute best build — there is no clean angle against a fight this deliberately designed."
    },
    dialogue: {
      lowSpeed: "I designed this encounter around exactly that weakness. You confirmed it.",
      lowDurability: "Every flaw in your build was accounted for before you arrived.",
      hadCounter: "You found something I didn't design for. That is, genuinely, rare.",
      manyLosses: "Every attempt refines the design further. You're helping, in a way.",
      barelySurvived: "The design nearly held completely. It didn't, quite. Noted."
    }
  },
  {
    key: "the_architect_awakened", level: 59, chapter: 6, name: "The Architect, Awakened",
    theme: "The Architect, no longer holding anything back",
    power_source: "Cosmic Energy", fighting_style: "Balanced", character_type: "God-tier (heavily limited)",
    intro: "The calm falls away entirely as the Architect finally reveals the true scope of what's been built here.",
    signature_move: "Full Blueprint",
    tell: "The entire arena redraws itself visibly right before Full Blueprint.",
    phase2_health_pct: 50,
    phase2_behavior: "Every echo and mechanic from the entire campaign becomes briefly available to it at once.",
    difficultyMult: 9.75,
    stats: { strength: 30, speed: 30, durability: 32, battle_iq: 40, stamina: 28 },
    abilities: [
      { key: "full_blueprint", name: "Full Blueprint", type: "ultimate", desc: "The complete, unrestrained design finally unleashed.", visual: "void_distortion" },
      { key: "total_awareness", name: "Total Awareness", type: "passive", desc: "Understands every build this campaign has ever tested.", visual: "scan_lines" },
      { key: "unbound_design", name: "Unbound Design", type: "buff", desc: "No longer holding back any part of the plan.", visual: "tech_glow" }
    ],
    primaryReward: "full_blueprint",
    helpsAgainst: null,
    hints: {
      0: "This is the Architect with nothing held back. Everything before this was restraint.",
      1: "The entire arena visibly redraws itself right before Full Blueprint.",
      3: "Recommended counter: this is the true test of your whole build — there's no single trick that solves it."
    },
    dialogue: {
      lowSpeed: "I no longer need to hide the full scope. You still couldn't keep up with it.",
      lowDurability: "The unrestrained design accounts for far more than your build could survive.",
      hadCounter: "You matched the full blueprint. That has not happened in this Convergence before.",
      manyLosses: "Every attempt against the awakened design ends the same way, so far.",
      barelySurvived: "The full blueprint nearly completed itself entirely. Nearly."
    }
  },
  {
    key: "the_true_convergence", level: 60, chapter: 6, name: "The True Convergence",
    theme: "Everything this campaign ever was, in one final fight",
    power_source: "Cosmic Energy", fighting_style: "Balanced", character_type: "God-tier (heavily limited)",
    intro: "Every arena, every echo, every chapter briefly overlaps into one final, complete form standing before you.",
    signature_move: "The Convergence Itself",
    tell: "Every element from every chapter flickers into visibility at once right before The Convergence Itself.",
    phase2_health_pct: 60,
    phase3_health_pct: 25,
    phase2_behavior: "Draws directly on every boss from every chapter of this entire campaign.",
    phase3_behavior: "Every hint stops mattering. This is a pure test of your complete build, strategy, and everything you've earned.",
    difficultyMult: 10.20,
    stats: { strength: 34, speed: 34, durability: 34, battle_iq: 34, stamina: 34 },
    abilities: [
      { key: "the_convergence_itself", name: "The Convergence Itself", type: "ultimate", desc: "Every threat from every chapter of this campaign, unified into one final strike.", visual: "void_distortion" },
      { key: "campaign_memory", name: "Campaign Memory", type: "passive", desc: "Remembers every fighter who has ever reached this point.", visual: "scan_lines" },
      { key: "final_form_true", name: "Final Form, Truly", type: "buff", desc: "There is nothing left to hold back.", visual: "tech_glow" }
    ],
    primaryReward: "the_convergence_itself",
    helpsAgainst: null,
    hints: {
      0: "This is everything — every chapter, every echo, every lesson this campaign has offered — arriving at once.",
      1: "Every chapter's signature effect flickers into view together right before The Convergence Itself.",
      3: "Recommended counter: there is no single answer. Bring everything you have built across this entire campaign."
    },
    dialogue: {
      lowSpeed: "Every version of speed this campaign has tested still wasn't enough.",
      lowDurability: "You brought a fraction of a complete campaign's worth of build to the sum of all of it.",
      hadCounter: "You brought something worthy of the whole Convergence. That is the highest compliment available here.",
      manyLosses: "Every fighter who has ever reached this point becomes part of what the Convergence remembers. You are not the first. You will not be the last — yet.",
      barelySurvived: "It very nearly wasn't enough. That is not victory. It is also not nothing, not after everything this campaign has asked of you."
    }
  }
];
