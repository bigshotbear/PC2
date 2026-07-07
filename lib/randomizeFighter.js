import {
  CHARACTER_TYPES, FIGHTING_STYLES, POWER_SOURCES, POWERS, SPECIAL_SKILLS,
  WEAKNESSES, ULTIMATES
} from "./fighterOptions";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function randomizeFighterFields() {
  const [main, secondary] = (() => {
    const a = pick(POWERS);
    let b = pick(POWERS);
    let guard = 0;
    while (b === a && guard < 20) { b = pick(POWERS); guard += 1; }
    return [a, b];
  })();

  const keys = ["strength", "speed", "durability", "battle_iq", "stamina"];
  const weights = keys.map(() => Math.random() + 0.4);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const floor = 5;
  const remaining = 100 - floor * keys.length;
  const stats = {};
  let allocated = 0;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) stats[k] = floor + (remaining - allocated);
    else {
      const amt = Math.round((weights[i] / totalWeight) * remaining);
      stats[k] = floor + amt;
      allocated += amt;
    }
  });

  return {
    character_type: pick(CHARACTER_TYPES),
    fighting_style: pick(FIGHTING_STYLES),
    power_source: pick(POWER_SOURCES),
    main_power: main,
    main_power_level: 1 + Math.floor(Math.random() * 3),
    secondary_power: secondary,
    secondary_power_level: 1 + Math.floor(Math.random() * 3),
    special_skill: pick(SPECIAL_SKILLS),
    weakness: pick(WEAKNESSES),
    ultimate_move: pick(ULTIMATES),
    ultimate_level: 1 + Math.floor(Math.random() * 3),
    ...stats
  };
}
