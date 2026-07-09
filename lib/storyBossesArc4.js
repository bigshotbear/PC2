// Chapter 4: "The Circuit" — a professional fighting-league zone. Flashy
// showman characters, all original, continuing the escalation from Arc 3.

export const ARC4_BOSSES = [
  {
    key: "the_ref_whos_seen_everything", level: 28, chapter: 4, name: "The Ref Who's Seen Everything",
    theme: "Decades in the ring watching everyone else fight",
    power_source: "Technology", fighting_style: "Strategist", character_type: "Villain",
    intro: "A grizzled referee steps into the ring himself for once, looking mildly annoyed about it.",
    signature_move: "Three-Count Special",
    tell: "He starts counting on his fingers right before Three-Count Special.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops enforcing rules entirely and starts using every trick he's ever penalized.",
    difficultyMult: 4.20,
    stats: { strength: 20, speed: 18, durability: 26, battle_iq: 32, stamina: 20 },
    abilities: [
      { key: "three_count_special", name: "Three-Count Special", type: "attack", desc: "A precisely timed combination decades in the making.", visual: "impact_cracks" },
      { key: "seen_it_all", name: "Seen It All", type: "passive", desc: "Recognizes and counters repeated tactics instantly.", visual: "scan_lines" },
      { key: "rulebook_knowledge", name: "Rulebook Knowledge", type: "counter", desc: "Punishes predictable patterns hard.", visual: "psychic_glow" }
    ],
    primaryReward: "seen_it_all",
    helpsAgainst: "disqualification_dan",
    hints: {
      0: "He's watched thousands of fights. Repetition is exactly what he's waiting for.",
      1: "He counts on his fingers right before Three-Count Special.",
      3: "Recommended counter: vary your approach — his whole kit punishes predictability."
    },
    dialogue: {
      lowSpeed: "One. Two. Three. You never even tried to beat the count.",
      lowDurability: "I've seen worse. I've also seen better. You're somewhere in between.",
      hadCounter: "You didn't repeat yourself. First time in a while.",
      manyLosses: "Back in my ring again. I'm keeping notes.",
      barelySurvived: "That count nearly finished before you got up. Nearly."
    }
  },
  {
    key: "disqualification_dan", level: 29, chapter: 4, name: "Disqualification Dan",
    theme: "Technically banned from every league in the region",
    power_source: "Technology", fighting_style: "Brawler", character_type: "Villain",
    intro: "A grinning brawler climbs into the ring already holding something he's not supposed to have.",
    signature_move: "Definitely Not Allowed",
    tell: "He glances at the ref before Definitely Not Allowed — there is no ref this time.",
    phase2_health_pct: 40,
    phase2_behavior: "Drops all pretense of following any rules whatsoever.",
    difficultyMult: 4.35,
    stats: { strength: 34, speed: 20, durability: 24, battle_iq: 10, stamina: 22 },
    abilities: [
      { key: "definitely_not_allowed", name: "Definitely Not Allowed", type: "attack", desc: "A rule-breaking strike with real weight behind it.", visual: "impact_cracks" },
      { key: "loophole_hunting", name: "Loophole Hunting", type: "passive", desc: "Always finds an edge, technically legal or not.", visual: "scan_lines" },
      { key: "banned_technique", name: "Banned Technique", type: "buff", desc: "A move so effective it got outlawed.", visual: "muscle_glow" }
    ],
    primaryReward: "banned_technique",
    helpsAgainst: "the_tag_team_of_one",
    hints: {
      0: "There is no rule he won't bend if it means winning.",
      1: "He glances toward the (absent) ref right before Definitely Not Allowed.",
      3: "Recommended counter: The Ref's pattern-reading shuts down his repeated cheap tricks fast."
    },
    dialogue: {
      lowSpeed: "Rules said nothing about giving you a fair head start. I didn't.",
      lowDurability: "Technically, I'm not supposed to hit that hard. Technically.",
      hadCounter: "You read the trick before I threw it. Ref would be proud.",
      manyLosses: "Banned from three leagues and counting. You're helping my case.",
      barelySurvived: "That was borderline even for me. Barely got away with it."
    }
  },
  {
    key: "the_tag_team_of_one", level: 30, chapter: 4, name: "The Tag Team of One",
    theme: "Nobody's figured out how he tags himself in",
    power_source: "Shadow", fighting_style: "Summoner", character_type: "Villain",
    intro: "A single fighter steps in, taps his own shoulder, and somehow becomes a completely different fighting style.",
    signature_move: "Self-Tag Combo",
    tell: "He taps his own shoulder right before Self-Tag Combo switches his whole style.",
    phase2_health_pct: 40,
    phase2_behavior: "Starts switching styles mid-exchange instead of between them — much harder to read.",
    difficultyMult: 4.50,
    stats: { strength: 22, speed: 26, durability: 20, battle_iq: 24, stamina: 26 },
    abilities: [
      { key: "self_tag_combo", name: "Self-Tag Combo", type: "attack", desc: "Switches fighting style mid-fight for a burst of unpredictability.", visual: "shadow_fade" },
      { key: "solo_teamwork", name: "Solo Teamwork", type: "passive", desc: "Somehow coordinates with himself flawlessly.", visual: "psychic_glow" },
      { key: "style_swap", name: "Style Swap", type: "buff", desc: "Temporarily adopts whichever approach counters you best.", visual: "shadow_symbol" }
    ],
    primaryReward: "style_swap",
    helpsAgainst: "ringside_rhonda",
    hints: {
      0: "He fights like two completely different people, because in a sense, he is.",
      1: "The shoulder tap is the tell — Self-Tag Combo follows immediately.",
      3: "Recommended counter: Disqualification Dan's raw pressure doesn't care which 'style' shows up."
    },
    dialogue: {
      lowSpeed: "Tagged myself in faster than you could adjust.",
      lowDurability: "Whichever version of me you were fighting, it worked.",
      hadCounter: "You didn't care which style I brought. Efficient.",
      manyLosses: "I've got more styles than you have attempts, apparently.",
      barelySurvived: "Almost had to tag myself out of that one. Almost."
    }
  },
  {
    key: "ringside_rhonda", level: 31, chapter: 4, name: "Ringside Rhonda",
    theme: "The commentator finally stepped into the ring",
    power_source: "Sound", fighting_style: "Sniper", character_type: "Villain",
    intro: "A former commentator vaults over the barrier, microphone still somehow in hand.",
    signature_move: "Live Commentary",
    tell: "Her mic crackles with feedback right before Live Commentary.",
    phase2_health_pct: 40,
    phase2_behavior: "The crowd noise itself becomes a weapon — disorienting, constant, hard to think through.",
    difficultyMult: 4.65,
    stats: { strength: 14, speed: 24, durability: 18, battle_iq: 30, stamina: 24 },
    abilities: [
      { key: "live_commentary", name: "Live Commentary", type: "debuff", desc: "A disorienting sonic barrage narrated in real time.", visual: "wind_slash" },
      { key: "crowd_hype", name: "Crowd Hype", type: "buff", desc: "Feeds off the noise of a crowd that isn't even really there.", visual: "storm_ring" },
      { key: "play_by_play", name: "Play-by-Play", type: "passive", desc: "Calls out your next move before you make it.", visual: "scan_lines" }
    ],
    primaryReward: "play_by_play",
    helpsAgainst: "the_masked_mystery",
    hints: {
      0: "She's called thousands of matches. She knows exactly what you're about to do.",
      1: "Mic feedback crackles right before Live Commentary hits.",
      3: "Recommended counter: The Tag Team's unpredictability throws off her play-calling."
    },
    dialogue: {
      lowSpeed: "And there it is, folks — too slow, right on schedule.",
      lowDurability: "That's gotta hurt the ratings and the fighter both.",
      hadCounter: "Didn't see that coming — and neither did the audience.",
      manyLosses: "Another rematch! The fans are going to love this rivalry.",
      barelySurvived: "And that's a nail-biter, folks. Nearly a wrap right there."
    }
  },
  {
    key: "the_masked_mystery", level: 32, chapter: 4, name: "The Masked Mystery",
    theme: "Nobody's confirmed who's actually under the mask",
    power_source: "Shadow", fighting_style: "Assassin", character_type: "Antihero",
    intro: "A masked figure enters to no music and no introduction, which somehow makes it worse.",
    signature_move: "Unmasking Strike",
    tell: "The mask's eyes flash right before Unmasking Strike.",
    phase2_health_pct: 40,
    phase2_behavior: "Starts mimicking techniques from every fighter you've faced this chapter.",
    difficultyMult: 4.80,
    stats: { strength: 24, speed: 30, durability: 20, battle_iq: 22, stamina: 20 },
    abilities: [
      { key: "unmasking_strike", name: "Unmasking Strike", type: "attack", desc: "A precise, unreadable finishing blow.", visual: "shadow_fade" },
      { key: "technique_mimicry", name: "Technique Mimicry", type: "passive", desc: "Borrows fighting patterns from recent opponents.", visual: "psychic_glow" },
      { key: "mystery_presence", name: "Mystery Presence", type: "debuff", desc: "Unsettling enough to throw off timing.", visual: "shadow_symbol" }
    ],
    primaryReward: "technique_mimicry",
    helpsAgainst: "championship_belt_karen",
    hints: {
      0: "Nobody knows this fighter's real style — which means every read you make is a guess.",
      1: "The mask's eyes flash right before Unmasking Strike.",
      3: "Recommended counter: Ringside Rhonda's predictive calls cut through the mystery faster than raw stats."
    },
    dialogue: {
      lowSpeed: "Even a mystery can outpace the predictable.",
      lowDurability: "You'll never know whose technique that was. Does it matter now?",
      hadCounter: "You called it before I threw it. Someone's been paying attention.",
      manyLosses: "Same mask. Different lesson every time, apparently not learned.",
      barelySurvived: "The mask nearly came off there. It stays on. For now."
    }
  },
  {
    key: "championship_belt_karen", level: 33, chapter: 4, name: "Championship Belt Karen",
    theme: "She would like to speak to whoever's in charge of this arena",
    power_source: "Light", fighting_style: "Brawler", character_type: "Villain",
    intro: "A fighter in an ostentatious belt strolls in, already complaining about the lighting.",
    signature_move: "Undefeated Streak",
    tell: "She holds up the belt and poses right before Undefeated Streak.",
    phase2_health_pct: 40,
    phase2_behavior: "Takes the fight personally now — noticeably more aggressive, less theatrical.",
    difficultyMult: 4.95,
    stats: { strength: 30, speed: 22, durability: 26, battle_iq: 16, stamina: 22 },
    abilities: [
      { key: "undefeated_streak", name: "Undefeated Streak", type: "buff", desc: "Grows stronger the longer she believes she's winning.", visual: "muscle_glow" },
      { key: "championship_presence", name: "Championship Presence", type: "debuff", desc: "An intimidating aura backed by an actual record.", visual: "storm_ring" },
      { key: "belt_swing", name: "Belt Swing", type: "attack", desc: "The championship belt makes an excellent improvised weapon.", visual: "impact_cracks" }
    ],
    primaryReward: "undefeated_streak",
    helpsAgainst: "the_pyrotechnics_guy",
    hints: {
      0: "She's undefeated, and she will remind you of that fact repeatedly.",
      1: "The belt-pose is the tell — Undefeated Streak follows immediately after.",
      3: "Recommended counter: The Masked Mystery's mimicry copies her own confidence right back at her."
    },
    dialogue: {
      lowSpeed: "I didn't get this belt by being slow. Clearly, neither did you learn that lesson.",
      lowDurability: "The champion doesn't lose. You're proving my point.",
      hadCounter: "You matched my energy. Fine. I'll allow it. Once.",
      manyLosses: "Still chasing the belt? It's not going anywhere, and neither is my record.",
      barelySurvived: "The streak almost ended right there. It didn't. Barely."
    }
  },
  {
    key: "the_pyrotechnics_guy", level: 34, chapter: 4, name: "The Pyrotechnics Guy",
    theme: "The entrance budget clearly went entirely into fire",
    power_source: "Fire", fighting_style: "Brawler", character_type: "Villain",
    intro: "Flames erupt from every corner of the arena as a fighter strolls in, entirely too pleased with the show.",
    signature_move: "Grand Finale",
    tell: "The pyro rigs charge audibly right before Grand Finale.",
    phase2_health_pct: 40,
    phase2_behavior: "Stops holding back the 'big show' moves — full spectacle, full risk, full damage both ways.",
    difficultyMult: 5.10,
    stats: { strength: 28, speed: 20, durability: 16, battle_iq: 14, stamina: 26 },
    abilities: [
      { key: "grand_finale", name: "Grand Finale", type: "ultimate", desc: "An enormous, theatrical, genuinely dangerous finisher.", visual: "fire_trail" },
      { key: "showstopper", name: "Showstopper", type: "attack", desc: "Flashy, but backed by real power.", visual: "fire_feet" },
      { key: "pyro_budget", name: "Pyro Budget", type: "buff", desc: "Somehow always has more explosives ready.", visual: "muscle_glow" }
    ],
    primaryReward: "grand_finale",
    helpsAgainst: "undefeated_underdog",
    hints: {
      0: "All spectacle would be fine if the fire weren't also genuinely dangerous.",
      1: "The pyro rigs audibly charge before Grand Finale — that's your window to close distance.",
      3: "Recommended counter: Championship Belt Karen's Durability tanks the flashy openers with room to spare."
    },
    dialogue: {
      lowSpeed: "You stood in the blast radius. The show demanded it, honestly.",
      lowDurability: "Not my fault the pyro budget went a little over this time.",
      hadCounter: "You got in before the finale charged. Ruined the show, honestly. Respect.",
      manyLosses: "Encore! Encore! Well — you keep coming back, at least.",
      barelySurvived: "The finale nearly went off complete. Nearly. Great show either way."
    }
  },
  {
    key: "undefeated_underdog", level: 35, chapter: 4, name: "Undefeated Underdog",
    theme: "Gets counted out constantly. Never actually loses.",
    power_source: "Ki", fighting_style: "Speedster", character_type: "Hero",
    intro: "A scrappy fighter half the size of everyone else in the chapter grins like he's already won.",
    signature_move: "Comeback Special",
    tell: "He gets knocked down first — that's not a tell, that's the plan.",
    phase2_health_pct: 40,
    phase2_behavior: "The lower his health gets, the more dangerous Comeback Special becomes.",
    difficultyMult: 5.25,
    stats: { strength: 18, speed: 34, durability: 10, battle_iq: 20, stamina: 26 },
    abilities: [
      { key: "comeback_special", name: "Comeback Special", type: "attack", desc: "Gets stronger the more it looks like he's losing.", visual: "fire_trail" },
      { key: "never_say_die", name: "Never Say Die", type: "passive", desc: "Refuses to go down on the first real hit.", visual: "healglow" },
      { key: "underdog_speed", name: "Underdog Speed", type: "mobility", desc: "Faster than his size should allow.", visual: "wind_rings" }
    ],
    primaryReward: "comeback_special",
    helpsAgainst: "the_promoter",
    hints: {
      0: "He wants you to think he's losing. That's exactly when he's most dangerous.",
      1: "Getting knocked down early isn't a mistake on his part — Comeback Special follows.",
      3: "Recommended counter: The Pyrotechnics Guy's raw burst ends it before the comeback can build."
    },
    dialogue: {
      lowSpeed: "Everyone underestimates the small, fast guy. You did too.",
      lowDurability: "I've been counted out more times than you've won fights. Still here.",
      hadCounter: "You finished it before I could turn it around. First time in a while.",
      manyLosses: "Another loss for you, another comeback story for me.",
      barelySurvived: "That comeback nearly didn't have anything left to come back from."
    }
  },
  {
    key: "the_promoter", level: 36, chapter: 4, name: "The Promoter",
    theme: "Owns the league. Writes the rules. Occasionally fights.",
    power_source: "Technology", fighting_style: "Strategist", character_type: "Villain",
    intro: "A sharply dressed figure steps into the ring holding a contract nobody remembers signing.",
    signature_move: "Fine Print",
    tell: "He references the contract right before Fine Print activates.",
    phase2_health_pct: 40,
    phase2_behavior: "Starts changing the arena's own rules mid-fight — hazards shift without warning.",
    difficultyMult: 5.45,
    stats: { strength: 18, speed: 20, durability: 24, battle_iq: 34, stamina: 20 },
    abilities: [
      { key: "fine_print", name: "Fine Print", type: "debuff", desc: "A contractual clause that always seems to favor him.", visual: "psychic_glow" },
      { key: "arena_control", name: "Arena Control", type: "area", desc: "Alters the battlefield's rules on a whim.", visual: "tech_glow" },
      { key: "league_authority", name: "League Authority", type: "passive", desc: "Every ruling somehow goes his way.", visual: "scan_lines" }
    ],
    primaryReward: "arena_control",
    helpsAgainst: "the_circuits_living_legend",
    hints: {
      0: "He owns the arena. That means the arena is never fully on your side.",
      1: "He glances at the contract right before Fine Print triggers.",
      3: "Recommended counter: Undefeated Underdog's chaos-driven comeback ignores rules that don't apply to him anyway."
    },
    dialogue: {
      lowSpeed: "It's all in the contract you never read. Section twelve, actually.",
      lowDurability: "The house always maintains a slight edge. That's just business.",
      hadCounter: "You found the loophole in my own contract. Impressive. Annoying.",
      manyLosses: "Another match on the books. The league thanks you for your continued patronage.",
      barelySurvived: "Fine print almost closed that deal completely. Almost."
    }
  },
  {
    key: "the_circuits_living_legend", level: 37, chapter: 4, name: "The Circuit's Living Legend",
    theme: "Every era of this league, wrapped into one final fighter",
    power_source: "Cosmic Energy", fighting_style: "Balanced", character_type: "God-tier (heavily limited)",
    intro: "A figure walks out to no entrance at all — none is needed. Everyone in the Circuit already knows the name.",
    signature_move: "Hall of Fame Combo",
    tell: "The whole arena goes quiet in respect right before Hall of Fame Combo.",
    phase2_health_pct: 50,
    phase2_behavior: "Begins drawing on techniques from every fighter this chapter has thrown at you.",
    difficultyMult: 5.70,
    stats: { strength: 30, speed: 28, durability: 28, battle_iq: 30, stamina: 26 },
    abilities: [
      { key: "hall_of_fame_combo", name: "Hall of Fame Combo", type: "ultimate", desc: "A finisher built from an entire league's worth of legendary technique.", visual: "void_distortion" },
      { key: "circuit_legacy", name: "Circuit Legacy", type: "passive", desc: "Carries the accumulated skill of every Circuit fighter before them.", visual: "scan_lines" },
      { key: "main_event_energy", name: "Main Event Energy", type: "buff", desc: "Simply performs better when it matters most.", visual: "tech_glow" }
    ],
    primaryReward: "hall_of_fame_combo",
    helpsAgainst: "the_tide_warden",
    hints: {
      0: "This is the Circuit's whole history, standing in front of you as one final test.",
      1: "The crowd's total silence is the tell — Hall of Fame Combo follows immediately after.",
      3: "Recommended counter: no single build wins this — bring your most complete kit from the whole chapter."
    },
    dialogue: {
      lowSpeed: "Every legend before you moved faster than that. Learn from it.",
      lowDurability: "The Circuit doesn't remember fighters who couldn't take a hit.",
      hadCounter: "You brought something the history books haven't seen yet. Rare.",
      manyLosses: "Every attempt becomes part of the Circuit's story now, win or lose.",
      barelySurvived: "That's the closest anyone's come to the main event in a long time."
    }
  }
];
