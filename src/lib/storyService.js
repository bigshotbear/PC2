import { supabase } from "./supabaseClient";

export async function getOrCreateStoryProgress(userId, fighterId) {
  const { data: existing } = await supabase
    .from("story_fighter_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("fighter_id", fighterId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("story_fighter_progress")
    .insert({ user_id: userId, fighter_id: fighterId })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export async function updateStoryProgress(id, fields) {
  const { data, error } = await supabase
    .from("story_fighter_progress")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getOrCreateBossProgress(userId, fighterId, bossKey) {
  const { data: existing } = await supabase
    .from("story_boss_progress")
    .select("*")
    .eq("user_id", userId).eq("fighter_id", fighterId).eq("boss_key", bossKey)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("story_boss_progress")
    .insert({ user_id: userId, fighter_id: fighterId, boss_key: bossKey })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export async function getAllBossProgress(userId, fighterId) {
  const { data } = await supabase
    .from("story_boss_progress")
    .select("*")
    .eq("user_id", userId).eq("fighter_id", fighterId);
  return data || [];
}

export async function recordBossResult(userId, fighterId, bossKey, storyResult, equippedAbilityKeys) {
  const existing = await getOrCreateBossProgress(userId, fighterId, bossKey);

  const timesFought = (existing.times_fought || 0) + 1;
  const timesDefeated = (existing.times_defeated || 0) + (storyResult.won ? 1 : 0);
  const timesLost = (existing.times_lost || 0) + (storyResult.won ? 0 : 1);

  const intelLevel = timesLost >= 3 ? 3 : timesLost >= 1 ? Math.max(existing.intel_level || 0, 1) : (existing.intel_level || 0);
  const masteryLevel = timesFought >= 6 ? 3 : timesFought >= 4 ? Math.max(existing.mastery_level || 0, 2) : timesFought >= 2 ? Math.max(existing.mastery_level || 0, 1) : (existing.mastery_level || 0);

  const gradeRank = { S: 4, A: 3, B: 2, C: 1 };
  const bestGrade = storyResult.won && (!existing.best_victory_grade || gradeRank[storyResult.grade] > gradeRank[existing.best_victory_grade])
    ? storyResult.grade
    : existing.best_victory_grade;

  const { error } = await supabase
    .from("story_boss_progress")
    .update({
      times_fought: timesFought,
      times_defeated: timesDefeated,
      times_lost: timesLost,
      last_defeat_cause: storyResult.won ? existing.last_defeat_cause : (storyResult.boss.signature_move || "unknown"),
      last_equipped_abilities: equippedAbilityKeys || [],
      highest_damage: Math.max(existing.highest_damage || 0, 100 - storyResult.bossLowestHealthPct),
      lowest_boss_health: Math.min(existing.lowest_boss_health ?? 100, storyResult.bossLowestHealthPct),
      best_victory_grade: bestGrade,
      intel_level: intelLevel,
      mastery_level: masteryLevel,
      updated_at: new Date().toISOString()
    })
    .eq("id", existing.id);

  if (error) console.error("Failed to update boss progress:", error.message);
  return { timesFought, timesDefeated, timesLost, intelLevel, masteryLevel };
}

export async function getUnlockedAbilities(userId, fighterId) {
  const { data } = await supabase
    .from("story_unlocked_abilities")
    .select("*")
    .eq("user_id", userId).eq("fighter_id", fighterId);
  return data || [];
}

export async function unlockAbility(userId, fighterId, abilityKey, sourceBoss) {
  const { error } = await supabase
    .from("story_unlocked_abilities")
    .insert({ user_id: userId, fighter_id: fighterId, ability_key: abilityKey, source_boss: sourceBoss });
  if (error && !String(error.message).includes("duplicate")) throw error;
}

export async function upgradeAbility(userId, fighterId, abilityKey) {
  const { data: existing } = await supabase
    .from("story_unlocked_abilities")
    .select("*")
    .eq("user_id", userId).eq("fighter_id", fighterId).eq("ability_key", abilityKey)
    .maybeSingle();
  if (!existing) return;
  const newLevel = Math.min(3, (existing.upgrade_level || 1) + 1);
  await supabase.from("story_unlocked_abilities").update({ upgrade_level: newLevel }).eq("id", existing.id);
}

export async function beginFirstRun(progressId, currentAttempts) {
  return updateStoryProgress(progressId, {
    run_status: "active", current_level: 1, total_attempts: (currentAttempts || 0) + 1,
    wins_this_run: 0, losses_this_run: 0, completed_bosses: []
  });
}
