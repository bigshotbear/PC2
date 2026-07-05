// Validates a Story Mode battle plan against what the fighter actually
// owns. Flags overconfident/impossible claims instead of silently
// accepting them — the referee (storyReferee.js) uses this output
// directly as part of the strategy score.

const BANNED_PATTERNS = [
  { pattern: /\b(instantly|automatically) win\b/i, reason: "Claims an instant/automatic win." },
  { pattern: /no weakness(es)?/i, reason: "Claims the plan has no weaknesses." },
  { pattern: /they (can'?t|cannot) (hit|touch|reach) me/i, reason: "Assumes the opponent cannot land any attack." },
  { pattern: /dodge everything/i, reason: "Claims to dodge every attack." },
  { pattern: /ignores? (all )?defen[cs]es?/i, reason: "Claims to bypass all defenses." },
  { pattern: /kill(s)? (them|him|her|it) before (they|he|she|it) (can |could )?react/i, reason: "Assumes a free first strike with no possible response." },
  { pattern: /perfect defen[cs]e/i, reason: "Claims a perfect, unbeatable defense." },
  { pattern: /no counter/i, reason: "Assumes the opponent has literally no counter available." },
  { pattern: /(one shot|one[- ]hit) (kill|defeat)/i, reason: "Assumes a guaranteed one-hit kill." }
];

function findInventedCapabilities(planText, fighter, equippedAbilities) {
  const ownedTerms = [
    fighter.main_power, fighter.secondary_power, fighter.special_skill, fighter.ultimate_move,
    fighter.power_source, fighter.fighting_style,
    ...equippedAbilities.map((a) => a.name)
  ].filter(Boolean).map((t) => t.toLowerCase());

  const suspiciousTerms = ["laser eyes", "time stop", "mind control", "invincibility", "invisible armor", "infinite stamina", "instant heal", "teleport anywhere"];
  return suspiciousTerms.filter((term) => planText.toLowerCase().includes(term) && !ownedTerms.some((o) => o.includes(term)));
}

export function validateBattlePlan(planText, fighter, equippedAbilities) {
  const text = (planText || "").trim();
  const issues = [];
  const unsupportedClaims = [];

  if (text.length < 80) {
    issues.push("Plan is too short/vague to evaluate meaningfully (minimum ~80 characters).");
  }

  BANNED_PATTERNS.forEach(({ pattern, reason }) => {
    if (pattern.test(text)) unsupportedClaims.push(reason);
  });

  const invented = findInventedCapabilities(text, fighter, equippedAbilities);
  invented.forEach((term) => unsupportedClaims.push(`References "${term}", which this fighter does not actually have.`));

  const mentionsOwnPower = [fighter.main_power, fighter.secondary_power].filter(Boolean)
    .some((p) => text.toLowerCase().includes(p.toLowerCase().split(" ")[0]));
  const mentionsDefense = /(block|defend|guard|durability|armor|shield|avoid|evade|brace)/i.test(text);
  const mentionsOpponent = /(their|opponent|boss|enemy|it will|they will)/i.test(text);

  if (!mentionsOwnPower) issues.push("Doesn't reference the fighter's actual Main or Secondary Power.");
  if (!mentionsDefense) issues.push("No defensive consideration — doesn't address how damage will be avoided or absorbed.");
  if (!mentionsOpponent) issues.push("Doesn't account for how the opponent will respond.");

  const substanceScore = Math.max(0, 100 - issues.length * 15 - unsupportedClaims.length * 20);

  return {
    valid: unsupportedClaims.length === 0 && text.length >= 80,
    issues, unsupportedClaims,
    substanceScore: Math.min(100, substanceScore),
    mentionsOwnPower, mentionsDefense, mentionsOpponent,
    length: text.length
  };
}
