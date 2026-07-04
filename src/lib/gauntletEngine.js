// ============================================================
// POWER CLASH — GAUNTLET ENGINE
// One fighter per side battles at a time. The winner keeps their
// remaining health (plus a small recovery) into the next matchup;
// the loser is eliminated and the next fighter enters fresh.
// Reuses the exact same per-fighter scoring math as Team Battle.
// ============================================================

import { ARENAS, BATTLE_TWISTS, computeFighterScore, getEquippedBadgeObjects } from "./battleEngine";

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const BETWEEN_ROUND_RECOVERY_PERCENT = 5;

function simulateMatchup(fighterA, healthA, fighterB, healthB, arena, twist) {
  const scoredA = computeFighterScore(fighterA, {
    arena, twist, synergies: [], opponentFighters: [fighterB],
    equippedBadges: getEquippedBadgeObjects(fighterA)
  });
  const scoredB = computeFighterScore(fighterB, {
    arena, twist, synergies: [], opponentFighters: [fighterA],
    equippedBadges: getEquippedBadgeObjects(fighterB)
  });

  const effectiveA = scoredA.score * (0.55 + 0.45 * (healthA / 100));
  const effectiveB = scoredB.score * (0.55 + 0.45 * (healthB / 100));

  const winnerSide = effectiveA >= effectiveB ? "A" : "B";
  const closeness = 1 - Math.abs(effectiveA - effectiveB) / Math.max(1, effectiveA + effectiveB);
  const damagePercent = Math.max(10, Math.min(80, Math.round(15 + closeness * 55 + rand(-5, 5))));

  const winnerStartHealth = winnerSide === "A" ? healthA : healthB;
  const winnerEndHealth = Math.max(5, winnerStartHealth - damagePercent);

  return { scoredA, scoredB, winnerSide, winnerStartHealth, winnerEndHealth, damagePercent };
}

/** lineupA / lineupB: ordered arrays of fighter objects (with .active_badges attached). */
export function runGauntletBattle({ lineupA, lineupB, battleMode, battleType }) {
  const arena = pick(ARENAS);
  const twist = pick(BATTLE_TWISTS);

  let idxA = 0, idxB = 0;
  let healthA = 100, healthB = 100;
  const matchups = [];
  const koCountA = {}, koCountB = {};
  let matchupNumber = 0;
  let currentStreakSide = null, currentStreak = 0;
  const maxStreak = { A: 0, B: 0 };
  const totalScoreBySide = { A: {}, B: {} };

  const accumulate = (side, fighterName, scored) => {
    if (!totalScoreBySide[side][fighterName]) {
      totalScoreBySide[side][fighterName] = { score: 0, breakdown: { damage: 0, defense: 0, support: 0, tactics: 0, badges: 0 } };
    }
    const entry = totalScoreBySide[side][fighterName];
    entry.score += scored.score;
    entry.breakdown.damage += scored.breakdown.damage;
    entry.breakdown.defense += scored.breakdown.defense;
    entry.breakdown.support += scored.breakdown.support;
    entry.breakdown.tactics += scored.breakdown.tactics;
    entry.breakdown.badges += scored.breakdown.badges;
  };

  while (idxA < lineupA.length && idxB < lineupB.length) {
    matchupNumber += 1;
    const fighterA = lineupA[idxA];
    const fighterB = lineupB[idxB];

    const result = simulateMatchup(fighterA, healthA, fighterB, healthB, arena, twist);
    accumulate("A", fighterA.fighter_name, result.scoredA);
    accumulate("B", fighterB.fighter_name, result.scoredB);

    const winnerSide = result.winnerSide;
    if (winnerSide === currentStreakSide) currentStreak += 1;
    else { currentStreakSide = winnerSide; currentStreak = 1; }
    maxStreak[winnerSide] = Math.max(maxStreak[winnerSide], currentStreak);

    matchups.push({
      matchup_number: matchupNumber,
      fighter_a: fighterA.fighter_name,
      fighter_b: fighterB.fighter_name,
      start_health_a: Math.round(healthA),
      start_health_b: Math.round(healthB),
      winner_side: winnerSide,
      damage_percent: result.damagePercent,
      end_health_winner: Math.round(result.winnerEndHealth)
    });

    if (winnerSide === "A") {
      koCountA[fighterA.fighter_name] = (koCountA[fighterA.fighter_name] || 0) + 1;
      healthA = Math.min(100, result.winnerEndHealth + BETWEEN_ROUND_RECOVERY_PERCENT);
      idxB += 1;
      healthB = 100;
    } else {
      koCountB[fighterB.fighter_name] = (koCountB[fighterB.fighter_name] || 0) + 1;
      healthB = Math.min(100, result.winnerEndHealth + BETWEEN_ROUND_RECOVERY_PERCENT);
      idxA += 1;
      healthA = 100;
    }
  }

  const winnerSide = idxA < lineupA.length ? "A" : "B";
  const loserSide = winnerSide === "A" ? "B" : "A";
  const winnerLosses = winnerSide === "A" ? idxA : idxB;
  const loserLineupLen = loserSide === "A" ? lineupA.length : lineupB.length;

  const sweep = winnerLosses === 0;
  const koMap = winnerSide === "A" ? koCountA : koCountB;
  const topKoer = Object.entries(koMap).sort((a, b) => b[1] - a[1])[0];
  const perfectGauntlet = sweep && !!topKoer && topKoer[1] === loserLineupLen;
  const oneFighterCarry = !!topKoer && topKoer[1] >= 2 && topKoer[1] >= Math.ceil(loserLineupLen / 2) + 1;
  const reverseSweep = !sweep && winnerLosses >= (winnerSide === "A" ? lineupA.length : lineupB.length) - 1
    && matchups.length >= 3 && matchups.slice(-3).every((m) => m.winner_side === winnerSide);

  let specialResult = null;
  if (perfectGauntlet) specialResult = "Perfect Gauntlet";
  else if (sweep) specialResult = "Sweep";
  else if (reverseSweep) specialResult = "Reverse Sweep";
  else if (oneFighterCarry) specialResult = "One-Fighter Carry";

  const buildSideTotals = (side) => {
    const entries = Object.entries(totalScoreBySide[side]);
    const totalScore = entries.reduce((s, [, v]) => s + v.score, 0);
    const breakdown = entries.reduce((acc, [, v]) => ({
      damage: acc.damage + v.breakdown.damage,
      defense: acc.defense + v.breakdown.defense,
      support: acc.support + v.breakdown.support,
      tactics: acc.tactics + v.breakdown.tactics,
      badges: acc.badges + v.breakdown.badges
    }), { damage: 0, defense: 0, support: 0, tactics: 0, badges: 0 });
    const contributions = entries.map(([name, v]) => ({
      fighter_name: name,
      total_impact: Math.round(v.score * 10) / 10,
      damage: Math.round(v.breakdown.damage * 10) / 10,
      defense: Math.round(v.breakdown.defense * 10) / 10,
      support: Math.round(v.breakdown.support * 10) / 10,
      tactics: Math.round(v.breakdown.tactics * 10) / 10,
      badges: Math.round(v.breakdown.badges * 10) / 10,
      knockouts: side === "A" ? (koCountA[name] || 0) : (koCountB[name] || 0)
    }));
    return { totalScore, breakdown, contributions };
  };

  const totalsA = buildSideTotals("A");
  const totalsB = buildSideTotals("B");
  const mvpEntry = (winnerSide === "A" ? totalsA : totalsB).contributions.reduce(
    (best, c) => (c.total_impact > (best?.total_impact || 0) ? c : best), null
  );

  return {
    fight_id: `gauntlet_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    battle_mode: battleMode,
    battle_type: battleType,
    battle_format: "gauntlet",
    arena_name: arena.name,
    battle_twist: twist,
    player_a_score: Math.round(totalsA.totalScore * 10) / 10,
    player_b_score: Math.round(totalsB.totalScore * 10) / 10,
    winner_side: winnerSide,
    winner_name: (winnerSide === "A" ? lineupA : lineupB)[winnerSide === "A" ? idxA : idxB]?.fighter_name || "Winner",
    loser_name: (loserSide === "A" ? lineupA : lineupB)[0]?.fighter_name || "Opponent",
    mvp_fighter_name: mvpEntry?.fighter_name || "—",
    mvp_reason: `Completed the most matchups and impact on the winning side (${mvpEntry?.knockouts || 0} knockout${(mvpEntry?.knockouts || 0) === 1 ? "" : "s"}).`,
    fight_summary: `A ${matchups.length}-matchup Gauntlet on ${arena.name}. ${specialResult ? specialResult + "! " : ""}${(winnerSide === "A" ? lineupA : lineupB).length - (winnerSide === "A" ? idxA : idxB)} fighter(s) survived for the winning side.`,
    turning_point: matchups.length > 0
      ? `Matchup ${matchups[matchups.length - 1].matchup_number}: ${matchups[matchups.length - 1].winner_side === "A" ? matchups[matchups.length - 1].fighter_a : matchups[matchups.length - 1].fighter_b} closed out the Gauntlet.`
      : "The Gauntlet ended immediately.",
    why_loser_lost: sweep ? ["Every fighter on this side was eliminated without a single Gauntlet win."] : ["The lineup order left a weak matchup exposed at a critical point."],
    improvement_tips: ["Reorder your lineup — put your strongest all-around fighter as Closer so they carry health into the final matchups."],
    special_result: specialResult,
    sweep,
    knockout_streaks: maxStreak,
    gauntlet_matchups: matchups,
    player_a_team_snapshot: lineupA,
    player_b_team_snapshot: lineupB,
    impact_breakdown_a: { ...totalsA.breakdown, total: totalsA.totalScore },
    impact_breakdown_b: { ...totalsB.breakdown, total: totalsB.totalScore },
    fighter_contributions_a: totalsA.contributions,
    fighter_contributions_b: totalsB.contributions,
    active_badges_a: lineupA.map((f) => ({ fighter_name: f.fighter_name, badges: getEquippedBadgeObjects(f) })),
    active_badges_b: lineupB.map((f) => ({ fighter_name: f.fighter_name, badges: getEquippedBadgeObjects(f) })),
    active_synergies_a: [], active_synergies_b: [],
    active_synergies_detail_a: [], active_synergies_detail_b: [],
    animation_rounds: [],
    play_of_match: matchups.length > 0
      ? `${matchups[matchups.length - 1].winner_side === "A" ? matchups[matchups.length - 1].fighter_a : matchups[matchups.length - 1].fighter_b} finished the Gauntlet at ${matchups[matchups.length - 1].end_health_winner}% health.`
      : null
  };
}
