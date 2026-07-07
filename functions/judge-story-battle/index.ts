// Supabase Edge Function: judge-story-battle
// Deploy: supabase functions deploy judge-story-battle
// Secret:  supabase secrets set ANTHROPIC_API_KEY=your-key
// Optional — the game works fully without this deployed; the client
// falls back to the local deterministic referee (storyReferee.js) with
// the exact same weighting if this call fails or isn't deployed.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: cors });

    const { fighter, boss, effectiveStats, equippedAbilities, planText, arena, twist } = await req.json();
    if (!fighter || !boss || typeof planText !== "string") {
      return new Response(JSON.stringify({ error: "bad input" }), { status: 400, headers: cors });
    }

    const prompt = `You are a STRICT tactical battle referee for a fighting game's Story Mode. Use ONLY the real data given below — never invent stats, powers, or abilities. Weight your decision: stats/build 30%, power/ability matchup 25%, strategy quality 25%, opponent AI play 10%, arena/twist 7%, random uncertainty max 3%. Actively look for unsupported claims, missing defense, ignored opponent intelligence, and impossible timing in the plan. Do not let confident writing alone win the fight.

Player fighter: ${JSON.stringify(fighter)}
Player effective stats (with Story bonuses): ${JSON.stringify(effectiveStats)}
Equipped Story abilities: ${JSON.stringify(equippedAbilities)}
Opponent boss: ${JSON.stringify(boss)}
Arena: ${arena?.name}, Twist: ${twist}
Player's submitted plan: "${String(planText).slice(0, 2000)}"

Respond ONLY with JSON matching exactly:
{"winner":"player"|"opponent","playerScore":0-100,"opponentScore":0-100,"strategyScore":0-100,"strategyStrengths":[],"strategyHoles":[],"unsupportedClaims":[],"powerInteractions":[],"statAdvantages":[],"abilityInteractions":[],"arenaEffects":[],"turningPoint":"","fightPhases":[{"phase":"","text":""}],"finalExplanation":"","grade":"S"|"A"|"B"|"C"|"D"|"F"}`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1200, messages: [{ role: "user", content: prompt }] })
    });

    if (!aiRes.ok) throw new Error("ai unavailable");
    const aiData = await aiRes.json();
    const text = (aiData.content?.[0]?.text || "").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    const validGrades = ["S", "A", "B", "C", "D", "F"];
    if (!["player", "opponent"].includes(parsed.winner) || !validGrades.includes(parsed.grade)) {
      throw new Error("malformed response");
    }

    const safe = {
      winner: parsed.winner,
      playerScore: Math.max(0, Math.min(100, Number(parsed.playerScore) || 0)),
      opponentScore: Math.max(0, Math.min(100, Number(parsed.opponentScore) || 0)),
      strategyScore: Math.max(0, Math.min(100, Number(parsed.strategyScore) || 0)),
      strategyStrengths: (parsed.strategyStrengths || []).slice(0, 6).map(String),
      strategyHoles: (parsed.strategyHoles || []).slice(0, 6).map(String),
      unsupportedClaims: (parsed.unsupportedClaims || []).slice(0, 6).map(String),
      powerInteractions: (parsed.powerInteractions || []).slice(0, 6).map(String),
      statAdvantages: (parsed.statAdvantages || []).slice(0, 6).map(String),
      abilityInteractions: (parsed.abilityInteractions || []).slice(0, 6).map(String),
      arenaEffects: (parsed.arenaEffects || []).slice(0, 4).map(String),
      turningPoint: String(parsed.turningPoint || "").slice(0, 300),
      fightPhases: Array.isArray(parsed.fightPhases) ? parsed.fightPhases.slice(0, 5) : [],
      finalExplanation: String(parsed.finalExplanation || "").slice(0, 800),
      grade: parsed.grade,
      source: "ai"
    };

    return new Response(JSON.stringify(safe), { headers: { ...cors, "content-type": "application/json" } });
  } catch (_e) {
    return new Response(JSON.stringify({ error: "fallback" }), { status: 503, headers: cors });
  }
});
