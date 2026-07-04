import { supabase } from "./supabaseClient";
import { buildFighterSnapshot } from "./fightCodeService";

/** Publishes/updates the public battle-safe Community Build for a saved fighter. */
export async function publishCommunityBuild(fighter, ownerDisplayName) {
  const payload = {
    fighter_id: fighter.id,
    owner_id: fighter.owner_id,
    owner_display_name: ownerDisplayName || "Anonymous",
    fighter_name: fighter.fighter_name,
    fighter_snapshot: buildFighterSnapshot(fighter),
    portrait_url: fighter.portrait_url || null,
    power_source: fighter.power_source,
    fighting_style: fighter.fighting_style,
    combat_role: fighter.character_type,
    total_power_cost: fighter.power_point_cost,
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from("community_builds").upsert(payload, { onConflict: "fighter_id" });
  if (error) console.error("Community Build publish failed:", error.message);
}

export async function deactivateCommunityBuild(fighterId) {
  await supabase.from("community_builds").update({ is_active: false }).eq("fighter_id", fighterId);
}

/** Secure RPC — server picks random active builds, excludes the caller's own and any already-seen ids. */
export async function getRandomCommunityBuilds(count, excludeIds = []) {
  const { data, error } = await supabase.rpc("get_random_community_builds", {
    requested_count: count,
    exclude_ids: excludeIds
  });
  if (error) return { success: false, error: error.message, builds: [] };
  if (!data || data.length < count) {
    return { success: false, error: "Not enough Community Builds available yet — try VS Computer instead.", builds: data || [] };
  }
  return { success: true, builds: data };
}

export async function recordCommunityBuildResult(buildId, didWin) {
  try {
    await supabase.rpc("record_community_build_result", { build_id: buildId, did_win: didWin });
  } catch (e) {
    console.error("Could not record Community Build result:", e.message);
  }
}
