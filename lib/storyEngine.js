import { getBossByLevel, getBossByKey, getAbilityByKey } from "./storyBosses";

const rand = (min, max) => Math.random() * (max - min) + min;

// Each ability's mechanical effect: a flat bonus to one stat, plus a
// meaningful (not guaranteed) edge against the specific boss its home
// boss's weakness-chain entry points to.
export const ABILITY_EFFECTS = {
  stone_armor: { statKey: "durability", flatBonus: 6, vsBonusPct: 0.25 },
  ground_slam: { statKey: "strength", flatBonus: 5 },
  unbreakable_stance: { statKey: "durability", flatBonus: 3 },
  flame_dash: { statKey: "speed", flatBonus: 6, vsBonusPct: 0.25 },
  burning_counter: { statKey: "battle_iq", flatBonus: 4 },
  inferno_rush: { statKey: "strength", flatBonus: 6 },
  cyclone_step: { statKey: "speed", flatBonus: 5, vsBonusPct: 0.25 },
  wind_blade: { statKey: "strength", flatBonus: 4 },
  air_dash: { statKey: "speed", flatBonus: 3 },
  aegis_protocol: { statKey: "durability", flatBonus: 6, vsBonusPct: 0.25 },
  target_scan: { statKey: "battle_iq", flatBonus: 5 },
  overclock: { statKey: "speed", flatBonus: 5 },
  soul_anchor: { statKey: "durability", flatBonus: 5, vsBonusPct: 0.25 },
  shadow_step: { statKey: "speed", flatBonus: 4 },
  life_drain: { statKey: "stamina", flatBonus: 5 },
  lightning_counter: { statKey: "battle_iq", flatBonus: 6, vsBonusPct: 0.25 },
  thunder_step: { statKey: "speed", flatBonus: 5 },
  storm_field: { statKey: "battle_iq", flatBonus: 4 },
  void_collapse: { statKey: "strength", flatBonus: 8 },
  echo_step: { statKey: "speed", flatBonus: 6 },
  null_field: { statKey: "battle_iq", flatBonus: 5 },

  // --- Arc 2: The Society ---
  no_hands_discount: { statKey: "durability", flatBonus: 6, vsBonusPct: 0.25 },
  puddle_slap: { statKey: "strength", flatBonus: 4 },
  gutter_dive: { statKey: "speed", flatBonus: 3 },
  it_just_bounces_off: { statKey: "durability", flatBonus: 6, vsBonusPct: 0.25 },
  overdrive_haymaker: { statKey: "strength", flatBonus: 6 },
  warranty_void: { statKey: "strength", flatBonus: 4 },
  tingly_numb_poke: { statKey: "battle_iq", flatBonus: 6, vsBonusPct: 0.25 },
  quiet_step: { statKey: "speed", flatBonus: 5 },
  blade_lecture: { statKey: "battle_iq", flatBonus: 3 },
  one_more_rep: { statKey: "strength", flatBonus: 8, vsBonusPct: 0.25 },
  protein_reserves: { statKey: "stamina", flatBonus: 5 },
  gym_bro_wisdom: { statKey: "stamina", flatBonus: 3 },
  five_finger_discount: { statKey: "battle_iq", flatBonus: 6, vsBonusPct: 0.25 },
  polite_negotiation: { statKey: "battle_iq", flatBonus: 4 },
  return_policy: { statKey: "battle_iq", flatBonus: 3 },
  its_just_dust_now: { statKey: "strength", flatBonus: 6, vsBonusPct: 0.25 },
  structural_integrity_denial: { statKey: "strength", flatBonus: 4 },
  calm_before_the_crumble: { statKey: "durability", flatBonus: 3 },
  regenerate_exe: { statKey: "stamina", flatBonus: 6, vsBonusPct: 0.25 },
  understudy_footwork: { statKey: "speed", flatBonus: 5 },
  second_wind_drink: { statKey: "stamina", flatBonus: 4 },
  big_mad_energy: { statKey: "strength", flatBonus: 6, vsBonusPct: 0.25 },
  corporate_composure: { statKey: "durability", flatBonus: 4 },
  email_the_whole_team: { statKey: "battle_iq", flatBonus: 3 },
  delete_city_bat: { statKey: "strength", flatBonus: 8, vsBonusPct: 0.25 },
  too_much_power: { statKey: "strength", flatBonus: 4 },
  unstable_flicker: { statKey: "speed", flatBonus: 4 },
  one_power_to_rule: { statKey: "strength", flatBonus: 8 },
  collector_of_everything: { statKey: "battle_iq", flatBonus: 5 },
  final_form_no_really: { statKey: "stamina", flatBonus: 5 },

  // --- Chapter 3: The Wilds ---
  root_slam: { statKey: "strength", flatBonus: 6 },
  bark_skin: { statKey: "durability", flatBonus: 7, vsBonusPct: 0.25 },
  regrowth: { statKey: "stamina", flatBonus: 4 },
  trash_panda_frenzy: { statKey: "speed", flatBonus: 6 },
  startling_agility: { statKey: "speed", flatBonus: 6, vsBonusPct: 0.25 },
  feral_instinct: { statKey: "battle_iq", flatBonus: 4 },
  eviction_notice: { statKey: "strength", flatBonus: 7 },
  property_lines: { statKey: "strength", flatBonus: 5, vsBonusPct: 0.25 },
  landlord_energy: { statKey: "stamina", flatBonus: 4 },
  ember_volley: { statKey: "battle_iq", flatBonus: 5 },
  controlled_burn: { statKey: "battle_iq", flatBonus: 6, vsBonusPct: 0.25 },
  ranger_focus: { statKey: "battle_iq", flatBonus: 4 },
  full_hive_assault: { statKey: "stamina", flatBonus: 6 },
  sting_over_time: { statKey: "stamina", flatBonus: 6, vsBonusPct: 0.25 },
  hive_mind: { statKey: "battle_iq", flatBonus: 4 },
  storms_reckoning: { statKey: "durability", flatBonus: 7 },
  grounded_stance: { statKey: "durability", flatBonus: 7, vsBonusPct: 0.25 },
  static_buildup: { statKey: "stamina", flatBonus: 4 },
  ambush_strike: { statKey: "speed", flatBonus: 7 },
  apex_instincts: { statKey: "battle_iq", flatBonus: 6, vsBonusPct: 0.25 },
  predator_focus: { statKey: "speed", flatBonus: 4 },
  ancient_resolve: { statKey: "durability", flatBonus: 8, vsBonusPct: 0.25 },
  millennia_of_patience: { statKey: "durability", flatBonus: 5 },
  root_network: { statKey: "strength", flatBonus: 5 },
  wildfire_cascade: { statKey: "strength", flatBonus: 8, vsBonusPct: 0.25 },
  natures_fury: { statKey: "strength", flatBonus: 5 },
  wilds_memory: { statKey: "battle_iq", flatBonus: 5 },
  everything_ive_learned: { statKey: "battle_iq", flatBonus: 8 },
  chapter_scholar: { statKey: "battle_iq", flatBonus: 5 },
  final_warning: { statKey: "battle_iq", flatBonus: 5 },

  // --- Chapter 4: The Circuit ---
  three_count_special: { statKey: "battle_iq", flatBonus: 6 },
  seen_it_all: { statKey: "battle_iq", flatBonus: 7, vsBonusPct: 0.25 },
  rulebook_knowledge: { statKey: "battle_iq", flatBonus: 4 },
  definitely_not_allowed: { statKey: "strength", flatBonus: 7 },
  loophole_hunting: { statKey: "battle_iq", flatBonus: 4 },
  banned_technique: { statKey: "strength", flatBonus: 6, vsBonusPct: 0.25 },
  self_tag_combo: { statKey: "speed", flatBonus: 6 },
  solo_teamwork: { statKey: "battle_iq", flatBonus: 4 },
  style_swap: { statKey: "speed", flatBonus: 6, vsBonusPct: 0.25 },
  live_commentary: { statKey: "battle_iq", flatBonus: 6 },
  crowd_hype: { statKey: "stamina", flatBonus: 4 },
  play_by_play: { statKey: "battle_iq", flatBonus: 7, vsBonusPct: 0.25 },
  unmasking_strike: { statKey: "speed", flatBonus: 7 },
  technique_mimicry: { statKey: "battle_iq", flatBonus: 6, vsBonusPct: 0.25 },
  mystery_presence: { statKey: "speed", flatBonus: 4 },
  undefeated_streak: { statKey: "strength", flatBonus: 6, vsBonusPct: 0.25 },
  championship_presence: { statKey: "battle_iq", flatBonus: 4 },
  belt_swing: { statKey: "strength", flatBonus: 6 },
  grand_finale: { statKey: "strength", flatBonus: 8, vsBonusPct: 0.25 },
  showstopper: { statKey: "strength", flatBonus: 5 },
  pyro_budget: { statKey: "stamina", flatBonus: 4 },
  comeback_special: { statKey: "speed", flatBonus: 8, vsBonusPct: 0.25 },
  never_say_die: { statKey: "durability", flatBonus: 5 },
  underdog_speed: { statKey: "speed", flatBonus: 5 },
  fine_print: { statKey: "battle_iq", flatBonus: 6 },
  arena_control: { statKey: "battle_iq", flatBonus: 7, vsBonusPct: 0.25 },
  league_authority: { statKey: "battle_iq", flatBonus: 4 },
  hall_of_fame_combo: { statKey: "strength", flatBonus: 9 },
  circuit_legacy: { statKey: "battle_iq", flatBonus: 6 },
  main_event_energy: { statKey: "stamina", flatBonus: 6 },

  // --- Chapter 5: The Deep ---
  crushing_tide: { statKey: "strength", flatBonus: 7 },
  tidal_guard: { statKey: "durability", flatBonus: 8, vsBonusPct: 0.25 },
  current_control: { statKey: "battle_iq", flatBonus: 4 },
  lure_and_strike: { statKey: "speed", flatBonus: 7 },
  false_safety: { statKey: "battle_iq", flatBonus: 6, vsBonusPct: 0.25 },
  deep_camouflage: { statKey: "speed", flatBonus: 4 },
  depth_charge: { statKey: "strength", flatBonus: 7 },
  crush_resistant: { statKey: "durability", flatBonus: 8, vsBonusPct: 0.25 },
  pressure_buildup: { statKey: "stamina", flatBonus: 5 },
  maelstrom_command: { statKey: "battle_iq", flatBonus: 7, vsBonusPct: 0.25 },
  ghostly_authority: { statKey: "battle_iq", flatBonus: 4 },
  sunken_tactics: { statKey: "battle_iq", flatBonus: 5 },
  borrowed_grasp: { statKey: "strength", flatBonus: 6, vsBonusPct: 0.25 },
  apprentice_instinct: { statKey: "battle_iq", flatBonus: 4 },
  many_hands: { statKey: "strength", flatBonus: 5 },
  shock_current: { statKey: "speed", flatBonus: 7 },
  eel_speed: { statKey: "speed", flatBonus: 8, vsBonusPct: 0.25 },
  live_wire: { statKey: "speed", flatBonus: 4 },
  too_good_to_be_true: { statKey: "battle_iq", flatBonus: 6 },
  smooth_talker: { statKey: "battle_iq", flatBonus: 4 },
  bait_and_switch: { statKey: "battle_iq", flatBonus: 7, vsBonusPct: 0.25 },
  the_deepest_point: { statKey: "strength", flatBonus: 8 },
  abyssal_patience: { statKey: "durability", flatBonus: 7, vsBonusPct: 0.25 },
  crushing_embrace: { statKey: "durability", flatBonus: 5 },
  everything_youve_missed: { statKey: "speed", flatBonus: 7 },
  watching_presence: { statKey: "battle_iq", flatBonus: 8, vsBonusPct: 0.25 },
  abyssal_speed: { statKey: "speed", flatBonus: 5 },
  abyssal_reckoning: { statKey: "strength", flatBonus: 9 },
  leviathan_bloodline: { statKey: "durability", flatBonus: 7 },
  depths_authority: { statKey: "battle_iq", flatBonus: 6 },

  // --- Chapter 6: The Convergence (finale) ---
  rift_pulse: { statKey: "battle_iq", flatBonus: 6 },
  unstable_form: { statKey: "speed", flatBonus: 6, vsBonusPct: 0.25 },
  echo_static: { statKey: "battle_iq", flatBonus: 4 },
  remembered_ground_slam: { statKey: "strength", flatBonus: 7 },
  hardened_memory: { statKey: "durability", flatBonus: 8, vsBonusPct: 0.25 },
  echo_instability: { statKey: "durability", flatBonus: 4 },
  corrupted_glomp: { statKey: "strength", flatBonus: 6 },
  echo_resistance: { statKey: "durability", flatBonus: 8, vsBonusPct: 0.25 },
  memory_split: { statKey: "stamina", flatBonus: 5 },
  corrupted_discount: { statKey: "battle_iq", flatBonus: 7 },
  echo_negotiation: { statKey: "battle_iq", flatBonus: 6, vsBonusPct: 0.25 },
  compound_interest: { statKey: "battle_iq", flatBonus: 5 },
  corrupted_dust: { statKey: "strength", flatBonus: 7 },
  echo_denial: { statKey: "strength", flatBonus: 6, vsBonusPct: 0.25 },
  patient_corruption: { statKey: "durability", flatBonus: 5 },
  corrupted_lessons: { statKey: "battle_iq", flatBonus: 9 },
  echo_scholarship: { statKey: "battle_iq", flatBonus: 8, vsBonusPct: 0.25 },
  corrupted_warning: { statKey: "battle_iq", flatBonus: 5 },
  corrupted_count: { statKey: "battle_iq", flatBonus: 7 },
  echo_officiating: { statKey: "battle_iq", flatBonus: 8, vsBonusPct: 0.25 },
  corrupted_rulebook: { statKey: "battle_iq", flatBonus: 5 },
  corrupted_contract: { statKey: "battle_iq", flatBonus: 7 },
  echo_authority: { statKey: "battle_iq", flatBonus: 8, vsBonusPct: 0.25 },
  corrupted_fine_print: { statKey: "battle_iq", flatBonus: 5 },
  corrupted_reckoning: { statKey: "strength", flatBonus: 9 },
  echo_bloodline: { statKey: "durability", flatBonus: 7 },
  corrupted_authority: { statKey: "battle_iq", flatBonus: 6 },
  cascading_instability: { statKey: "strength", flatBonus: 8 },
  fragmentary_defense: { statKey: "durability", flatBonus: 7, vsBonusPct: 0.25 },
  convergent_chaos: { statKey: "speed", flatBonus: 5 },
  design_flaw: { statKey: "battle_iq", flatBonus: 8 },
  architects_intent: { statKey: "battle_iq", flatBonus: 8 },
  blueprint_shift: { statKey: "battle_iq", flatBonus: 6 },
  full_blueprint: { statKey: "strength", flatBonus: 9 },
  total_awareness: { statKey: "battle_iq", flatBonus: 9 },
  unbound_design: { statKey: "stamina", flatBonus: 7 },
  the_convergence_itself: { statKey: "strength", flatBonus: 10 },
  campaign_memory: { statKey: "battle_iq", flatBonus: 9 },
  final_form_true: { statKey: "stamina", flatBonus: 8 }
};

export const STAT_KEYS = ["strength", "speed", "durability", "battle_iq", "stamina"];

export function computeEffectiveStats(fighter, progress) {
  return {
    strength: fighter.strength + (progress.strength_bonus || 0),
    speed: fighter.speed + (progress.speed_bonus || 0),
    durability: fighter.durability + (progress.durability_bonus || 0),
    battle_iq: fighter.battle_iq + (progress.battle_iq_bonus || 0),
    stamina: fighter.stamina + (progress.stamina_bonus || 0)
  };
}

function weightedTotal(stats) {
  return stats.strength + stats.speed + stats.durability + stats.battle_iq * 1.1 + stats.stamina;
}

function checkMilestones(effectiveStats) {
  const milestones = [];
  STAT_KEYS.forEach((key) => {
    const v = effectiveStats[key];
    if (v >= 30) milestones.push({ stat: key, tier: 30 });
    else if (v >= 20) milestones.push({ stat: key, tier: 20 });
    else if (v >= 15) milestones.push({ stat: key, tier: 15 });
  });
  return milestones;
}

/**
 * Resolves one Story Mode level. This is a compressed (single-comparison)
 * resolution rather than a full round-by-round sim — it produces a real,
 * varied result (grade, margin, phase reached) from the actual stats and
 * equipped abilities, but it is not the same round-by-round engine used
 * in multiplayer battles.
 */
export function runStoryLevelBattle({ fighter, progress, equippedAbilityKeys, level }) {
  const boss = getBossByLevel(level);
  const baseEffective = computeEffectiveStats(fighter, progress);
  const effective = { ...baseEffective };

  const equippedAbilities = (equippedAbilityKeys || []).map(getAbilityByKey).filter(Boolean);
  let vsBonusPct = 0;

  equippedAbilities.forEach((ability) => {
    const fx = ABILITY_EFFECTS[ability.key];
    if (!fx) return;
    effective[fx.statKey] += fx.flatBonus;

    if (fx.vsBonusPct) {
      const homeBoss = getBossByKey(ability.source_boss);
      if (homeBoss && homeBoss.helpsAgainst === boss.key) {
        vsBonusPct += fx.vsBonusPct;
      }
    }
  });
  vsBonusPct = Math.min(0.3, vsBonusPct);

  const playerScore = weightedTotal(effective) * (1 + vsBonusPct) * rand(0.92, 1.08);

  const totalPermanentBonus =
    (progress.strength_bonus || 0) + (progress.speed_bonus || 0) + (progress.durability_bonus || 0) +
    (progress.battle_iq_bonus || 0) + (progress.stamina_bonus || 0);
  const bossBaseTotal = weightedTotal(boss.stats);
  const bossScore = (bossBaseTotal * boss.difficultyMult + totalPermanentBonus * 0.2) * rand(0.94, 1.06);

  const won = playerScore >= bossScore;
  const margin = Math.abs(playerScore - bossScore) / Math.max(1, playerScore + bossScore);

  const bossLowestHealthPct = won ? Math.max(0, Math.round(30 - margin * 60)) : Math.round(30 + margin * 40);
  const playerFinalHealthPct = won ? Math.round(35 + margin * 55) : 0;
  const reachedPhase2 = bossLowestHealthPct <= (boss.phase2_health_pct || 40);
  const reachedPhase3 = !!boss.phase3_health_pct && bossLowestHealthPct <= boss.phase3_health_pct;

  let grade = "C";
  if (won) {
    if (margin > 0.35 && playerFinalHealthPct > 70) grade = "S";
    else if (margin > 0.2 && playerFinalHealthPct > 50) grade = "A";
    else if (margin > 0.08) grade = "B";
  }

  const milestones = checkMilestones(effective);

  return {
    won, grade, margin: Math.round(margin * 100) / 100,
    playerScore: Math.round(playerScore * 10) / 10,
    bossScore: Math.round(bossScore * 10) / 10,
    bossLowestHealthPct, playerFinalHealthPct,
    reachedPhase2, reachedPhase3,
    boss, effectiveStats: effective, milestones,
    usedRecommendedCounter: vsBonusPct > 0,
    weakestStat: STAT_KEYS.reduce((min, k) => (effective[k] < effective[min] ? k : min), STAT_KEYS[0])
  };
}
