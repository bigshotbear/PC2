import React, { useState } from "react";
import { getBadgeProgress } from "../lib/badgeEngine";

function buildBasicTips(fighter, statTotal, powerPointCost, cap) {
  const tips = [];

  if (fighter.power_source === "Fire" && fighter.fighting_style === "Brawler") {
    tips.push("Fire + Brawler is an aggressive combination. Recommended next: push Strength or Stamina higher.");
  }
  if (fighter.fighting_style === "Speedster" && fighter.speed < 25) {
    tips.push(`Your Speed is ${fighter.speed}. Fast opponents may act before you establish pressure — consider raising it.`);
  }
  if (fighter.fighting_style === "Tank" && fighter.durability < 25) {
    tips.push(`Tank works best with real Durability behind it — yours is ${fighter.durability}.`);
  }
  if (statTotal !== 100) {
    tips.push(statTotal < 100 ? `You still have ${100 - statTotal} stat points to spend.` : `You're ${statTotal - 100} points over — remove some before saving.`);
  }
  if (powerPointCost > cap) {
    tips.push(`Power cost is ${powerPointCost - cap} over budget for this mode.`);
  }
  if (fighter.main_power === fighter.secondary_power) {
    tips.push("Main and Secondary Power are the same — pick a different Secondary for more coverage.");
  }

  const progress = getBadgeProgress(fighter, powerPointCost, cap);
  const close = progress.find((b) => !b.level && b.matchCount >= 1 && b.statKey && b.statValue < b.statBase && b.statBase - b.statValue <= 3);
  if (close) tips.push(`${close.statKey.replace("_", " ")} is ${close.statValue}. Add ${close.statBase - close.statValue} to unlock ${close.name}.`);

  if (tips.length === 0) tips.push("This build looks solid so far. Keep going!");
  return tips;
}

export default function LiveClashCoach({ fighter, statTotal, powerPointCost, cap }) {
  const [mode, setMode] = useState("basic");
  const tips = buildBasicTips(fighter, statTotal, powerPointCost, cap);

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div className="card-title" style={{ marginBottom: 0 }}>⚡ Clash Coach</div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setMode("basic")} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--line)", background: mode === "basic" ? "rgba(230,184,74,0.2)" : "none", color: mode === "basic" ? "var(--gold-bright)" : "var(--text-dim)" }}>Basic</button>
          <button onClick={() => setMode("detailed")} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--line)", background: mode === "detailed" ? "rgba(192,132,252,0.2)" : "none", color: mode === "detailed" ? "#c084fc" : "var(--text-dim)" }}>Detailed</button>
        </div>
      </div>
      {tips.slice(0, mode === "basic" ? 2 : tips.length).map((t) => (
        <div key={t} style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 6, lineHeight: 1.5 }}>{t}</div>
      ))}
    </div>
  );
}
