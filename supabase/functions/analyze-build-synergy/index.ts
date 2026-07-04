// Supabase Edge Function: analyze-build-synergy
// Deploy: supabase functions deploy analyze-build-synergy
// Secret:  supabase secrets set ANTHROPIC_API_KEY=your-key
// The app works WITHOUT this deployed (client falls back to a local
// deterministic analyzer) — deploy when you want real AI reviews.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const clamp = (n: unknown) => Math.max(0, Math.min(4, Number(n) || 0));
const VALID_STATUS = ["approved", "partially_approved", "rejected"];
const VALID_RATING = ["none", "plausible", "strong", "exceptional"];

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type"
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // 1. Auth check
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: cors });

    // 2-3. Validate + trim input
    const { fighter, playerExplanation } = await req.json();
    if (!fighter?.main_power || typeof playerExplanation !== "string") {
      return new Response(JSON.stringify({ error: "bad input" }), { status: 400, headers: cors });
    }
    const explanation = playerExplanation.slice(0, 1500);

    // 4-5. Ask the AI for structured JSON only
    const prompt = `You are the balance judge for a tactical battle game. A player explains how their powers combine. Do NOT automatically agree. Reward mechanically plausible, situational synergies; reject overclaims (guaranteed wins, infinite effects, ignoring weaknesses/caps).

Fighter: ${JSON.stringify({
      fighting_style: fighter.fighting_style, power_source: fighter.power_source,
      main_power: fighter.main_power, secondary_power: fighter.secondary_power,
      special_skill: fighter.special_skill, ultimate_move: fighter.ultimate_move,
      strength: fighter.strength, speed: fighter.speed, durability: fighter.durability,
      battle_iq: fighter.battle_iq, stamina: fighter.stamina
    })}
Player explanation: "${explanation}"

Respond ONLY with JSON: {"title","status"(approved|partially_approved|rejected),"rating"(none|plausible|strong|exceptional),"summary","pros":[],"cons":[],"conditions":[],"counters":[],"relatedStats":[],"badgeSuggestions":[],"modifierType","modifierPercent"(0-4, rejected=0, plausible<=1, strong<=3, exceptional<=4),"confidence"(0-1)}. Every approval needs >=1 advantage, >=1 condition, >=1 limitation/counter.`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!aiRes.ok) throw new Error("ai unavailable");
    const aiData = await aiRes.json();
    const text = (aiData.content?.[0]?.text || "").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    // 6-7. Validate + clamp — the AI can never touch stats/caps/badges
    const safe = {
      title: String(parsed.title || "Creative Synergy").slice(0, 60),
      status: VALID_STATUS.includes(parsed.status) ? parsed.status : "rejected",
      rating: VALID_RATING.includes(parsed.rating) ? parsed.rating : "none",
      summary: String(parsed.summary || "").slice(0, 400),
      pros: (parsed.pros || []).slice(0, 5).map(String),
      cons: (parsed.cons || []).slice(0, 5).map(String),
      conditions: (parsed.conditions || []).slice(0, 5).map(String),
      counters: (parsed.counters || []).slice(0, 5).map(String),
      relatedStats: (parsed.relatedStats || []).slice(0, 5).map(String),
      badgeSuggestions: (parsed.badgeSuggestions || []).slice(0, 4).map(String),
      modifierType: String(parsed.modifierType || "situational").slice(0, 40),
      modifierPercent: parsed.status === "rejected" ? 0 : clamp(parsed.modifierPercent),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5))
    };
    if (safe.rating === "plausible") safe.modifierPercent = Math.min(safe.modifierPercent, 1);
    if (safe.rating === "strong") safe.modifierPercent = Math.min(safe.modifierPercent, 3);

    return new Response(JSON.stringify(safe), { headers: { ...cors, "content-type": "application/json" } });
  } catch (_e) {
    // 8 + fallback: signal the client to use its local analyzer
    return new Response(JSON.stringify({ error: "fallback" }), { status: 503, headers: cors });
  }
});
