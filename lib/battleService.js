import { supabase } from "./supabaseClient";
import { runBattle, buildScoreLedger } from "./battleEngine";
import { runGauntletBattle } from "./gauntletEngine";
import { generateIdempotencyKey } from "./idempotencyService";

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

function buildBaseHistoryPayload({ user, result, opponentUserId, myTeamSnapshot, opponentTeamSnapshot, myTeamId, opponentTeamId, battleMode, battleType, iWon, fightCode, idempotencyKey, extra = {} }) {
  const participantIds = [user.id];
  if (opponentUserId) participantIds.push(opponentUserId);

  return {
    id: crypto.randomUUID(),
    player_a_id: user.id,
    player_b_id: opponentUserId,
    participant_ids: participantIds,
    player_a_team_id: myTeamId || null,
    player_b_team_id: opponentTeamId || null,
    player_a_team_snapshot: myTeamSnapshot,
    player_b_team_snapshot: opponentTeamSnapshot,
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
    fighter_contributions_a: result.fighter_contributions_a,
    fighter_contributions_b: result.fighter_contributions_b,
    fight_code: fightCode,
    ribbon_awarded: false,
    client_idempotency_key: idempotencyKey,
    ...extra
  };
}

/** Calls the atomic complete_normal_battle RPC — history insert + all profile stat updates happen in one DB transaction. */
async function saveBattleAtomic(payload, idempotencyKey) {
  console.log("[battle:save:start]", { idempotencyKey, playerA: payload.player_a_id, mode: payload.battle_mode, type: payload.battle_type });
  const { data, error } = await supabase.rpc("complete_normal_battle", {
    p_idempotency_key: idempotencyKey,
    p_payload: payload
  });
  if (error) {
    console.error("[battle:save:rpc-error]", { idempotencyKey, message: error.message });
    throw new Error("Battle completed, but progress could not be saved. " + error.message);
  }
  console.log("[battle:save:done]", { idempotencyKey, alreadyProcessed: data.already_processed, battleId: data.battle?.id });
  return data;
}

/**
 * Executes a full battle from the current user's perspective (always "Player A").
 * idempotencyKey MUST be generated once by the caller and reused on every
 * retry of the same attempt (survive refresh via idempotencyService) —
 * the RPC guarantees the same key can never save or score twice.
 */
export async function executeBattle({
  user,
  profile,
  myTeam,
  opponentTeam,
  battleMode,
  battleType,
  opponentUserId = null,
  idempotencyKey = null
}) {
  const key = idempotencyKey || generateIdempotencyKey(user.id);
  const result = runBattle({ teamA: myTeam, teamB: opponentTeam, battleMode, battleType });
  const iWon = result.winner_side === "A";
  const fightCode = await generateUniqueFightResultCode();

  const payload = buildBaseHistoryPayload({
    user, result, opponentUserId, battleMode, battleType, iWon, fightCode, idempotencyKey: key,
    myTeamSnapshot: myTeam.fighter_snapshots, opponentTeamSnapshot: opponentTeam.fighter_snapshots,
    myTeamId: myTeam.id, opponentTeamId: opponentTeam.id,
    extra: { score_ledger_a: result.score_ledger_a, score_ledger_b: result.score_ledger_b }
  });

  const saved = await saveBattleAtomic(payload, key);

  if (myTeam.id && !saved.already_processed) {
    const wins = (myTeam.wins || 0) + (iWon ? 1 : 0);
    const losses = (myTeam.losses || 0) + (iWon ? 0 : 1);
    const winRate = wins + losses > 0 ? wins / (wins + losses) : 0;
    const { error: teamError } = await supabase
      .from("teams")
      .update({ wins, losses, win_rate: winRate, updated_at: new Date().toISOString() })
      .eq("id", myTeam.id);
    if (teamError) console.error("[battle:team-update-failed]", { teamId: myTeam.id, error: teamError.message });
  }

  return {
    result: { ...result, fight_code: fightCode, id: saved.battle.id },
    iWon: saved.battle.winner_id === user.id,
    savedHistoryId: saved.battle.id,
    totalRibbons: saved.total_ribbons,
    idempotencyKey: key
  };
}

/**
 * Executes a Gauntlet Battle. Same atomic save path as a normal battle —
 * awards exactly one Victory Ribbon on a win, never one per knockout.
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
  lineupVisibility = "open",
  idempotencyKey = null
}) {
  const key = idempotencyKey || generateIdempotencyKey(user.id);
  const result = runGauntletBattle({ lineupA: myLineup, lineupB: opponentLineup, battleMode, battleType });
  const iWon = result.winner_side === "A";
  const fightCode = await generateUniqueFightResultCode();

  const payload = buildBaseHistoryPayload({
    user, result, opponentUserId, battleMode, battleType, iWon, fightCode, idempotencyKey: key,
    myTeamSnapshot: myLineup, opponentTeamSnapshot: opponentLineup, myTeamId, opponentTeamId: null,
    extra: {
      battle_format: "gauntlet",
      lineup_order_a: myLineup.map((f) => f.fighter_name),
      lineup_order_b: opponentLineup.map((f) => f.fighter_name),
      lineup_visibility: lineupVisibility,
      gauntlet_matchups: result.gauntlet_matchups,
      special_result: result.special_result,
      score_ledger_a: buildScoreLedger(result.impact_breakdown_a, result.player_a_score),
      score_ledger_b: buildScoreLedger(result.impact_breakdown_b, result.player_b_score)
    }
  });

  const saved = await saveBattleAtomic(payload, key);

  return {
    result: { ...result, fight_code: fightCode, id: saved.battle.id },
    iWon: saved.battle.winner_id === user.id,
    savedHistoryId: saved.battle.id,
    totalRibbons: saved.total_ribbons,
    idempotencyKey: key
  };
}
