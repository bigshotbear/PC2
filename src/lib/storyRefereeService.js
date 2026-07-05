import { supabase } from "./supabaseClient";
import { judgeStoryBattle } from "./storyReferee";
import { computeEffectiveStats } from "./storyEngine";

/** Never throws — always returns a usable, validated judgment. */
export async function judgeStoryBattleSafe({ fighter, progress, boss, equippedAbilities, planText }) {
  try {
    const effectiveStats = computeEffectiveStats(fighter, progress);
    const { data, error } = await supabase.functions.invoke("judge-story-battle", {
      body: { fighter, boss, effectiveStats, equippedAbilities, planText }
    });
    if (!error && data && data.winner && data.grade) {
      return data;
    }
  } catch (e) {
    // fall through to local referee
  }
  return judgeStoryBattle({ fighter, progress, boss, equippedAbilities, planText });
}
