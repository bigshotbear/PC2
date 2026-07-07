// Builds a text prompt the player can paste into any external image
// generator (Gemini, ChatGPT, etc.), then upload the result back in.

export function buildImagePrompt(fighter) {
  const parts = [
    `A tactical anime/superhero style character portrait of "${fighter.fighter_name}"`,
    `a ${fighter.character_type} with a ${fighter.fighting_style} fighting style`,
    `wielding ${fighter.power_source}-based powers`,
    `their main power is ${fighter.main_power} and secondary power is ${fighter.secondary_power}`
  ];
  if (fighter.special_skill && fighter.special_skill !== "None") parts.push(`with the special skill ${fighter.special_skill}`);
  parts.push(`preparing to use their ultimate move, ${fighter.ultimate_move}`);
  parts.push("dark background with a glowing aura matching their power source, dramatic lighting, dynamic battle-ready pose, digital illustration, high detail, portrait orientation");

  return parts.join(", ") + ".";
}
