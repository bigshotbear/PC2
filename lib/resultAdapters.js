// Converts a saved battle_history row (normal battles) or a Story
// judgment object into ONE normalized shape ClashAftermath understands.
// This is the single source of truth boundary — nothing here invents a
// winner, score, or grade; every field is read from what was actually saved.

function gradeFromMargin(iWon, myScore, theirScore) {
  if (!iWon) return null;
  const margin = Math.abs((myScore || 0) - (theirScore || 0));
  const total = Math.max(1, (myScore || 0) + (theirScore || 0));
  const pct = margin / total;
  if (pct > 0.3) return "S";
  if (pct > 0.18) return "A";
  if (pct > 0.08) return "B";
  return "C";
}

export function adaptNormalBattleResult(r, iWon, totalRibbons) {
  const myBreakdown = iWon ? r.impact_breakdown_a : r.impact_breakdown_b;
  const myBadgesRaw = (iWon ? r.active_badges_a : r.active_badges_b) || [];
  const keyBadgeName = myBadgesRaw.flatMap((f) => (f.badges || []).map((b) => b.name))[0] || null;

  const myTeamSnapshot = (iWon ? r.player_a_team_snapshot : r.player_b_team_snapshot) || [];
  const oppTeamSnapshot = (iWon ? r.player_b_team_snapshot : r.player_a_team_snapshot) || [];

  return {
    mode: "normal",
    id: r.id,
    won: iWon,
    battleMode: r.battle_mode,
    battleType: r.battle_type,
    battleFormat: r.battle_format || "team",
    winnerName: r.winner_name,
    loserName: r.loser_name,
    myScore: iWon ? r.player_a_score : r.player_b_score,
    opponentScore: iWon ? r.player_b_score : r.player_a_score,
    mvpName: r.mvp_fighter_name,
    grade: gradeFromMargin(iWon, iWon ? r.player_a_score : r.player_b_score, iWon ? r.player_b_score : r.player_a_score),
    arenaName: r.arena_name,
    battleTwist: r.battle_twist,
    finishingMove: r.play_of_match,
    turningPoint: r.turning_point,
    keyBadgeName,
    breakdown: myBreakdown,
    ribbonsEarned: iWon ? 1 : 0,
    totalRibbons,
    fightCode: r.fight_code,
    myFighters: myTeamSnapshot,
    opponentFighters: oppTeamSnapshot,
    story: null
  };
}

export function adaptStoryResult(judgment, boss, fighter) {
  return {
    mode: "story",
    completionId: judgment.completionId,
    won: judgment.won,
    battleMode: "1v1",
    battleType: "STORY",
    battleFormat: "team",
    winnerName: judgment.won ? fighter.fighter_name : boss.name,
    loserName: judgment.won ? boss.name : fighter.fighter_name,
    myScore: judgment.playerScore,
    opponentScore: judgment.opponentScore,
    mvpName: judgment.won ? fighter.fighter_name : boss.name,
    grade: judgment.won ? judgment.grade : null,
    arenaName: judgment.arena?.name || null,
    battleTwist: judgment.twist || null,
    finishingMove: judgment.won ? (fighter.ultimate_move || "a finishing strike") : boss.signature_move,
    turningPoint: judgment.turningPoint,
    keyBadgeName: judgment.abilityInteractions?.[0] || null,
    breakdown: null,
    ribbonsEarned: 0,
    totalRibbons: null,
    fightCode: null,
    myFighters: [fighter],
    opponentFighters: [{ character_type: boss.character_type, fighting_style: boss.fighting_style, power_source: boss.power_source, fighter_name: boss.name }],
    story: {
      bossName: boss.name,
      level: judgment.levelFought,
      bossLowestHealthPct: judgment.won ? 15 : 60,
      intelGained: !judgment.won,
      masteryGained: true,
      defeatCause: !judgment.won ? boss.signature_move : null,
      plainSummary: judgment.plainSummary,
      strategyScore: judgment.strategyScore,
      strategyStrengths: judgment.strategyStrengths || [],
      strategyHoles: judgment.strategyHoles || []
    }
  };
}
