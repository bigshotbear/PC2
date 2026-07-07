import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterVisual from "./FighterVisual.jsx";

const COUNT_BY_SIZE = { "1v1": 1, "2v2": 2, "3v3": 3, "5v5": 5 };

/**
 * Lets the player pick exactly `count` saved fighters directly — no team
 * required. Optionally offers "Use a Saved Team" to quick-fill from an
 * existing team of the matching size.
 */
export default function FighterPicker({ userId, battleSize, selectedIds, onChange }) {
  const [fighters, setFighters] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showTeams, setShowTeams] = useState(false);
  const [loading, setLoading] = useState(true);
  const count = COUNT_BY_SIZE[battleSize] || 1;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: f }, { data: t }] = await Promise.all([
        supabase.from("fighters").select("*").eq("owner_id", userId).order("created_at", { ascending: false }),
        supabase.from("teams").select("*").eq("owner_id", userId).eq("battle_mode", battleSize)
      ]);
      setFighters(f || []);
      setTeams(t || []);
      setLoading(false);
    })();
  }, [userId, battleSize]);

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else if (selectedIds.length < count) {
      onChange([...selectedIds, id]);
    }
  };

  const useTeam = (team) => {
    onChange((team.fighter_ids || []).slice(0, count));
    setShowTeams(false);
  };

  if (loading) return <div className="center" style={{ padding: 20 }}><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Selected {selectedIds.length} / {count}</div>
        {teams.length > 0 && (
          <button className="btn btn-ghost" style={{ marginBottom: 0, width: "auto", padding: "8px 12px", fontSize: 12 }} onClick={() => setShowTeams((s) => !s)}>
            Use a Saved Team
          </button>
        )}
      </div>

      {showTeams && (
        <div style={{ marginBottom: 12 }}>
          {teams.map((t) => (
            <button key={t.id} className="btn" onClick={() => useTeam(t)}>
              {t.team_name} ({t.fighter_snapshots?.length || 0} fighters)
            </button>
          ))}
        </div>
      )}

      {fighters.length === 0 ? (
        <div className="empty-state">
          <div className="display">No saved fighters</div>
          <p>Build a fighter first — no team required.</p>
        </div>
      ) : (
        fighters.map((f) => {
          const isSelected = selectedIds.includes(f.id);
          return (
            <div
              key={f.id}
              className="fighter-card"
              style={{
                padding: 10, borderRadius: 10, cursor: "pointer", marginBottom: 8,
                border: `1px solid ${isSelected ? "var(--gold)" : "var(--line)"}`,
                background: isSelected ? "rgba(230,184,74,0.08)" : "transparent"
              }}
              onClick={() => toggle(f.id)}
            >
              <div style={{ width: 52, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FighterVisual fighter={f} size={50} />
              </div>
              <div className="fighter-card-body">
                <div className="fighter-card-name">{f.fighter_name}</div>
                <div className="fighter-card-meta">{f.power_source} · {f.fighting_style}</div>
              </div>
              <div style={{ color: isSelected ? "var(--gold-bright)" : "var(--text-dim)" }}>{isSelected ? "✓" : "+"}</div>
            </div>
          );
        })
      )}
    </div>
  );
}
