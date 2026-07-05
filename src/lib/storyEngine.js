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
  null_field: { statKey: "battle_iq", flatBonus: 5 }
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
