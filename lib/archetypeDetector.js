export function detectArchetype(stats) {
  const { strength, speed, durability, battle_iq, stamina } = stats;
  const entries = [
    ["strength", strength], ["speed", speed], ["durability", durability],
    ["battle_iq", battle_iq], ["stamina", stamina]
  ];
  const max = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]);
  const min = entries.reduce((a, b) => (b[1] < a[1] ? b : a), entries[0]);
  const spread = max[1] - min[1];

  if (spread <= 8) return "Balanced Fighter";
  if (strength >= 30 && durability < 15) return "Glass Cannon";
  if (max[0] === "strength") return "Power Brawler";
  if (max[0] === "speed") return "Speed Specialist";
  if (max[0] === "durability") return "Defensive Tank";
  if (max[0] === "battle_iq") return "Tactical Controller";
  if (max[0] === "stamina") return "Endurance Fighter";
  if (spread >= 25) return "Hybrid Build";
  return "Balanced Fighter";
}

export function statStrongestAndWeakest(stats) {
  const labels = { strength: "Strength", speed: "Speed", durability: "Durability", battle_iq: "Battle IQ", stamina: "Stamina" };
  const entries = Object.entries(stats);
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  return {
    strongest: sorted.slice(0, 2).map(([k]) => labels[k]),
    weakest: labels[sorted[sorted.length - 1][0]]
  };
}
