import React from "react";
import FighterVisual from "./FighterVisual.jsx";
import StatDonutChart from "./StatDonutChart.jsx";

export default function FighterReviewCard({ fighter, statTotal, powerPointCost, cap, badgeCount }) {
  return (
    <div>
      <div className="card card-glow" style={{ textAlign: "center" }}>
        <div style={{ width: 130, height: 130, margin: "0 auto" }}>
          <FighterVisual fighter={fighter} size={130} animated />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gold-bright)", marginTop: 8 }}>{fighter.fighter_name || "Unnamed Fighter"}</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{fighter.character_type} • {fighter.fighting_style} • {fighter.power_source}</div>
      </div>

      <div className="card">
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          <div>Main Power: <strong style={{ color: "var(--gold-bright)" }}>{fighter.main_power}</strong> (Lvl {fighter.main_power_level})</div>
          <div>Secondary Power: <strong style={{ color: "var(--gold-bright)" }}>{fighter.secondary_power}</strong> (Lvl {fighter.secondary_power_level})</div>
          <div>Special Skill: <strong style={{ color: "var(--gold-bright)" }}>{fighter.special_skill}</strong></div>
          <div>Ultimate: <strong style={{ color: "var(--gold-bright)" }}>{fighter.ultimate_move}</strong> (Lvl {fighter.ultimate_level})</div>
          <div>Weakness: <strong style={{ color: "var(--loss)" }}>{fighter.weakness}</strong></div>
        </div>
      </div>

      <StatDonutChart fighter={fighter} stats={{ strength: fighter.strength, speed: fighter.speed, durability: fighter.durability, battle_iq: fighter.battle_iq, stamina: fighter.stamina }} />

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
          <span>Power Budget</span>
          <strong style={{ color: powerPointCost > cap ? "var(--loss)" : "var(--win)" }}>{powerPointCost} / {cap}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
          <span>Stats</span>
          <strong style={{ color: statTotal === 100 ? "var(--win)" : "var(--loss)" }}>{statTotal} / 100</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span>Badges</span>
          <strong style={{ color: "var(--gold-bright)" }}>{badgeCount} unlocked</strong>
        </div>
      </div>
    </div>
  );
}
