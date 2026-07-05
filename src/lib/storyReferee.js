import { POWER_COUNTERS, ARENAS, BATTLE_TWISTS } from "./battleEngine";
import { computeEffectiveStats, ABILITY_EFFECTS, STAT_KEYS } from "./storyEngine";
import { getBossByKey } from "./storyBosses";
import { validateBattlePlan } from "./storyPlanValidation";

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function weightedTotal(stats) {
  return stats.strength + stats.speed + stats.durability + stats.battle_iq * 1.1 + stats.stamina;
}

function isCountered(mySource, opponentSource) {
  return (POWER_COUNTERS[mySource] || []).includes(opponentSource);
}

function scoreStatsAndBuild(playerStats, bossStats) {
  const playerTotal = weightedTotal(playerStats);
  const bossTotal = weightedTotal(bossStats);
  const ratio = playerTotal / Math.max(1, playerTotal + bossTotal);
  const advantages = STAT_KEYS.map((key) => {
    const diff = playerStats[key] - bossStats[key];
    return { stat: key, diff, favors: diff > 2 ? "player" : diff < -2 ? "opponent" : "even" };
  });
  return { score: Math.round(ratio * 100), advantages };
}

function scoreMatchup(fighter, boss, equippedAbilities) {
  const interactions = [];
  let playerEdge = 0;

  if (isCountered(fighter.power_source, boss.power_source)) {
    playerEdge += 20;
    interactions.push(`Your ${fighter.power_source} directly counters ${boss.name}'s ${boss.power_source}.`);
  }
  if (isCountered(boss.power_source, fighter.power_source)) {
    playerEdge -= 20;
    interactions.push(`${boss.name}'s ${boss.power_source} directly counters your ${fighter.power_source}.`);
  }

  const abilityInteractions = [];
  equippedAbilities.forEach((ability) => {
    const fx = ABILITY_EFFECTS[ability.key];
    if (fx?.vsBonusPct) {
      const homeBoss = getBossByKey(ability.source_boss);
      if (homeBoss && homeBoss.helpsAgainst === boss.key) {
        playerEdge += 15;
        abilityInteractions.push(`${ability.name} gives a real edge against ${boss.name}.`);
      }
    }
  });

  if (interactions.length === 0 && abilityInteractions.length === 0) {
    interactions.push("No strong power-source counter in either direction — a neutral matchup.");
  }

  const score = Math.max(0, Math.min(100, 50 + playerEdge));
  return { score, interactions, abilityInteractions };
}

function scoreStrategy(planText, fighter, boss, equippedAbilities) {
  const validation = validateBattlePlan(planText, fighter, equippedAbilities);
  const strengths = [];
  const holes = [...validation.issues];

  const mentionsSignature = boss.signature_move && planText.toLowerCase().includes(boss.signature_move.toLowerCase().split(" ")[0]);
  if (mentionsSignature) strengths.push(`Directly plans around ${boss.signature_move}.`);
  else holes.push(`Doesn't address ${boss.name}'s signature move, ${boss.signature_move}.`);

  if (validation.mentionsDefense) strengths.push("Includes a real defensive consideration.");
  if (validation.mentionsOwnPower) strengths.push("Grounded in the fighter's actual powers.");

  const arenaAware = /(arena|environment|terrain|field|battlefield)/i.test(planText);
  if (arenaAware) strengths.push("Accounts for the arena/environment.");

  let score = validation.substanceScore;
  if (mentionsSignature) score += 10;
  if (arenaAware) score += 5;
  score = Math.max(0, Math.min(100, score));

  return { score, strengths, holes, unsupportedClaims: validation.unsupportedClaims, validation };
}

function scoreOpponentAI(boss) {
  return Math.round(40 + (boss.stats.battle_iq / 40) * 60);
}

function scoreArena(fighter, boss, arena) {
  let score = 50;
  const effects = [];
  if (arena.boost.includes(fighter.power_source)) { score += 15; effects.push(`${arena.name} favors your ${fighter.power_source}.`); }
  if (arena.penalty.includes(fighter.power_source)) { score -= 15; effects.push(`${arena.name} works against your ${fighter.power_source}.`); }
  if (arena.boost.includes(boss.power_source)) { score -= 15; effects.push(`${arena.name} favors ${boss.name}'s ${boss.power_source}.`); }
  if (arena.penalty.includes(boss.power_source)) { score += 15; effects.push(`${arena.name} works against ${boss.name}'s ${boss.power_source}.`); }
  if (effects.length === 0) effects.push(`${arena.name} is neutral for this matchup.`);
  return { score: Math.max(0, Math.min(100, score)), effects };
}

function gradeFromMargin(won, margin, strategyScore) {
  if (!won) return margin < 8 ? "D" : "F";
  if (margin > 25 && strategyScore > 80) return "S";
  if (margin > 15) return "A";
  if (margin > 6) return "B";
  return "C";
}

export function judgeStoryBattle({ fighter, progress, boss, equippedAbilities, planText }) {
  const playerStats = computeEffectiveStats(fighter, progress);
  const arena = pick(ARENAS);
  const twist = pick(BATTLE_TWISTS);

  const statResult = scoreStatsAndBuild(playerStats, boss.stats);
  const matchupResult = scoreMatchup(fighter, boss, equippedAbilities);
  const strategyResult = scoreStrategy(planText, fighter, boss, equippedAbilities);
  const opponentAIScore = scoreOpponentAI(boss);
  const arenaResult = scoreArena(fighter, boss, arena);
  const uncertainty = rand(-3, 3);

  const playerComposite =
    statResult.score * 0.30 +
    matchupResult.score * 0.25 +
    strategyResult.score * 0.25 +
    (100 - opponentAIScore) * 0.10 +
    arenaResult.score * 0.07 +
    (50 + uncertainty) * 0.03;

  const opponentComposite = 100 - playerComposite + (uncertainty * 0.03);

  const won = playerComposite >= opponentComposite;
  const margin = Math.abs(playerComposite - opponentComposite);
  const grade = gradeFromMargin(won, margin, strategyResult.score);

  const statAdvantages = statResult.advantages
    .filter((a) => a.favors !== "even")
    .map((a) => `${a.stat.replace("_", " ")}: ${a.favors === "player" ? "You" : boss.name} ahead by ${Math.abs(a.diff)}`);

  const biggestPlayerAdvantage = statResult.advantages.filter((a) => a.favors === "player").sort((a, b) => b.diff - a.diff)[0];
  const biggestOpponentAdvantage = statResult.advantages.filter((a) => a.favors === "opponent").sort((a, b) => a.diff - b.diff)[0];

  const turningPoint = won
    ? (matchupResult.abilityInteractions[0] || matchupResult.interactions[0] || strategyResult.strengths[0] || "Your build's overall edge carried the fight.")
    : (strategyResult.holes[0] || matchupResult.interactions[0] || `${boss.name}'s raw stats were too much to overcome this time.`);

  const fightPhases = buildFightPhases({ fighter, boss, statResult, matchupResult, strategyResult, won });

  const finalExplanation = won
    ? `You defeated ${boss.name}. ${turningPoint} Final composite: ${Math.round(playerComposite)} to ${Math.round(opponentComposite)}.`
    : `${boss.name} defeated you. ${turningPoint} Final composite: ${Math.round(playerComposite)} to ${Math.round(opponentComposite)}.`;

  return {
    winner: won ? "player" : "opponent",
    playerScore: Math.round(playerComposite),
    opponentScore: Math.round(opponentComposite),
    strategyScore: Math.round(strategyResult.score),
    strategyStrengths: strategyResult.strengths,
    strategyHoles: strategyResult.holes,
    unsupportedClaims: strategyResult.unsupportedClaims,
    powerInteractions: [...matchupResult.interactions, ...matchupResult.abilityInteractions],
    statAdvantages,
    abilityInteractions: matchupResult.abilityInteractions,
    arenaEffects: arenaResult.effects,
    turningPoint,
    fightPhases,
    finalExplanation,
    grade,
    arena, twist,
    biggestPlayerAdvantage: biggestPlayerAdvantage ? biggestPlayerAdvantage.stat : null,
    biggestOpponentAdvantage: biggestOpponentAdvantage ? biggestOpponentAdvantage.stat : null,
    playerEffectiveStats: playerStats,
    margin: Math.round(margin)
  };
}

function buildFightPhases({ fighter, boss, statResult, matchupResult, strategyResult, won }) {
  const opener = strategyResult.strengths[0] || "You opened cautiously, feeling out the matchup.";
  const adaptation = matchupResult.interactions[0] || `${boss.name} adjusted to your opening approach.`;
  const clash = statResult.advantages.find((a) => a.favors !== "even");
  const clashLine = clash
    ? `${clash.favors === "player" ? "Your" : boss.name + "'s"} ${clash.stat.replace("_", " ")} advantage started to show.`
    : "Both fighters traded even exchanges.";
  const turn = strategyResult.holes[0]
    ? `A gap in the plan (${strategyResult.holes[0].toLowerCase()}) gave ${boss.name} an opening.`
    : "Your plan held up under pressure.";
  const finish = won
    ? `${fighter.fighter_name} closed it out.`
    : `${boss.name} finished the fight with ${boss.signature_move}.`;

  return [
    { phase: "Opening Exchange", text: opener },
    { phase: "Adaptation", text: adaptation },
    { phase: "Power Clash", text: clashLine },
    { phase: "Turning Point", text: turn },
    { phase: "Final Exchange", text: finish }
  ];
}
