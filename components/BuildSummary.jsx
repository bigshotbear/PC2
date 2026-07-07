import React, { useState } from "react";
import { detectArchetype } from "../lib/archetypeDetector";

export default function BuildSummary({ fighter, statTotal, powerPointCost, cap, badges, almostBadges }) {
  const [expanded, setExpanded] = useState(false);
  const archetype = detectArchetype({
    strength: fighter.strength, speed: fighter.speed, durability: fighter.durability,
    battle_iq: fighter.battle_iq, stamina: fighter.stamina
  });

  return (
    <div className="card card-glow">
      <div className="card-title">Current Build</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gold-bright)" }}>{fighter.fighter_name || "Unnamed Fighter"}</div>
      <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 8 }}>
        {fighter.character_type} • {fighter.fighting_style} • {fighter.power_source}
      </div>

      <div style={{ fontSize: 12.5, marginBottom: 4 }}>Power Budget: <strong style={{ color: powerPointCost > cap ? "var(--loss)" : "var(--gold-bright)" }}>{powerPointCost} / {cap}</strong></div>
      <div style={{ fontSize: 12.5, marginBottom: 8 }}>Stats: <strong style={{ color: statTotal === 100 ? "var(--win)" : "var(--loss)" }}>{statTotal} / 100</strong></div>

      <div style={{ fontSize: 12.5, marginBottom: 8 }}>Build Type: <strong style={{ color: "var(--gold-bright)" }}>{archetype}</strong></div>

      <div style={{ fontSize: 12.5 }}>Badges: <strong>{badges.length} unlocked</strong>, {almostBadges.length} within reach</div>

      <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => setExpanded((e) => !e)}>
        {expanded ? "Hide" : "View"} Full Summary
      </button>

      {expanded && (
        <div style={{ fontSize: 12.5, marginTop: 8, lineHeight: 1.7 }}>
          <div>Main Power: <strong>{fighter.main_power}</strong></div>
          <div>Secondary Power: <strong>{fighter.secondary_power}</strong></div>
          <div>Special Skill: <strong>{fighter.special_skill}</strong></div>
          <div>Ultimate: <strong>{fighter.ultimate_move}</strong></div>
          <div>Weakness: <strong>{fighter.weakness}</strong></div>
        </div>
      )}
    </div>
  );
}
