// ============================================================
// POWER CLASH — BATTLE ENGINE
// Deterministic-ish scoring with small randomness so repeated
// fights between the same two teams don't always read identically.
//
// Every fighter's final score is also broken into 5 buckets
// (damage / defense / support / tactics / badges) that always sum
// exactly to that fighter's score — used for the post-fight donut
// chart, contribution bars, and score ledger. Nothing here is
// invented after the fact; the buckets are derived from the same
// weights used to build the score in the first place.
// ============================================================

import { detectSynergies } from "./teamHelpers";
import {
  calculateFighterBadges,
  calculateTeamBadges,
  calculateMatchupBadges,
  getBadgeModifier
} from "./badgeEngine";
import { resolveActiveBadges } from "./badgeLoadout";

export const POWER_COUNTERS = {
  Water: ["Fire"],
  Fire: ["Ice", "Nature"],
  Ice: ["Wind", "Water"],
  Lightning: ["Water", "Technology"],
  Earth: ["Lightning", "Poison"],
  Wind: ["Poison", "Sound"],
  Light: ["Shadow"],
  Shadow: ["Psychic", "Light"],
  "Cosmic Energy": ["Ki", "Chakra", "Magic"],
  Ki: ["Technology", "Earth"],
  Chakra: ["Ki", "Nature"],
  Magic: ["Technology", "Psychic"],
  Technology: ["Magic", "Sound"],
  Nature: ["Earth", "Water"],
  Poison: ["Nature"],
  Gravity: ["Super Speed", "Flight"],
  Sound: ["Stealth", "Illusions"],
  "Spirit Energy": ["Shadow", "Poison"]
};

export const ARENAS = [
  { name: "Ocean Platform", boost: ["Water", "Ice", "Lightning"], penalty: ["Fire"] },
  { name: "Volcano Ruins", boost: ["Fire", "Earth"], penalty: ["Ice", "Nature"] },
  { name: "Storm City Rooftops", boost: ["Lightning", "Wind", "Technology"], penalty: [] },
  { name: "Forest at Night", boost: ["Nature", "Shadow", "Poison"], penalty: ["Light"] },
  { name: "Space Station", boost: ["Cosmic Energy", "Technology", "Gravity"], penalty: ["Earth", "Nature"] },
  { name: "Ancient Temple", boost: ["Magic", "Chakra", "Spirit Energy"], penalty: ["Technology"] },
  { name: "Open Desert", boost: ["Fire", "Wind", "Light"], penalty: ["Water", "Ice"] },
  { name: "Underground Arena", boost: ["Earth", "Sound"], penalty: [] }
];

export const BATTLE_TWISTS = [
  "No ultimates for the first minute",
  "Shrinking battlefield forces close combat",
  "Power surges make abilities stronger but more tiring",
  "Fog lowers accuracy and rewards Battle IQ",
  "Civilians nearby punish reckless area attacks",
  "Low gravity makes speed and flight harder to control",
  "Arena breaks apart halfway through the fight",
  "Energy drain makes Stamina extra important"
];

const TANK_STYLES = ["Tank", "Defender"];
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function isCountered(mySource, opponentSource) {
  return (POWER_COUNTERS[mySource] || []).includes(opponentSource);
}

/** This fighter's earned badges filtered down to just the equipped (max 4) ones, with real tiers. */
export function getEquippedBadgeObjects(fighter) {
  const earned = calculateFighterBadges(fighter, fighter.power_point_cost, fighter.power_point_cap);
  const activeNames = resolveActiveBadges(fighter);
  return earned.filter((b) => activeNames.includes(b.name));
}

/**
 * Computes one fighter's score AND a breakdown that sums exactly to it.
 * Everything except the badge bonus is folded into `preBadge`, so
 * `finalScore - preBadge` isolates exactly how much the equipped badges
 * contributed — no guessing after the fact.
 */
export function computeFighterScore(fighter, { arena, twist, synergies, opponentFighters, equippedBadges }) {
  const weaponMasterMult = fighter.fighting_style === "Weapon Master" ? 1.1 : 1;
  let dmgW = fighter.strength + fighter.speed * 0.7 + fighter.main_power_level * 4 + fighter.secondary_power_level * 3;
  let defW = fighter.durability;
  let supW = fighter.stamina * (fighter.fighting_style === "Support/Healer" ? 1.3 : 0.55);
  let tacW = fighter.battle_iq * 1.08 + fighter.ultimate_level * 3.5 * weaponMasterMult + (fighter.special_skill !== "None" ? 5 : 0);

  const notes = [];

  if (fighter.fighting_style === "Brawler") dmgW += fighter.strength * 0.1;
  if (fighter.fighting_style === "Speedster") {
    dmgW += fighter.speed * 0.15;
    notes.push(`${fighter.fighter_name} surges ahead early with Speedster initiative.`);
  }
  if (fighter.fighting_style === "Tank" || fighter.fighting_style === "Defender") {
    defW += Math.max(0, fighter.stamina - 20) * 0.1;
  }

  if (fighter.weakness === "Low Stamina" && fighter.stamina < 15) supW -= 8;
  if (fighter.weakness === "Weak Defense" && fighter.durability < 15) defW -= 8;
  if (fighter.weakness === "Needs Focus" && fighter.battle_iq < 15) tacW -= 8;
  if (fighter.weakness === "Ultimate Drains Body" && fighter.stamina < 20) tacW -= 4;

  if (twist === "Fog lowers accuracy and rewards Battle IQ") tacW += fighter.battle_iq * 0.08;
  if (twist === "Energy drain makes Stamina extra important") supW += fighter.stamina * 0.08;
  if (twist === "No ultimates for the first minute") tacW -= fighter.ultimate_level * 1.5;

  let preBadge = Math.max(1, dmgW + defW + supW + tacW);

  const isStrategist = ["Strategist", "Tactician"].includes(fighter.fighting_style);
  let arenaMult = 1;
  if (arena.boost.includes(fighter.power_source)) arenaMult = 1.12;
  else if (arena.penalty.includes(fighter.power_source)) arenaMult = isStrategist ? 0.904 : 0.88;

  let counterBonus = 0, counteredPenalty = 0;
  const opponentSources = [...new Set(opponentFighters.map((f) => f.power_source))];
  opponentSources.forEach((oppSource) => {
    if (isCountered(fighter.power_source, oppSource)) counterBonus += 0.08;
    if (isCountered(oppSource, fighter.power_source)) counteredPenalty += 0.08;
  });
  const counterMult = 1 + Math.min(counterBonus, 0.16) - Math.min(counteredPenalty, 0.16);

  let synergyMult = 1;
  let synergyFlat = 0;
  synergies.forEach((syn) => {
    if (syn.type === "brawler_strength_up" && fighter.fighting_style === "Brawler") synergyFlat += fighter.strength * syn.meta.amount;
    if (syn.type === "source_resonance" && fighter.power_source === syn.meta.source) synergyMult *= 1 + syn.meta.amount;
    if (syn.type === "turn_order_bonus") synergyMult *= 1 + syn.meta.amount;
  });

  preBadge = Math.max(1, (preBadge + synergyFlat) * arenaMult * counterMult * synergyMult);

  const aiMod = Number(fighter.ai_synergy_modifier) || 0;
  const aiReview = fighter.ai_synergy_review;
  let aiMult = 1;
  if (aiMod > 0 && aiReview && ["approved", "partially_approved"].includes(aiReview.status)) {
    aiMult = 1 + Math.min(4, aiMod) / 100;
    notes.push(`${aiReview.title || "Creative synergy"} activated at ${Math.min(4, aiMod)}%.`);
  }

  const randomMult = rand(0.95, 1.05);
  const riskMult = fighter.ultimate_move === "One Huge Attack" ? rand(0.78, 1.32) : 1;

  preBadge = Math.max(1, preBadge * aiMult * randomMult * riskMult);

  const badgeMultiplier = 1 + Math.min(0.15, equippedBadges.reduce((sum, b) => sum + getBadgeModifier(b.level), 0));
  const finalScore = preBadge * badgeMultiplier;
  const badgeContribution = finalScore - preBadge;

  const weightTotal = Math.max(1, dmgW + defW + supW + tacW);
  const breakdown = {
    damage: Math.max(0, preBadge * (dmgW / weightTotal)),
    defense: Math.max(0, preBadge * (defW / weightTotal)),
    support: Math.max(0, preBadge * (supW / weightTotal)),
    tactics: 0,
    badges: Math.max(0, badgeContribution)
  };
  breakdown.tactics = Math.max(0, finalScore - breakdown.damage - breakdown.defense - breakdown.support - breakdown.badges);

  return { score: Math.max(1, finalScore), breakdown, notes, equippedBadges };
}

function applyOpponentSynergyPenalties(fighters, opponentSynergies) {
  let teamMultiplier = 1;
  const appliedNotes = [];

  opponentSynergies.forEach((syn) => {
    if (syn.type === "enemy_speed_down") {
      teamMultiplier -= syn.meta.amount * 0.3;
      appliedNotes.push("Conductive Storm dampened their tempo.");
    }
    if (syn.type === "enemy_tank_durability_down") {
      const tank = fighters.find((f) => TANK_STYLES.includes(f.fighting_style));
      if (tank) {
        teamMultiplier -= syn.meta.amount * 0.2;
        appliedNotes.push(`Thermal Shock cracked ${tank.fighter_name}'s defenses.`);
      }
    }
  });

  return { teamMultiplier: Math.max(0.7, teamMultiplier), appliedNotes };
}

function buildAnimationRounds(winnerSide, teamA, teamB) {
  const rosters = { A: teamA, B: teamB };
  const health = { A: 100, B: 100 };
  const loserSide = winnerSide === "A" ? "B" : "A";
  const rounds = [];
  let cycleIndex = { A: 0, B: 0 };

  let safety = 0;
  while (health[loserSide] > 0 && safety < 14) {
    safety += 1;
    const attackerSide = Math.random() < 0.68 ? winnerSide : loserSide;
    const defenderSide = attackerSide === "A" ? "B" : "A";

    const roster = rosters[attackerSide];
    const attacker = roster[cycleIndex[attackerSide] % roster.length];
    cycleIndex[attackerSide] += 1;

    const useUltimate = Math.random() < 0.25;
    const moveName = useUltimate ? attacker.ultimate_move : attacker.main_power;

    let damage;
    if (attackerSide === winnerSide) {
      damage = Math.round(rand(12, 24) * (useUltimate ? 1.3 : 1));
    } else {
      damage = Math.round(rand(5, 13));
    }

    let newHealth = health[defenderSide] - damage;
    if (defenderSide === winnerSide) {
      newHealth = Math.max(newHealth, 18);
    } else {
      newHealth = Math.max(newHealth, 0);
    }
    health[defenderSide] = newHealth;

    rounds.push({
      attackerSide, defenderSide,
      attackerName: attacker.fighter_name, moveName,
      damageAmount: damage, defenderHealthAfter: newHealth
    });

    if (newHealth <= 0) break;
  }

  if (health[loserSide] > 0) {
    const roster = rosters[winnerSide];
    const attacker = roster[0];
    rounds.push({
      attackerSide: winnerSide, defenderSide: loserSide,
      attackerName: attacker.fighter_name, moveName: attacker.ultimate_move,
      damageAmount: health[loserSide], defenderHealthAfter: 0
    });
  }

  return rounds;
}

function findPlayOfTheMatch(animationRounds) {
  if (!animationRounds || animationRounds.length === 0) return null;
  const biggest = animationRounds.reduce((best, r) => (r.damageAmount > best.damageAmount ? r : best), animationRounds[0]);
  return `${biggest.attackerName} landed the biggest hit of the fight with ${biggest.moveName} for ${biggest.damageAmount} damage.`;
}

function buildLossReasons(loserFighters, winnerFighters, loserSynergies, winnerSynergies, arena, capOk) {
  const reasons = [];
  const avg = (fighters, key) => fighters.reduce((s, f) => s + f[key], 0) / fighters.length;

  if (avg(loserFighters, "speed") < avg(winnerFighters, "speed") - 8) reasons.push("Too slow to control the pace of the fight.");
  if (avg(loserFighters, "strength") < avg(winnerFighters, "strength") - 8) reasons.push("Out-muscled on raw Strength.");
  if (avg(loserFighters, "durability") < avg(winnerFighters, "durability") - 8) reasons.push("Too low Durability to absorb the damage taken.");
  if (avg(loserFighters, "stamina") < avg(winnerFighters, "stamina") - 8) reasons.push("Ran out of Stamina before the fight was decided.");
  if (avg(loserFighters, "battle_iq") < avg(winnerFighters, "battle_iq") - 8) reasons.push("Lower Battle IQ led to reactive, not adaptive, decisions.");

  const loserSources = loserFighters.map((f) => f.power_source);
  const winnerSources = winnerFighters.map((f) => f.power_source);
  const badMatchup = loserSources.some((ls) => winnerSources.some((ws) => isCountered(ws, ls)));
  if (badMatchup) reasons.push("Bad type matchup — their power source directly countered yours.");

  if (winnerSynergies.length > loserSynergies.length) reasons.push("Enemy team synergies outclassed your own team composition.");
  if (arena.penalty.some((p) => loserSources.includes(p))) reasons.push(`Arena disadvantage on ${arena.name}.`);
  if (!capOk) reasons.push("A fighter exceeded the power point cap for this mode.");

  const weaknesses = new Set(loserFighters.map((f) => f.weakness));
  if (weaknesses.size === 1 && loserFighters.length > 1) reasons.push("The whole team shared the same weakness, letting it be exploited repeatedly.");

  const hasUltimate = loserFighters.some((f) => f.ultimate_level >= 3);
  if (!hasUltimate) reasons.push("No fight-changing finisher to close the gap.");
  if (avg(loserFighters, "durability") < 15) reasons.push("No real defense — damage went through unmitigated.");

  const counterToWinner = loserSources.some((ls) => Object.keys(POWER_COUNTERS).includes(ls) && POWER_COUNTERS[ls].some((c) => winnerSources.includes(c)));
  if (!counterToWinner) reasons.push("No counter prepared for the opponent's dominant power source.");

  return [...new Set(reasons)].slice(0, 5);
}

function buildImprovementTips(reasons) {
  const tipMap = {
    "Too slow to control the pace of the fight.": "Raise Speed or bring in a Speedster to seize round-one initiative.",
    "Out-muscled on raw Strength.": "Add Strength or pair with a Brawler for a Brain & Brawn synergy.",
    "Too low Durability to absorb the damage taken.": "Invest more of your 100 points into Durability, especially on a Tank/Defender.",
    "Ran out of Stamina before the fight was decided.": "Boost Stamina — it also fuels Tank/Defender damage mitigation.",
    "Lower Battle IQ led to reactive, not adaptive, decisions.": "Battle IQ is weighted heavily — a Strategist or Tactician build closes this gap fast.",
    "Bad type matchup — their power source directly countered yours.": "Scout the opponent's power source and swap in a fighter that counters it.",
    "Enemy team synergies outclassed your own team composition.": "Build around a real synergy — duplicate power sources or a diverse 3-style roster.",
    "A fighter exceeded the power point cap for this mode.": "Recheck power point costs against the mode cap before saving the team.",
    "The whole team shared the same weakness, letting it be exploited repeatedly.": "Diversify weaknesses across the roster so one exploit can't sweep the team.",
    "No fight-changing finisher to close the gap.": "Level up an Ultimate to 3+ so you have a real closing move.",
    "No real defense — damage went through unmitigated.": "Don't dump every point into offense — Durability keeps you in the fight.",
    "No counter prepared for the opponent's dominant power source.": "Keep a flexible bench with different power sources for favorable matchups."
  };
  const tips = reasons.map((r) => tipMap[r]).filter(Boolean);
  if (tips.length === 0) tips.push("Small margin loss — minor stat or power-level tweaks could flip this next time.");
  return [...new Set(tips)].slice(0, 5);
}

function aggregateBreakdown(scored) {
  return scored.reduce((acc, s) => ({
    damage: acc.damage + s.breakdown.damage,
    defense: acc.defense + s.breakdown.defense,
    support: acc.support + s.breakdown.support,
    tactics: acc.tactics + s.breakdown.tactics,
    badges: acc.badges + s.breakdown.badges
  }), { damage: 0, defense: 0, support: 0, tactics: 0, badges: 0 });
}

export function buildScoreLedger(breakdown, total) {
  const r1 = (n) => Math.round(n * 10) / 10;
  return [
    { label: "Base damage impact", value: r1(breakdown.damage) },
    { label: "Defense and damage prevented", value: r1(breakdown.defense) },
    { label: "Support and healing", value: r1(breakdown.support) },
    { label: "Tactical actions", value: r1(breakdown.tactics) },
    { label: "Active badge effects", value: r1(breakdown.badges) },
    { label: "TOTAL", value: r1(total) }
  ];
}

function buildFighterContributions(scored) {
  return scored.map((s) => ({
    fighter_name: s.fighter.fighter_name,
    total_impact: Math.round(s.score * 10) / 10,
    damage: Math.round(s.breakdown.damage * 10) / 10,
    defense: Math.round(s.breakdown.defense * 10) / 10,
    support: Math.round(s.breakdown.support * 10) / 10,
    tactics: Math.round(s.breakdown.tactics * 10) / 10,
    badges: Math.round(s.breakdown.badges * 10) / 10,
    equipped_badges: s.equippedBadges.map((b) => b.name)
  }));
}

/**
 * Main entry point. Takes two team snapshots (array-of-fighters + label)
 * and returns a full battle_history-shaped result object, including a
 * real (non-fabricated) impact breakdown for the post-fight screen.
 */
export function runBattle({ teamA, teamB, battleMode, battleType }) {
  const fightersA = teamA.fighter_snapshots || teamA.fighters;
  const fightersB = teamB.fighter_snapshots || teamB.fighters;

  const arena = pick(ARENAS);
  const twist = pick(BATTLE_TWISTS);

  const synergiesA = detectSynergies(fightersA);
  const synergiesB = detectSynergies(fightersB);

  const { teamMultiplier: multiplierA } = applyOpponentSynergyPenalties(fightersA, synergiesB);
  const { teamMultiplier: multiplierB } = applyOpponentSynergyPenalties(fightersB, synergiesA);

  const teamBadgesA = calculateTeamBadges(teamA);
  const teamBadgesB = calculateTeamBadges(teamB);
  const matchupBadgesA = calculateMatchupBadges(teamA, teamB);
  const matchupBadgesB = calculateMatchupBadges(teamB, teamA);
  const teamBadgeMultiplierA = 1 + Math.min(0.15, [...teamBadgesA, ...matchupBadgesA].reduce((s, b) => s + getBadgeModifier(b.level), 0));
  const teamBadgeMultiplierB = 1 + Math.min(0.15, [...teamBadgesB, ...matchupBadgesB].reduce((s, b) => s + getBadgeModifier(b.level), 0));

  // Each fighter's own EQUIPPED (max 4) badges only — never their full collection.
  const equippedObjA = fightersA.map((f) => getEquippedBadgeObjects(f));
  const equippedObjB = fightersB.map((f) => getEquippedBadgeObjects(f));

  const scoredA = fightersA.map((f, i) => ({
    fighter: f,
    ...computeFighterScore(f, { arena, twist, synergies: synergiesA, opponentFighters: fightersB, equippedBadges: equippedObjA[i] })
  }));
  const scoredB = fightersB.map((f, i) => ({
    fighter: f,
    ...computeFighterScore(f, { arena, twist, synergies: synergiesB, opponentFighters: fightersA, equippedBadges: equippedObjB[i] })
  }));

  const rawScoreA = scoredA.reduce((s, x) => s + x.score, 0) * multiplierA * teamBadgeMultiplierA;
  const rawScoreB = scoredB.reduce((s, x) => s + x.score, 0) * multiplierB * teamBadgeMultiplierB;

  const scoreA = Math.round(rawScoreA * 10) / 10;
  const scoreB = Math.round(rawScoreB * 10) / 10;

  const winnerSide = scoreA >= scoreB ? "A" : "B";
  const winnerFighters = winnerSide === "A" ? fightersA : fightersB;
  const loserFighters = winnerSide === "A" ? fightersB : fightersA;
  const winnerScored = winnerSide === "A" ? scoredA : scoredB;
  const winnerSynergies = winnerSide === "A" ? synergiesA : synergiesB;
  const loserSynergies = winnerSide === "A" ? synergiesB : synergiesA;

  const mvp = winnerScored.reduce((best, cur) => (cur.score > best.score ? cur : best), winnerScored[0]);
  const capOk = [...fightersA, ...fightersB].every((f) => f.power_point_cost <= f.power_point_cap);

  const whyLoserLost = buildLossReasons(loserFighters, winnerFighters, loserSynergies, winnerSynergies, arena, capOk);
  const improvementTips = buildImprovementTips(whyLoserLost);

  const summaryOpeners = [
    `The fight opened on ${arena.name}, with ${twist.toLowerCase()} shaping the early exchanges.`,
    `${arena.name} set the stage as both teams adapted to ${twist.toLowerCase()}.`,
    `Under the lights of ${arena.name}, ${twist.toLowerCase()} threw the first few exchanges into chaos.`
  ];
  const turningPoints = [
    `${mvp.fighter.fighter_name}'s ${mvp.fighter.ultimate_move} broke the deadlock.`,
    `A well-timed ${mvp.fighter.main_power} from ${mvp.fighter.fighter_name} swung momentum for good.`,
    `${mvp.fighter.fighter_name} refused to fold, turning a close scoreline into a clear win.`
  ];

  const fightSummary = `${pick(summaryOpeners)} ${winnerFighters.map((f) => f.fighter_name).join(" & ")} pulled ahead ${scoreA.toFixed(1)} to ${scoreB.toFixed(1)} on ${arena.name}.`;
  let turningPoint = pick(turningPoints);

  const winnerBadgePool = winnerSide === "A"
    ? [...equippedObjA.flat(), ...teamBadgesA, ...matchupBadgesA]
    : [...equippedObjB.flat(), ...teamBadgesB, ...matchupBadgesB];
  const goldHighlight = winnerBadgePool.find((b) => b.level === "Gold");
  if (goldHighlight && goldHighlight.description) {
    turningPoint = `${goldHighlight.name} activated at Gold — ${goldHighlight.description.toLowerCase()}`;
  }

  const animationRounds = buildAnimationRounds(winnerSide, fightersA, fightersB);
  const playOfTheMatch = findPlayOfTheMatch(animationRounds);

  const breakdownA = aggregateBreakdown(scoredA);
  const breakdownB = aggregateBreakdown(scoredB);
  const rescale = (breakdown, fromTotal, toTotal) => {
    const factor = fromTotal > 0 ? toTotal / fromTotal : 1;
    return {
      damage: breakdown.damage * factor, defense: breakdown.defense * factor,
      support: breakdown.support * factor, tactics: breakdown.tactics * factor,
      badges: breakdown.badges * factor
    };
  };
  const fighterTotalA = scoredA.reduce((s, x) => s + x.score, 0);
  const fighterTotalB = scoredB.reduce((s, x) => s + x.score, 0);
  const scaledBreakdownA = rescale(breakdownA, fighterTotalA, scoreA);
  const scaledBreakdownB = rescale(breakdownB, fighterTotalB, scoreB);

  return {
    fight_id: `fight_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    battle_mode: battleMode,
    battle_type: battleType,
    arena_name: arena.name,
    battle_twist: twist,
    player_a_score: scoreA,
    player_b_score: scoreB,
    winner_side: winnerSide,
    winner_name: winnerFighters.map((f) => f.fighter_name).join(" & "),
    loser_name: loserFighters.map((f) => f.fighter_name).join(" & "),
    mvp_fighter_name: mvp.fighter.fighter_name,
    mvp_reason: `Highest impact score on the winning side (${Math.round(mvp.score)} pts) this fight.`,
    active_synergies_a: synergiesA.map((s) => s.name),
    active_synergies_b: synergiesB.map((s) => s.name),
    active_synergies_detail_a: synergiesA,
    active_synergies_detail_b: synergiesB,
    fight_summary: fightSummary,
    turning_point: turningPoint,
    why_loser_lost: whyLoserLost,
    improvement_tips: improvementTips,
    animation_rounds: animationRounds,
    play_of_match: playOfTheMatch,
    player_a_team_snapshot: fightersA,
    player_b_team_snapshot: fightersB,
    active_badges_a: fightersA.map((f, i) => ({ fighter_name: f.fighter_name, badges: equippedObjA[i] })),
    active_badges_b: fightersB.map((f, i) => ({ fighter_name: f.fighter_name, badges: equippedObjB[i] })),
    impact_breakdown_a: { ...scaledBreakdownA, total: scoreA },
    impact_breakdown_b: { ...scaledBreakdownB, total: scoreB },
    score_ledger_a: buildScoreLedger(scaledBreakdownA, scoreA),
    score_ledger_b: buildScoreLedger(scaledBreakdownB, scoreB),
    fighter_contributions_a: buildFighterContributions(scoredA),
    fighter_contributions_b: buildFighterContributions(scoredB)
  };
}
