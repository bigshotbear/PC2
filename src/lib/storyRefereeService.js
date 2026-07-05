import { supabase } from "./supabaseClient";
import { judgeStoryBattle } from "./storyReferee";
import { computeEffectiveStats } from "./storyEngine";

function synthesizeHealthTimeline(won, margin) {
  const loserFinal = Math.max(0, Math.round(20 - margin * 0.4));
  const winnerFinal = Math.max(20, Math.round(75 - margin * 0.3));
  const steps = 5;
  const timeline = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const winnerHealth = Math.round(100 - (100 - winnerFinal) * t);
    const loserHealth = Math.round(100 - (100 - loserFinal) * t);
    timeline.push(won ? { player: winnerHealth, opponent: loserHealth } : { player: loserHealth, opponent: winnerHealth });
  }
  return timeline;
}

/** Never throws — always returns a usable, validated judgment. */
export async function judgeStoryBattleSafe({ fighter, progress, boss, equippedAbilities, planText, timesDefeated = 0 }) {
  try {
    const effectiveStats = computeEffectiveStats(fighter, progress);
    const { data, error } = await supabase.functions.invoke("judge-story-battle", {
      body: { fighter, boss, effectiveStats, equippedAbilities, planText }
    });
    if (!error && data && data.winner && data.grade) {
      if (!data.healthTimeline) {
        const margin = Math.abs((data.playerScore || 0) - (data.opponentScore || 0));
        data.healthTimeline = synthesizeHealthTimeline(data.winner === "player", margin);
        data.margin = margin;
      }
      return data;
    }
  } catch (e) {
    // fall through to local referee
  }
  return judgeStoryBattle({ fighter, progress, boss, equippedAbilities, planText, timesDefeated });
}
