// Deterministic, varied battle narration built ONLY from real saved
// battle data. Phrase banks rotate based on actual conditions (margin,
// mode, badges used, story boss, etc.) so two fights rarely read the same
// — but the facts (winner, score, grade) are never invented.

const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < (s || "").length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

const OPENERS = [
  (w, l, arena) => `The moment ${w} and ${l} stepped onto ${arena}, neither fighter blinked.`,
  (w, l, arena) => `${arena} fell silent as ${w} and ${l} squared off, both reading the other's stance.`,
  (w, l, arena) => `From the opening second, ${w} and ${l} tested each other across ${arena}.`,
  (w, l, arena) => `Nobody in the crowd expected a slow start — ${w} and ${l} closed the distance immediately.`
];

const MOMENTUM_CLOSE = [
  (w, l) => `The scoreline barely moved for most of the fight — ${w} and ${l} traded advantage back and forth.`,
  (w, l) => `Momentum swung twice before either side could pull ahead cleanly.`,
  (w, l) => `Every exchange between ${w} and ${l} felt like it could have gone either way.`
];
const MOMENTUM_BLOWOUT = [
  (w, l) => `${w} never let ${l} settle into a rhythm.`,
  (w, l) => `From the midpoint on, this was ${w}'s fight to lose.`,
  (w, l) => `${l} simply couldn't find an answer once ${w} took control.`
];

const TACTICAL_LINES = [
  (badge) => `Leaning on ${badge} at the right moment shifted the tempo.`,
  (badge) => `${badge} did real work in the exchanges that mattered most.`,
  (badge) => `The decision to lean on ${badge} paid off exactly when it counted.`
];

const FINISH_LINES = [
  (w, move) => `${w} closed it out with ${move}.`,
  (w, move) => `It ended the way it started building — ${w} landing ${move} to seal it.`,
  (w, move) => `${move} from ${w} was the exclamation point on the whole fight.`
];

const AFTERMATH_WIN = [
  (w) => `${w} walks away with the win — and the story of this fight is already spreading.`,
  (w) => `Another mark in ${w}'s record, earned the hard way.`,
  (w) => `${w} proved the build works exactly as intended.`
];
const AFTERMATH_LOSS = [
  (l) => `${l} will be back — this build has more in it.`,
  (l) => `A tough result for ${l}, but not a fatal one.`,
  (l) => `${l} learns more from this loss than most wins teach.`
];

const HEADLINES_CLOSE = [
  (w) => `${w.toUpperCase()} SURVIVES BY A THREAD`,
  (w) => `ONE FINAL EXCHANGE DECIDES IT ALL`,
  (w) => `${w.toUpperCase()} EDGES OUT A INSTANT CLASSIC`
];
const HEADLINES_BLOWOUT = [
  (w) => `${w.toUpperCase()} DOMINATES FROM START TO FINISH`,
  (w) => `NO CONTEST — ${w.toUpperCase()} TAKES CONTROL EARLY`,
  (w) => `${w.toUpperCase()} SENDS A MESSAGE`
];

/**
 * Builds the full narration block from a NORMALIZED aftermath object
 * (see resultAdapters.js). Everything here is derived, never invented —
 * the winner/score/grade always match what was actually saved.
 */
export function buildNarration(data) {
  // Prefer the actual saved battle's unique id/fight_code (normal battles)
  // or completionId (Story) as the seed — this is what truly guarantees
  // the same saved result always produces the same narration, even in the
  // rare case two different fights share identical winner/score/arena text.
  const idSeed = data.id || data.fightCode || data.completionId;
  const seed = idSeed
    ? hashStr(String(idSeed))
    : hashStr(`${data.winnerName}${data.loserName}${data.myScore}${data.opponentScore}${data.arenaName}`);
  const margin = Math.abs((data.myScore || 0) - (data.opponentScore || 0));
  const totalScore = Math.max(1, (data.myScore || 0) + (data.opponentScore || 0));
  const isClose = margin / totalScore < 0.12;

  const opening = pick(OPENERS, seed)(data.winnerName, data.loserName, data.arenaName || "the arena");
  const momentum = isClose
    ? pick(MOMENTUM_CLOSE, seed + 1)(data.winnerName, data.loserName)
    : pick(MOMENTUM_BLOWOUT, seed + 1)(data.winnerName, data.loserName);

  const tacticalBadge = data.keyBadgeName;
  const tactical = tacticalBadge ? pick(TACTICAL_LINES, seed + 2)(tacticalBadge) : null;

  const finish = data.finishingMove
    ? pick(FINISH_LINES, seed + 3)(data.winnerName, data.finishingMove)
    : `${data.winnerName} closed out the fight in the final exchange.`;

  const aftermath = data.won
    ? pick(AFTERMATH_WIN, seed + 4)(data.winnerName)
    : pick(AFTERMATH_LOSS, seed + 4)(data.loserName);

  const headline = isClose
    ? pick(HEADLINES_CLOSE, seed + 5)(data.winnerName)
    : pick(HEADLINES_BLOWOUT, seed + 5)(data.winnerName);

  return {
    headline,
    opening,
    momentum,
    tactical,
    turningPoint: data.turningPoint || momentum,
    finish,
    aftermath,
    isClose
  };
}
