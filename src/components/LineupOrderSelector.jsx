import React from "react";
import FighterVisual from "./FighterVisual.jsx";

const ROLE_LABELS = {
  2: ["Opener", "Closer"],
  3: ["Opener", "Middle", "Closer"],
  5: ["Lead", "Vanguard", "Midline", "Anchor", "Closer"]
};

export default function LineupOrderSelector({ fighters, onChange }) {
  const roles = ROLE_LABELS[fighters.length] || fighters.map((_, i) => `Position ${i + 1}`);

  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...fighters];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };
  const moveDown = (index) => {
    if (index === fighters.length - 1) return;
    const next = [...fighters];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  return (
    <div className="card card-glow">
      <div className="card-title">Arrange Your Lineup</div>
      <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 12 }}>
        Your {roles[0]} fights first. Winners carry their remaining health into the next matchup.
      </div>
      {fighters.map((f, i) => (
        <div key={f.id || f.fighter_name} className="fighter-card" style={{ marginBottom: 8 }}>
          <div style={{ width: 48, height: 48, flexShrink: 0 }}><FighterVisual fighter={f} size={46} /></div>
          <div className="fighter-card-body">
            <div className="fighter-card-name">{i + 1}. {f.fighter_name}</div>
            <div className="fighter-card-meta">{roles[i]}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button className="icon-btn" onClick={() => moveUp(i)} disabled={i === 0}>▲</button>
            <button className="icon-btn" onClick={() => moveDown(i)} disabled={i === fighters.length - 1}>▼</button>
          </div>
        </div>
      ))}
    </div>
  );
}
