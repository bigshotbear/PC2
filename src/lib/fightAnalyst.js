// Deterministic Fight Analyst — no AI API required, no ongoing cost.
// Uses only fields that actually exist on the battle_history row.

export function generateFightAnalystReport(battle, iWon) {
  const winnerName = battle.winner_name;
  const myScore = iWon ? battle.player_a_score : battle.player_b_score;
  const theirScore = iWon ? battle.player_b_score : battle.player_a_score;
  const margin = Math.abs((battle.player_a_score || 0) - (battle.player_b_score || 0));
  const closeFight = margin < ((battle.player_a_score || 0) + (battle.player_b_score || 0)) * 0.06;

  const myBadges = (iWon ? battle.active_badges_a : battle.active_badges_b) || [];
  const equippedNames = myBadges.flatMap((f) => (f.badges || []).map((b) => b.name));

  const highlight_reel = battle.play_of_match
    ? `${battle.play_of_match} ${winnerName} closed it out ${(battle.player_a_score || 0).toFixed(1)} — ${(battle.player_b_score || 0).toFixed(1)} on ${battle.arena_name}.`
    : `${winnerName} took it ${(battle.player_a_score || 0).toFixed(1)} — ${(battle.player_b_score || 0).toFixed(1)} on ${battle.arena_name}, with ${(battle.battle_twist || "").toLowerCase()} shaping the pace.`;

  const turning_point = battle.turning_point || "The fight stayed close until the final exchanges tipped the score.";

  let what_worked, what_hurt, recommended_change;

  if (iWon) {
    what_worked = equippedNames.length > 0
      ? `${equippedNames.slice(0, 2).join(" and ")} pulled real weight this fight, backing up ${battle.mvp_fighter_name}'s performance as MVP.`
      : `${battle.mvp_fighter_name} carried the fight as MVP with a ${closeFight ? "narrow" : "clear"} scoring edge.`;
    what_hurt = closeFight
      ? "It was closer than the final score suggests — a slightly better matchup on the enemy's side could have flipped it."
      : "Nothing significant — the build handled this matchup cleanly.";
    recommended_change = closeFight
      ? "Consider equipping a badge that covers your weakest stat to widen the margin next time."
      : "Keep this loadout — it's working. Try it against a tougher Community Build next.";
  } else {
    const reasons = battle.why_loser_lost || [];
    what_worked = reasons.length < 3 ? "The build held its own for most of the fight." : "The core build has real gaps that showed up early.";
    what_hurt = reasons[0] || "The opponent's build simply out-scored this matchup.";
    recommended_change = (battle.improvement_tips && battle.improvement_tips[0]) || "Adjust your active badge loadout to cover the gap the Coach's Report identified above.";
  }

  return {
    highlight_reel,
    turning_point,
    coach_report: { what_worked, what_hurt, recommended_change }
  };
}
