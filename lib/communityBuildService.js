import { supabase } from "./supabaseClient";
import { buildFighterSnapshot } from "./fightCodeService";

const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const randSeg = (len) => Array.from({ length: len }, () => CHARSET[Math.floor(Math.random() * CHARSET.length)]).join("");

async function generateUniqueBuildCode() {
  for (let i = 0; i < 5; i++) {
    const code = `PCB-${randSeg(6)}`;
    const { data } = await supabase.from("community_builds").select("id").eq("build_code", code).maybeSingle();
    if (!data) return code;
  }
  return `PCB-${randSeg(6)}${Date.now().toString(36).slice(-2).toUpperCase()}`;
}

/** Publishes/updates the public battle-safe Community Build for a saved fighter, keeping the same Build Code across edits. */
export async function publishCommunityBuild(fighter, ownerDisplayName) {
  const { data: existing } = await supabase.from("community_builds").select("id, build_code").eq("fighter_id", fighter.id).maybeSingle();
  const buildCode = existing?.build_code || await generateUniqueBuildCode();

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
    build_code: buildCode,
    visibility: existing ? undefined : "unlisted",
    version: 1,
    is_active: true,
    updated_at: new Date().toISOString()
  };
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const { error } = await supabase.from("community_builds").upsert(payload, { onConflict: "fighter_id" });
  if (error) console.error("Community Build publish failed:", error.message);
  return buildCode;
}

export async function deactivateCommunityBuild(fighterId) {
  await supabase.from("community_builds").update({ is_active: false }).eq("fighter_id", fighterId);
}

export async function setCommunityBuildVisibility(buildId, visibility) {
  const { error } = await supabase.from("community_builds").update({ visibility }).eq("id", buildId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getCommunityBuildByCode(code) {
  const clean = code.trim().toUpperCase();
  const { data, error } = await supabase.from("community_builds").select("*").eq("build_code", clean).eq("is_active", true).maybeSingle();
  if (error) return { success: false, error: "Could not check that code right now." };
  if (!data) return { success: false, error: "That Build Code was not found." };
  return { success: true, build: data };
}

export async function searchCommunityBuilds(query) {
  const q = query.trim();
  if (!q) return [];
  const { data } = await supabase
    .from("community_builds")
    .select("*")
    .eq("is_active", true)
    .eq("visibility", "public")
    .or(`build_code.ilike.%${q}%,fighter_name.ilike.%${q}%,owner_display_name.ilike.%${q}%,power_source.ilike.%${q}%,fighting_style.ilike.%${q}%`)
    .limit(30);
  return data || [];
}

export async function getMyPublishedBuilds(userId) {
  const { data } = await supabase.from("community_builds").select("*").eq("owner_id", userId).eq("visibility", "public").eq("is_active", true);
  return data || [];
}

export async function getMyUnlistedBuilds(userId) {
  const { data } = await supabase.from("community_builds").select("*").eq("owner_id", userId).eq("visibility", "unlisted").eq("is_active", true);
  return data || [];
}

/** Creates a new personal fighter for the current user from a Community Build snapshot. */
export async function copyBuildToMyFighters(userId, communityBuild) {
  const snap = communityBuild.fighter_snapshot;
  const payload = {
    owner_id: userId,
    fighter_name: snap.fighter_name,
    character_type: snap.character_type,
    fighting_style: snap.fighting_style,
    power_source: snap.power_source,
    main_power: snap.main_power,
    main_power_level: snap.main_power_level,
    secondary_power: snap.secondary_power,
    secondary_power_level: snap.secondary_power_level,
    special_skill: snap.special_skill,
    weakness: snap.weakness,
    ultimate_move: snap.ultimate_move,
    ultimate_level: snap.ultimate_level,
    strength: snap.strength, speed: snap.speed, durability: snap.durability,
    battle_iq: snap.battle_iq, stamina: snap.stamina,
    stat_total: snap.stat_total, power_point_cap: snap.power_point_cap, power_point_cost: snap.power_point_cost,
    portrait_url: communityBuild.portrait_url || null,
    visual_config: snap.visual_config || {},
    is_valid_build: true
  };

  const { data, error } = await supabase.from("fighters").insert(payload).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, fighter: data };
}

/**
 * Real browsable Community Opponent search — paginated, filterable,
 * excludes the caller's own builds. Distinct from getRandomCommunityBuilds
 * (which auto-fills a random matchup); this is for the interactive
 * "Browse Opponents" picker.
 */
export async function browseCommunityOpponents({ userId, filters = {}, sort = "newest", offset = 0, limit = 12 }) {
  let query = supabase
    .from("community_builds")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .neq("owner_id", userId);

  if (filters.search) {
    query = query.or(`fighter_name.ilike.%${filters.search}%,owner_display_name.ilike.%${filters.search}%`);
  }
  if (filters.powerSource) query = query.eq("power_source", filters.powerSource);
  if (filters.fightingStyle) query = query.eq("fighting_style", filters.fightingStyle);
  if (filters.characterType) query = query.eq("combat_role", filters.characterType);

  if (sort === "newest") query = query.order("created_at", { ascending: false });
  else if (sort === "mostBattles") query = query.order("times_fought", { ascending: false });
  else query = query.order("created_at", { ascending: false }); // "random" handled client-side via shuffle of this page

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return { success: false, error: error.message, builds: [], total: 0 };

  const builds = sort === "random" ? [...(data || [])].sort(() => Math.random() - 0.5) : (data || []);
  return { success: true, builds, total: count || 0, hasMore: offset + limit < (count || 0) };
}

/** Secure RPC — server picks random active builds for an automatic matchup, excluding the caller's own and any already-seen ids. */
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
