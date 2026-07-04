import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getBadgeProgress, TEAM_BADGE_INFO, MATCHUP_BADGE_INFO } from "../lib/badgeEngine";

const LEVEL_COLORS = { Bronze: "#c17a4a", Silver: "#b7bfc9", Gold: "var(--gold-bright)" };
const CATEGORY_COLORS = { Attack: "#ff7a5c", Defense: "#5ca8ff", Passive: "#b48aff", Tactical: "#4ade80" };
const CATEGORIES = ["All", "Attack", "Defense", "Passive", "Tactical"];
const LEVELS = ["All", "Bronze", "Silver", "Gold", "Earned", "Locked"];

export default function BadgeGuide({ user, preselectedFighterId, onNavigate }) {
  const [fighters, setFighters] = useState([]);
  const [selectedId, setSelectedId] = useState(preselectedFighterId || "");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("fighters").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      setFighters(data || []);
      if (!preselectedFighterId && data?.length) setSelectedId(data[0].id);
    })();
  }, [user.id, preselectedFighterId]);

  const fighter = fighters.find((f) => f.id === selectedId) || null;

  const progress = useMemo(
    () => (fighter ? getBadgeProgress(fighter, fighter.power_point_cost, fighter.power_point_cap) : getBadgeProgress({}, 0, 10)),
    [fighter]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return progress.filter((b) => {
      if (q && !b.name.toLowerCase().includes(q)) return false;
      if (category !== "All" && b.category !== category) return false;
      if (levelFilter === "Earned" && !b.level) return false;
      if (levelFilter === "Locked" && b.level) return false;
      if (["Bronze", "Silver", "Gold"].includes(levelFilter) && b.level !== levelFilter) return false;
      return true;
    });
  }, [progress, search, category, levelFilter]);

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 12 }}>
        <button className="back-btn" onClick={() => onNavigate("dashboard")}>← Back</button>
      </div>

      <h2 style={{ color: "var(--gold-bright)", textTransform: "uppercase" }}>Power Clash Badge Guide</h2>
      <div style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 14 }}>
        Learn every badge, its requirements, and how close your fighter is to unlocking it.
      </div>

      <div className="card">
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Use Fighter</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {fighters.length === 0 && <option value="">No saved fighters yet</option>}
            {fighters.map((f) => <option key={f.id} value={f.id}>{f.fighter_name}</option>)}
          </select>
        </div>
        <input className="search-bar" style={{ marginBottom: 8 }} placeholder="Search badges..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
          {CATEGORIES.map((c) => (
            <button key={c} className="chip" onClick={() => setCategory(c)}
              style={{ cursor: "pointer", background: category === c ? "rgba(230,184,74,0.2)" : "transparent", borderColor: c !== "All" ? CATEGORY_COLORS[c] : "var(--line)", color: c !== "All" ? CATEGORY_COLORS[c] : "var(--text-dim)" }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {LEVELS.map((l) => (
            <button key={l} className="chip" onClick={() => setLevelFilter(l)}
              style={{ cursor: "pointer", background: levelFilter === l ? "rgba(230,184,74,0.2)" : "transparent", borderColor: LEVEL_COLORS[l] || "var(--line)", color: LEVEL_COLORS[l] || "var(--text-dim)" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {filtered.map((b) => (
        <button key={b.name} className="card" style={{ width: "100%", textAlign: "left", cursor: "pointer" }} onClick={() => setDetail(b)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontWeight: 700 }}>{b.level ? (b.level === "Gold" ? "🥇 " : b.level === "Silver" ? "🥈 " : "🥉 ") : "🔒 "}{b.name}</span>
              <span className="chip" style={{ marginLeft: 8, borderColor: CATEGORY_COLORS[b.category], color: CATEGORY_COLORS[b.category], fontSize: 10 }}>{b.category}</span>
            </div>
            <span style={{ fontSize: 12, color: b.level ? LEVEL_COLORS[b.level] : "var(--text-dim)" }}>{b.level || "Locked"}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{b.description}</div>
          <div style={{ fontSize: 12, color: "var(--gold)", marginTop: 4 }}>→ {b.nextStep}</div>
        </button>
      ))}

      <div className="card">
        <div className="card-title">Team Badges (need a full team)</div>
        {TEAM_BADGE_INFO.map((b) => (
          <div key={b.name} style={{ marginBottom: 8, fontSize: 13 }}>
            <strong>{b.name}</strong> <span className="chip" style={{ fontSize: 10, borderColor: CATEGORY_COLORS[b.category], color: CATEGORY_COLORS[b.category] }}>{b.category}</span>
            <div style={{ color: "var(--text-dim)", fontSize: 12.5 }}>{b.description} Requires: {b.requirement}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Matchup Badges (activate in battle)</div>
        {MATCHUP_BADGE_INFO.map((b) => (
          <div key={b.name} style={{ marginBottom: 8, fontSize: 13 }}>
            <strong>{b.name}</strong>
            <div style={{ color: "var(--text-dim)", fontSize: 12.5 }}>{b.description} Requires: {b.requirement}</div>
          </div>
        ))}
      </div>

      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(9,11,16,0.9)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setDetail(null)}>
          <div className="card card-glow" style={{ maxWidth: 420, width: "100%", marginBottom: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong style={{ color: LEVEL_COLORS[detail.level] || "var(--text-dim)" }}>{detail.name} — {detail.level || "Locked"}</strong>
              <button className="icon-btn" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>{detail.description}</div>
            <div style={{ fontSize: 12.5, marginBottom: 6 }}>
              {detail.matched.map((m) => <div key={m} style={{ color: "var(--win)" }}>✓ {m}</div>)}
              {detail.missing.slice(0, 4).map((m) => <div key={m} style={{ color: "var(--loss)" }}>✗ {m} not selected</div>)}
              {detail.statKey && (
                <div style={{ color: detail.statValue >= detail.statBase ? "var(--win)" : "var(--loss)" }}>
                  {detail.statValue >= detail.statBase ? "✓" : "✗"} {detail.statKey.replace("_", " ")} {detail.statValue} (Bronze needs {detail.statBase}+, Silver {detail.statBase + 5}+, Gold {detail.statBase + 10}+)
                </div>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 6 }}>
              Effect: ~2% at Bronze, ~4% at Silver, ~7% at Gold — situational, capped at 15% total per fighter.
            </div>
            <div style={{ fontSize: 12.5, color: "var(--gold)" }}>Next: {detail.nextStep}</div>
          </div>
        </div>
      )}
    </div>
  );
}
