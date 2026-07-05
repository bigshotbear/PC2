import React, { useState } from "react";

export default function FullScreenOptionPicker({ title, options, selectedKey, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const filtered = options.filter((o) => !q || o.title.toLowerCase().includes(q) || (o.tagline || "").toLowerCase().includes(q));

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg-void)", zIndex: 80, display: "flex", flexDirection: "column" }}>
      <div className="topbar" style={{ position: "static" }}>
        <div className="topbar-title">{title}</div>
        <button className="back-btn" onClick={onClose}>✕ Close</button>
      </div>
      <div style={{ padding: "0 16px" }}>
        <input className="search-bar" autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {filtered.length === 0 && <div style={{ color: "var(--text-dim)", textAlign: "center", marginTop: 30 }}>No matches.</div>}
        {filtered.map((o) => (
          <div
            key={o.key}
            className="card"
            onClick={() => onSelect(o.key)}
            style={{
              cursor: "pointer",
              border: `1px solid ${selectedKey === o.key ? "var(--gold)" : "var(--line)"}`,
              background: selectedKey === o.key ? "rgba(230,184,74,0.08)" : undefined
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: selectedKey === o.key ? "var(--gold-bright)" : "var(--text-main)", textTransform: "uppercase" }}>{o.title}</div>
              {selectedKey === o.key && <span style={{ color: "var(--gold-bright)" }}>✓</span>}
            </div>
            {o.tagline && <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{o.tagline}</div>}
            {o.best && <div style={{ fontSize: 12, color: "var(--win)", marginTop: 6 }}>Best for: {o.best}</div>}
            {o.watch && <div style={{ fontSize: 12, color: "var(--loss)", marginTop: 3 }}>Watch out for: {o.watch}</div>}
            {o.onDetails && (
              <button onClick={(e) => { e.stopPropagation(); o.onDetails(); }} style={{ marginTop: 8, fontSize: 11, border: "1px solid var(--line)", borderRadius: 6, padding: "4px 10px", color: "#5ca8ff", background: "none" }}>
                ⓘ Details
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
