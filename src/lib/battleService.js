import { supabase } from "./supabaseClient";
import { runBattle, buildScoreLedger } from "./battleEngine";
import { runGauntletBattle } from "./gauntletEngine";

const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const randSeg = (len) => Array.from({ length: len }, () => CHARSET[Math.floor(Math.random() * CHARSET.length)]).join("");

async function generateUniqueFightResultCode() {
  for (let i = 0; i < 5; i++) {
    const code = `PC-FIGHT-${randSeg(5)}`;
    const { data } = await supabase.from("battle_history").select("id").eq("fight_code", code).maybeSingle();
    if (!data) return code;
  }
  return `PC-FIGHT-${randSeg(5)}${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

/**
 * Executes a full battle from the current user's perspective (always "Player A"),
 * saves the result to battle_history (including the impact breakdown, active
 * badge loadouts, and a shareable completed-fight code), updates the user's
 * profile stats, awards exactly one Victory Ribbon on a win, and updates
 * their team's win/loss record if a saved team was used.
 */
export async function executeBattle({
  user,
  profile,
  myTeam,
  opponentTeam,
  battleMode,
  battleType,
  opponentUserId = null
}) {
  const result = runBattle({ teamA: myTeam, teamB: opponentTeam, battleMode, battleType });
  const iWon = result.winner_side === "A";

  const participantIds = [user.id];
  if (opponentUserId) participantIds.push(opponentUserId);

  const fightCode = await generateUniqueFightResultCode();

  const historyPayload = {
    player_a_id: user.id,
    player_b_id: opponentUserId,
    participant_ids: participantIds,
    player_a_team_id: myTeam.id || null,
    player_b_team_id: opponentTeam.id || null,
    player_a_team_snapshot: myTeam.fighter_snapshots,
    player_b_team_snapshot: opponentTeam.fighter_snapshots,
    battle_mode: battleMode,
    battle_type: battleType,
    arena_name: result.arena_name,
    battle_twist: result.battle_twist,
    player_a_score: result.player_a_score,
    player_b_score: result.player_b_score,
    winner_id: iWon ? user.id : opponentUserId,
    winner_name: result.winner_name,
    loser_id: iWon ? opponentUserId : user.id,
    loser_name: result.loser_name,
    mvp_fighter_name: result.mvp_fighter_name,
    mvp_reason: result.mvp_reason,
    active_synergies_a: result.active_synergies_a,
    active_synergies_b: result.active_synergies_b,
    active_synergies_detail_a: result.active_synergies_detail_a,
    active_synergies_detail_b: result.active_synergies_detail_b,
    fight_summary: result.fight_summary,
    turning_point: result.turning_point,
    why_loser_lost: result.why_loser_lost,
    improvement_tips: result.improvement_tips,
    animation_rounds: result.animation_rounds,
    play_of_match: result.play_of_match,
    active_badges_a: result.active_badges_a,
    active_badges_b: result.active_badges_b,
    impact_breakdown_a: result.impact_breakdown_a,
    impact_breakdown_b: result.impact_breakdown_b,
    score_ledger_a: result.score_ledger_a,
    score_ledger_b: result.score_ledger_b,
    fighter_contributions_a: result.fighter_contributions_a,
    fighter_contributions_b: result.fighter_contributions_b,
    fight_code: fightCode,
    ribbon_awarded: false
  };

  const { data: savedHistory, error: historyError } = await supabase
    .from("battle_history")
    .insert(historyPayload)
    .select()
    .single();

  if (historyError) {
    console.error("Failed to save battle history:", historyError.message);
  }

  let totalRibbons = profile?.total_ribbons || 0;
  if (profile) {
    const totalBattles = (profile.total_battles || 0) + 1;
    const totalWins = (profile.total_wins || 0) + (iWon ? 1 : 0);
    const totalLosses = (profile.total_losses || 0) + (iWon ? 0 : 1);
    const currentStreak = iWon ? (profile.current_win_streak || 0) + 1 : 0;
    const longestStreak = Math.max(profile.longest_win_streak || 0, currentStreak);
    const winRate = totalBattles > 0 ? totalWins / totalBattles : 0;
    totalRibbons = (profile.total_ribbons || 0) + (iWon ? 1 : 0);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        total_battles: totalBattles,
        total_wins: totalWins,
        total_losses: totalLosses,
        current_win_streak: currentStreak,
        longest_win_streak: longestStreak,
        win_rate: winRate,
        total_ribbons: totalRibbons,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);

    if (profileError) console.error("Failed to update profile stats:", profileError.message);
  }

  if (iWon && savedHistory?.id) {
    await supabase.from("battle_history").update({ ribbon_awarded: true }).eq("id", savedHistory.id);
  }

  if (myTeam.id) {
    const wins = (myTeam.wins || 0) + (iWon ? 1 : 0);
    const losses = (myTeam.losses || 0) + (iWon ? 0 : 1);
    const winRate = wins + losses > 0 ? wins / (wins + losses) : 0;

    const { error: teamError } = await supabase
      .from("teams")
      .update({ wins, losses, win_rate: winRate, updated_at: new Date().toISOString() })
      .eq("id", myTeam.id);

    if (teamError) console.error("Failed to update team record:", teamError.message);
  }

  return {
    result: { ...result, fight_code: fightCode },
    iWon,
    savedHistoryId: savedHistory?.id || null,
    totalRibbons
  };
}

/**
 * Executes a Gauntlet Battle (sequential 1v1 matchups with health carryover).
 * Saves the same battle_history shape as Team Battle plus Gauntlet-specific
 * fields (battle_format, gauntlet_matchups, special_result, lineup order/
 * visibility), and awards exactly one Victory Ribbon on a win — never one
 * per knockout.
 */
export async function executeGauntletBattle({
  user,
  profile,
  myLineup,
  opponentLineup,
  battleMode,
  battleType,
  opponentUserId = null,
  myTeamId = null,
  lineupVisibility = "open"
}) {
  const result = runGauntletBattle({ lineupA: myLineup, lineupB: opponentLineup, battleMode, battleType });
  const iWon = result.winner_side === "A";

  const participantIds = [user.id];
  if (opponentUserId) participantIds.push(opponentUserId);

  const fightCode = await generateUniqueFightResultCode();

  const historyPayload = {
    player_a_id: user.id,
    player_b_id: opponentUserId,
    participant_ids: participantIds,
    player_a_team_id: myTeamId,
    player_b_team_id: null,
    player_a_team_snapshot: myLineup,
    player_b_team_snapshot: opponentLineup,
    battle_mode: battleMode,
    battle_type: battleType,
    battle_format: "gauntlet",
    lineup_order_a: myLineup.map((f) => f.fighter_name),
    lineup_order_b: opponentLineup.map((f) => f.fighter_name),
    lineup_visibility: lineupVisibility,
    gauntlet_matchups: result.gauntlet_matchups,
    special_result: result.special_result,
    arena_name: result.arena_name,
    battle_twist: result.battle_twist,
    player_a_score: result.player_a_score,
    player_b_score: result.player_b_score,
    winner_id: iWon ? user.id : opponentUserId,
    winner_name: result.winner_name,
    loser_id: iWon ? opponentUserId : user.id,
    loser_name: result.loser_name,
    mvp_fighter_name: result.mvp_fighter_name,
    mvp_reason: result.mvp_reason,
    active_synergies_a: result.active_synergies_a,
    active_synergies_b: result.active_synergies_b,
    active_synergies_detail_a: result.active_synergies_detail_a,
    active_synergies_detail_b: result.active_synergies_detail_b,
    fight_summary: result.fight_summary,
    turning_point: result.turning_point,
    why_loser_lost: result.why_loser_lost,
    improvement_tips: result.improvement_tips,
    animation_rounds: result.animation_rounds,
    play_of_match: result.play_of_match,
    active_badges_a: result.active_badges_a,
    active_badges_b: result.active_badges_b,
    impact_breakdown_a: result.impact_breakdown_a,
    impact_breakdown_b: result.impact_breakdown_b,
    score_ledger_a: buildScoreLedger(result.impact_breakdown_a, result.player_a_score),
    score_ledger_b: buildScoreLedger(result.impact_breakdown_b, result.player_b_score),
    fighter_contributions_a: result.fighter_contributions_a,
    fighter_contributions_b: result.fighter_contributions_b,
    fight_code: fightCode,
    ribbon_awarded: false
  };

  const { data: savedHistory, error: historyError } = await supabase
    .from("battle_history")
    .insert(historyPayload)
    .select()
    .single();

  if (historyError) console.error("Failed to save gauntlet history:", historyError.message);

  let totalRibbons = profile?.total_ribbons || 0;
  if (profile) {
    const totalBattles = (profile.total_battles || 0) + 1;
    const totalWins = (profile.total_wins || 0) + (iWon ? 1 : 0);
    const totalLosses = (profile.total_losses || 0) + (iWon ? 0 : 1);
    const currentStreak = iWon ? (profile.current_win_streak || 0) + 1 : 0;
    const longestStreak = Math.max(profile.longest_win_streak || 0, currentStreak);
    const winRate = totalBattles > 0 ? totalWins / totalBattles : 0;
    totalRibbons = (profile.total_ribbons || 0) + (iWon ? 1 : 0); // exactly one ribbon, never per knockout

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        total_battles: totalBattles, total_wins: totalWins, total_losses: totalLosses,
        current_win_streak: currentStreak, longest_win_streak: longestStreak,
        win_rate: winRate, total_ribbons: totalRibbons, updated_at: new Date().toISOString()
      })
      .eq("id", user.id);

    if (profileError) console.error("Failed to update profile stats:", profileError.message);
  }

  if (iWon && savedHistory?.id) {
    await supabase.from("battle_history").update({ ribbon_awarded: true }).eq("id", savedHistory.id);
  }

  return {
    result: { ...result, fight_code: fightCode },
    iWon,
    savedHistoryId: savedHistory?.id || null,
    totalRibbons
  };
}
