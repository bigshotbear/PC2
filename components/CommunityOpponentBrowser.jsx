import React, { useEffect, useState } from "react";
import FighterVisual from "./FighterVisual.jsx";
import { browseCommunityOpponents } from "../lib/communityBuildService";
import { detectArchetype } from "../lib/archetypeDetector";
import { POWER_SOURCES, FIGHTING_STYLES } from "../lib/fighterOptions";

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "mostBattles", label: "Most Battles" },
  { key: "random", label: "Random" }
];

export default function CommunityOpponentBrowser({ userId, requiredCount, onConfirm, onClose }) {
  const [builds, setBuilds] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [powerSource, setPowerSource] = useState("");
  const [fightingStyle, setFightingStyle] = useState("");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  const PAGE_SIZE = 12;

  const runSearch = async (append = false) => {
    setLoading(true);
    setError("");
    const nextOffset = append ? offset + PAGE_SIZE : 0;
    const result = await browseCommunityOpponents({
      userId,
      filters: { search: search.trim() || undefined, powerSource: powerSource || undefined, fightingStyle: fightingStyle || undefined },
      sort, offset: nextOffset, limit: PAGE_SIZE
    });
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    setBuilds((prev) => (append ? [...prev, ...result.builds] : result.builds));
    setTotal(result.total);
    setOffset(nextOffset);
    setHasMore(result.hasMore);
  };

  useEffect(() => { runSearch(false); }, [powerSource, fightingStyle, sort]);
  useEffect(() => { runSearch(false); }, []);

  const toggleSelect = (build) => {
    setError("");
    setSelected((prev) => {
      const already = prev.some((b) => b.id === build.id);
      if (already) return prev.filter((b) => b.id !== build.id);
      if (prev.length >= requiredCount) { setError(`You only need ${requiredCount} opponent(s) for this battle size.`); return prev; }
      return [...prev, build];
    });
  };

  const handleConfirm = () => {
    if (selected.length !== requiredCount) { setError(`Select exactly ${requiredCount} opponent(s).`); return; }
    onConfirm(selected);
  };

  return (
    <div className="pc-modal-overlay" onClick={onClose}>
      <div className="pc-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="card-title" style={{ margin: 0, color: "var(--cyan-bright)" }}>Browse Community Opponents</div>
          <button className="back-btn" onClick={onClose}>✕ Close</button>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>
          Selected {selected.length} / {requiredCount} — {total} opponents available
        </div>
        {error && <div className="error-box">{error}</div>}

        <input className="search-bar" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runSearch(false)} placeholder="Search fighter or creator name..." style={{ marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <select value={powerSource} onChange={(e) => setPowerSource(e.target.value)} style={{ flex: 1, minWidth: 110 }}>
            <option value="">All Power Sources</option>
            {POWER_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={fightingStyle} onChange={(e) => setFightingStyle(e.target.value)} style={{ flex: 1, minWidth: 110 }}>
            <option value="">All Fighting Styles</option>
            {FIGHTING_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {SORTS.map((s) => (
            <button key={s.key} className="chip" style={{ cursor: "pointer", background: sort === s.key ? "rgba(56,214,240,0.2)" : "transparent", borderColor: sort === s.key ? "var(--cyan)" : "var(--line)" }} onClick={() => setSort(s.key)}>
              {s.label}
            </button>
          ))}
          <button className="chip" style={{ cursor: "pointer" }} onClick={() => runSearch(false)}>🔄 Refresh</button>
        </div>

        {/* Fixed-height scrollable opponent list — never takes over the page */}
        <div style={{ maxHeight: 420, overflowY: "auto", border: "1px solid var(--line)", borderRadius: 10, padding: 8 }}>
          {loading && builds.length === 0 ? (
            <div className="spinner" style={{ margin: "20px auto" }} />
          ) : builds.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-dim)", textAlign: "center", padding: 20 }}>No opponents match these filters.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
              {builds.map((b) => {
                const isSelected = selected.some((s) => s.id === b.id);
                const archetype = b.fighter_snapshot ? detectArchetype({
                  strength: b.fighter_snapshot.strength, speed: b.fighter_snapshot.speed, durability: b.fighter_snapshot.durability,
                  battle_iq: b.fighter_snapshot.battle_iq, stamina: b.fighter_snapshot.stamina
                }) : "";
                return (
                  <button key={b.id} className={`card ${isSelected ? "pc-selected" : ""}`} style={{ margin: 0, padding: 10, textAlign: "left", cursor: "pointer" }} onClick={() => toggleSelect(b)}>
                    <div style={{ width: 44, height: 44, margin: "0 auto 6px" }}><FighterVisual fighter={b.fighter_snapshot} size={42} /></div>
                    <div style={{ fontSize: 12, fontWeight: 700, textAlign: "center", color: isSelected ? "var(--gold-bright)" : "var(--text-main)" }}>{b.fighter_name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)", textAlign: "center" }}>by {b.owner_display_name}</div>
                    <div style={{ fontSize: 10, color: "var(--cyan-bright)", textAlign: "center", marginTop: 2 }}>{archetype}</div>
                    <div style={{ fontSize: 9.5, color: "var(--text-dim)", textAlign: "center" }}>{b.power_source} · {b.fighting_style}</div>
                    {(b.times_fought || 0) > 0 && <div style={{ fontSize: 9, color: "var(--text-dim)", textAlign: "center", marginTop: 2 }}>{b.wins || 0}W-{b.losses || 0}L</div>}
                  </button>
                );
              })}
            </div>
          )}
          {hasMore && (
            <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => runSearch(true)} disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </button>
          )}
        </div>

        {selected.length > 0 && (
          <div className="card card-glow" style={{ marginTop: 12 }}>
            <div className="card-title">Selected Opponent{selected.length > 1 ? "s" : ""}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selected.map((b) => <span key={b.id} className="chip" style={{ borderColor: "var(--gold)", color: "var(--gold-bright)" }}>{b.fighter_name}</span>)}
            </div>
          </div>
        )}

        <button className="btn btn-primary" onClick={handleConfirm} disabled={selected.length !== requiredCount} style={{ marginTop: 12 }}>
          Confirm Matchup
        </button>
      </div>
    </div>
  );
}
