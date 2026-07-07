// Selects one dynamic boss line after a loss (or a near-win), based on
// real conditions from that fight — never a random unrelated quote.

export function pickBossDialogue(boss, storyResult, timesLostToBoss) {
  const { weakestStat, usedRecommendedCounter, margin, won } = storyResult;

  if (!won && margin < 0.1) return boss.dialogue.barelySurvived;
  if (usedRecommendedCounter) return boss.dialogue.hadCounter;
  if (timesLostToBoss >= 3) return boss.dialogue.manyLosses;
  if (weakestStat === "speed") return boss.dialogue.lowSpeed;
  if (weakestStat === "durability") return boss.dialogue.lowDurability;
  return boss.dialogue.lowDurability;
}
