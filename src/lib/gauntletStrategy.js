// Lightweight Gauntlet lineup strategy for the computer: put the sturdiest
// fighter first to soak an early loss, the strongest all-around fighter
// last as the closer, everyone else in between by overall power.

function overallPower(f) {
  return f.strength + f.speed + f.durability * 1.2 + f.battle_iq + f.stamina + f.main_power_level * 4 + f.ultimate_level * 3;
}

export function orderComputerLineup(fighters) {
  if (fighters.length <= 1) return fighters;

  const sorted = [...fighters].sort((a, b) => overallPower(a) - overallPower(b));
  // Sturdiest opener: prioritize durability among the lower-power half.
  const opener = [...fighters].sort((a, b) => b.durability - a.durability)[0];
  const closer = [...fighters].sort((a, b) => overallPower(b) - overallPower(a))[0];

  const middle = fighters.filter((f) => f !== opener && f !== closer);
  if (opener === closer) return sorted; // only distinguishable fighter — fall back to power order

  return [opener, ...middle, closer];
}
