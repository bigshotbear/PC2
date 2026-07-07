// Clash Coach — creative synergy review.
// Tries the Supabase Edge Function first (real AI, key stays server-side);
// falls back to this deterministic analyzer so the feature always works.

import { supabase } from "./supabaseClient";

const KNOWN_COMBOS = [
  {
    keys: [["Super Speed", "Wind Control"]],
    title: "Tailwind Velocity", rating: "strong", modifierType: "round_one_initiative", modifierPercent: 3,
    summary: "Wind Control plausibly improves Super Speed by reducing drag and shaping airflow.",
    pros: ["Improves straight-line acceleration", "Can redirect air around the fighter", "Can disrupt projectiles"],
    cons: ["Requires concentration at high speed", "Sharp turns still limited by reaction time", "Enclosed arenas reduce the benefit"],
    conditions: ["Wind Control active", "Enough Battle IQ to control airflow", "Stamina to maintain the effect"],
    counters: ["Gravity Control", "Earth barriers", "Confined arenas", "Sound disruption"],
    relatedStats: ["speed", "battle_iq", "stamina"], badgeSuggestions: ["Wind Runner", "Blitz Striker"]
  },
  {
    keys: [["Super Speed", "Gravity Control"]],
    title: "Low-G Acceleration", rating: "strong", modifierType: "mobility_bonus", modifierPercent: 2,
    summary: "Reducing effective gravity aids acceleration and jumping, at the cost of traction.",
    pros: ["Better acceleration and jump height", "Harder to pin down"],
    cons: ["Reduced traction on sharp turns", "Costly to sustain"],
    conditions: ["Gravity Control active", "Stamina to sustain the field"],
    counters: ["Earth Control", "Sound disruption", "Enclosed arenas"],
    relatedStats: ["speed", "stamina"], badgeSuggestions: ["Gravity Well", "Blitz Striker"]
  },
  {
    keys: [["Fire Control", "Water Control"], ["Fire", "Water Control"]],
    title: "Steam Screen", rating: "plausible", modifierType: "concealment_bonus", modifierPercent: 1,
    summary: "Mixing fire and water can create steam for concealment, but also dampens fire output.",
    pros: ["Concealment and vision denial"],
    cons: ["Reduces raw fire damage", "Depends heavily on Battle IQ"],
    conditions: ["Both powers usable in the same exchange", "Battle IQ to exploit the cover"],
    counters: ["Wind Control", "Sound Waves", "Psychic Reading"],
    relatedStats: ["battle_iq"], badgeSuggestions: ["Water Weaver"]
  },
  {
    keys: [["Technology Arsenal", "Magic Spells"]],
    title: "Arcane Engineering", rating: "strong", modifierType: "counter_bonus", modifierPercent: 2,
    summary: "Blending tech and magic covers each system's counters, at the cost of complexity.",
    pros: ["Covers both Magic and Technology counters", "Flexible toolkit"],
    cons: ["Complex to execute", "Needs focus and setup time"],
    conditions: ["Battle IQ 25+ to manage both systems"],
    counters: ["Sound disruption", "Pressure from Speedsters"],
    relatedStats: ["battle_iq"], badgeSuggestions: ["Technomancer", "Arcane Engineer"]
  }
];

const BANNED_CLAIMS = /(cannot lose|can't lose|always win|instant(ly)? kill|unlimited|infinite|no weakness|ignore.{0,12}(cap|weakness)|omnipotent)/i;

export function analyzeLocally(fighter, explanation) {
  const text = (explanation || "").trim();

  if (text.length < 20) {
    return baseReview("rejected", "none", 0, "Too Short to Judge",
      "Explain the mechanics — how one power actually helps the other — in a sentence or two.",
      [], ["No mechanism described"], [], [], [], []);
  }
  if (BANNED_CLAIMS.test(text)) {
    return baseReview("rejected", "none", 0, "Overclaimed",
      "Claims like guaranteed wins, infinite effects, or ignoring weaknesses can't be approved. Describe a realistic, situational advantage instead.",
      [], ["Claim breaks balance rules"], [], [], [], []);
  }

  const kit = [fighter.main_power, fighter.secondary_power, fighter.power_source];
  const combo = KNOWN_COMBOS.find((c) => c.keys.some((pair) => pair.every((k) => kit.includes(k))));

  // Does the explanation actually reference the selected powers?
  const mentionsKit = [fighter.main_power, fighter.secondary_power]
    .filter(Boolean)
    .filter((p) => text.toLowerCase().includes(p.toLowerCase().split(" ")[0])).length;

  if (combo && mentionsKit >= 1) {
    return { title: combo.title, status: "approved", rating: combo.rating, summary: combo.summary,
      pros: combo.pros, cons: combo.cons, conditions: combo.conditions, counters: combo.counters,
      relatedStats: combo.relatedStats, badgeSuggestions: combo.badgeSuggestions,
      modifierType: combo.modifierType, modifierPercent: clampMod(combo.modifierPercent), confidence: 0.85 };
  }

  if (mentionsKit >= 1 && text.length >= 60) {
    return baseReview("partially_approved", "plausible", 1, "Creative Angle",
      "The idea is coherent but not an established synergy — approved at a small situational bonus.",
      ["Adds a situational edge in the right matchup"],
      ["Effect is small and conditional", "Depends on execution (Battle IQ)"],
      ["The described situation must actually occur in the fight"],
      ["Opposing power sources that counter yours"],
      ["battle_iq"], []);
  }

  return baseReview("rejected", "none", 0, "Not Connected to Your Kit",
    "The explanation doesn't clearly involve your selected powers. Reference your Main/Secondary Power and describe the mechanism.",
    [], ["Explanation doesn't match the selected build"], [], [], [], []);
}

function baseReview(status, rating, mod, title, summary, pros, cons, conditions, counters, relatedStats, badgeSuggestions) {
  return { title, status, rating, summary, pros, cons, conditions, counters, relatedStats, badgeSuggestions,
    modifierType: mod > 0 ? "situational" : "none", modifierPercent: clampMod(mod), confidence: 0.7 };
}

export function clampMod(n) {
  return Math.max(0, Math.min(4, Number(n) || 0));
}

/** Fields that invalidate a stored review when changed. */
export const REVIEW_SENSITIVE_FIELDS = [
  "fighting_style", "power_source", "main_power", "secondary_power",
  "special_skill", "ultimate_move", "strength", "speed", "durability", "battle_iq", "stamina"
];

export function reviewMatchesFighter(review, fighter) {
  if (!review || !review._fighterFingerprint) return false;
  return review._fighterFingerprint === fingerprint(fighter);
}

export function fingerprint(fighter) {
  return REVIEW_SENSITIVE_FIELDS.map((k) => String(fighter[k])).join("|");
}

/** Try the Edge Function; fall back to the local analyzer. Never throws. */
export async function analyzeBuildSynergy(fighter, explanation) {
  try {
    const { data, error } = await supabase.functions.invoke("analyze-build-synergy", {
      body: { fighter, playerExplanation: explanation }
    });
    if (!error && data && data.status) {
      data.modifierPercent = clampMod(data.modifierPercent);
      data._fighterFingerprint = fingerprint(fighter);
      return data;
    }
  } catch (e) {
    // fall through to local
  }
  const local = analyzeLocally(fighter, explanation);
  local._fighterFingerprint = fingerprint(fighter);
  return local;
}
