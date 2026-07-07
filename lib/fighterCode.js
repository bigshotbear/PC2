// Fighter/Roster Codes — shareable snapshots of one or more fighters so a
// recipient can battle without any access to the sender's database rows.
//
// Note on format: a truly short human-typed code (e.g. "PC-F7K9-X2M4")
// requires a server-side lookup table (short code -> stored snapshot).
// This client-only version embeds the full snapshot as compact base64,
// so codes are longer than a 4x4 code but still a single copy/paste
// string that works with zero backend lookups and never expires.

function compact(fighter) {
  return {
    n: fighter.fighter_name, ct: fighter.character_type, fs: fighter.fighting_style,
    ps: fighter.power_source, mp: fighter.main_power, mpl: fighter.main_power_level,
    sp: fighter.secondary_power, spl: fighter.secondary_power_level,
    sk: fighter.special_skill, wk: fighter.weakness, um: fighter.ultimate_move,
    ul: fighter.ultimate_level, st: fighter.strength, sd: fighter.speed,
    du: fighter.durability, bi: fighter.battle_iq, sm: fighter.stamina,
    cap: fighter.power_point_cap, cost: fighter.power_point_cost,
    aim: fighter.ai_synergy_modifier || 0, air: fighter.ai_synergy_review || {}
  };
}

function expand(c) {
  return {
    fighter_name: c.n, character_type: c.ct, fighting_style: c.fs, power_source: c.ps,
    main_power: c.mp, main_power_level: c.mpl, secondary_power: c.sp, secondary_power_level: c.spl,
    special_skill: c.sk, weakness: c.wk, ultimate_move: c.um, ultimate_level: c.ul,
    strength: c.st, speed: c.sd, durability: c.du, battle_iq: c.bi, stamina: c.sm,
    power_point_cap: c.cap, power_point_cost: c.cost,
    ai_synergy_modifier: c.aim || 0, ai_synergy_review: c.air || {}
  };
}

function toBase64(obj) {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)));
}

function fromBase64(str) {
  const json = decodeURIComponent(escape(atob(str)));
  return JSON.parse(json);
}

/** Encode 1-3 fighters (owner name + battle size implied by array length). */
export function encodeFighterCode(fighters, ownerName = "Challenger") {
  const list = Array.isArray(fighters) ? fighters : [fighters];
  const payload = { o: ownerName, f: list.map(compact) };
  return `PC-${toBase64(payload)}`;
}

export function decodeFighterCode(code) {
  try {
    const clean = code.trim().replace(/^PC-/, "");
    const payload = fromBase64(clean);
    if (!payload.f || !Array.isArray(payload.f) || payload.f.length === 0) {
      throw new Error("empty roster");
    }
    if (payload.f.length > 3) throw new Error("too many fighters");
    return {
      success: true,
      ownerName: payload.o || "Challenger",
      fighters: payload.f.map(expand),
      battleSize: payload.f.length === 1 ? "1v1" : payload.f.length === 2 ? "2v2" : "3v3"
    };
  } catch (e) {
    return { success: false, error: "That code couldn't be read. Double-check it was copied in full." };
  }
}
