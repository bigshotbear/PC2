import { supabase } from "./supabaseClient";

const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no O/0, I/1 — avoids ambiguous typing

function randomSegment(len) {
  let s = "";
  for (let i = 0; i < len; i++) s += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  return s;
}

function generateShortCode() {
  return `PC-${randomSegment(4)}-${randomSegment(4)}`;
}

export function normalizeCode(raw) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/** Full battle-relevant snapshot — safe to share, no private account data. */
export function buildFighterSnapshot(fighter) {
  return {
    id: fighter.id,
    fighter_name: fighter.fighter_name,
    character_type: fighter.character_type,
    fighting_style: fighter.fighting_style,
    power_source: fighter.power_source,
    main_power: fighter.main_power,
    main_power_level: fighter.main_power_level,
    secondary_power: fighter.secondary_power,
    secondary_power_level: fighter.secondary_power_level,
    special_skill: fighter.special_skill,
    weakness: fighter.weakness,
    ultimate_move: fighter.ultimate_move,
    ultimate_level: fighter.ultimate_level,
    strength: fighter.strength,
    speed: fighter.speed,
    durability: fighter.durability,
    battle_iq: fighter.battle_iq,
    stamina: fighter.stamina,
    stat_total: fighter.stat_total,
    power_point_cap: fighter.power_point_cap,
    power_point_cost: fighter.power_point_cost,
    portrait_url: fighter.portrait_url || null,
    visual_config: fighter.visual_config || {},
    ai_synergy_modifier: fighter.ai_synergy_modifier || 0,
    ai_synergy_review: fighter.ai_synergy_review || {},
    snapshot_version: 1
  };
}

/** Reuses an existing active code for this exact fighter if one exists, else creates one. */
export async function getOrCreateFighterCode(fighter, ownerDisplayName) {
  const { data: existing } = await supabase
    .from("fight_codes")
    .select("*")
    .eq("owner_id", fighter.owner_id)
    .eq("code_type", "fighter")
    .eq("is_active", true)
    .contains("fighter_snapshot", { id: fighter.id })
    .maybeSingle();

  if (existing) return { success: true, code: existing.code };

  return createFightCode([fighter], ownerDisplayName, "fighter", 1);
}

export async function createFightCode(fighters, ownerDisplayName, codeType, battleSize) {
  const snapshot = fighters.length === 1
    ? buildFighterSnapshot(fighters[0])
    : { owner_display_name: ownerDisplayName, fighters: fighters.map(buildFighterSnapshot) };

  let attempts = 0;
  while (attempts < 5) {
    attempts += 1;
    const code = generateShortCode();
    const { error } = await supabase.from("fight_codes").insert({
      code,
      owner_id: fighters[0].owner_id,
      code_type: codeType,
      fighter_snapshot: snapshot,
      battle_size: battleSize,
      is_active: true
    });
    if (!error) return { success: true, code };
    if (!String(error.message).includes("duplicate")) {
      return { success: false, error: error.message };
    }
    // duplicate code — loop and try a fresh random code
  }
  return { success: false, error: "Could not generate a unique code. Try again." };
}

export async function resolveFightCode(rawCode) {
  const code = normalizeCode(rawCode);
  if (!/^PC-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
    return { success: false, error: "That doesn't look like a valid Fight Code (format: PC-XXXX-XXXX)." };
  }

  const { data, error } = await supabase.from("fight_codes").select("*").eq("code", code).maybeSingle();

  if (error) return { success: false, error: "Could not check that code right now. Try again." };
  if (!data) return { success: false, error: "That Fight Code was not found." };
  if (!data.is_active) return { success: false, error: "This Fight Code is no longer active." };
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { success: false, error: "This Fight Code has expired." };
  }

  const snapshot = data.fighter_snapshot;
  const fighters = data.code_type === "fighter" ? [snapshot] : snapshot?.fighters;
  if (!fighters || !Array.isArray(fighters) || fighters.length === 0 || !fighters[0]?.fighter_name) {
    return { success: false, error: "This code contains invalid fighter data." };
  }

  const battleSize = fighters.length === 1 ? "1v1" : fighters.length === 2 ? "2v2" : "3v3";

  // fire-and-forget usage counter — never blocks the challenge flow
  supabase.rpc("increment_fight_code_usage", { p_code: code }).then(() => {}).catch(() => {});

  return {
    success: true,
    code,
    codeType: data.code_type,
    ownerDisplayName: snapshot.owner_display_name || "Challenger",
    fighters,
    battleSize
  };
}
