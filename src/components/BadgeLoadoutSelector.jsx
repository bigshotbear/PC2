import React, { useMemo, useState } from "react";
import { calculateFighterBadges } from "../lib/badgeEngine";
import { MAX_ACTIVE_BADGES, autoSelectBadges } from "../lib/badgeLoadout";
import FighterVisual from "./FighterVisual.jsx";

const LEVEL_COLORS = { Bronze: "#c17a4a", Silver: "#b7bfc9", Gold: "var(--gold-bright)" };

/**
 * fighters: array of fighter rows
 * value: { [fighterId]: string[] } currently selected badge names per fighter
 * onChange(fighterId, badgeNames)
 * onContinue(): called once every fighter has a valid selection
 */
export default function BadgeLoadoutSelector({ fighters, value, onChange, onContinue }) {
  const [active, setActive] = useState(0);

  const earnedByFighter = useMemo(() => {
    const map = {};
    fighters.forEach((f) => {
      map[f.id] = calculateFighterBadges(f, f.power_point_cost, f.power_point_cap);
    });
    return map;
  }, [fighters]);

  const toggle = (fighterId, badgeName) => {
    const current = value[fighterId] || [];
    if (current.includes(badgeName)) {
      onChange(fighterId, current.filter((n) => n !== badgeName));
    } else if (current.length < MAX_ACTIVE_BADGES) {
      onChange(fighterId, [...current, badgeName]);
    }
  };

  const allReady = fighters.every((f) => {
    const earned = earnedByFighter[f.id] || [];
    const selected = value[f.id] || [];
    const needed = Math.min(MAX_ACTIVE_BADGES, earned.length);
    return selected.length === needed;
  });

  const fighter = fighters[active];
  const earned = earnedByFighter[fighter.id] || [];
  const selected = value[fighter.id] || [];
  const needed = Math.min(MAX_ACTIVE_BADGES, earned.length);

  return (
    <div className="card card-glow">
      <div className="card-title">Select Active Badges</div>

      {fighters.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {fighters.map((f, i) => (
            <button
              key={f.id}
              className="chip"
              style={{ cursor: "pointer", background: active === i ? "rgba(230,184,74,0.2)" : "transparent" }}
              onClick={() => setActive(i)}
            >
              {f.fighter_name} ({(value[f.id] || []).length}/{Math.min(MAX_ACTIVE_BADGES, (earnedByFighter[f.id] || []).length)})
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <div style={{ width: 56, height: 56, flexShrink: 0 }}><FighterVisual fighter={fighter} size={54} /></div>
        <div>
          <div style={{ fontWeight: 700 }}>{fighter.fighter_name}</div>
          <div style={{ fontSize: 12, color: selected.length === needed ? "var(--win)" : "var(--gold)" }}>
            {selected.length}/{needed} selected
          </div>
        </div>
      </div>

      {earned.length === 0 ? (
        <div className="empty-state"><div className="display">No badges earned yet</div></div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {earned.map((b) => {
            const isOn = selected.includes(b.name);
            return (
              <button
                key={b.name}
                className="chip"
                title={b.description}
                onClick={() => toggle(fighter.id, b.name)}
                style={{
                  cursor: "pointer",
                  borderColor: LEVEL_COLORS[b.level],
                  color: isOn ? "#0a0c12" : LEVEL_COLORS[b.level],
                  background: isOn ? LEVEL_COLORS[b.level] : "transparent"
                }}
              >
                {b.level === "Gold" ? "🥇" : b.level === "Silver" ? "🥈" : "🥉"} {b.name}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" style={{ marginBottom: 0, width: "auto", padding: "10px 14px" }} onClick={() => onChange(fighter.id, autoSelectBadges(fighter))}>
          Auto Select
        </button>
        <button className="btn btn-ghost" style={{ marginBottom: 0, width: "auto", padding: "10px 14px" }} onClick={() => onChange(fighter.id, [])}>
          Clear
        </button>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={onContinue} disabled={!allReady}>
        Confirm Matchup
      </button>
    </div>
  );
}
