import React from "react";

export default function ChoiceCard({ title, tagline, best, watch, selected, onSelect, onDetails }) {
  return (
    <div
      className="card"
      onClick={onSelect}
      style={{
        cursor: "pointer", marginBottom: 10,
        border: `1px solid ${selected ? "var(--gold)" : "var(--line)"}`,
        background: selected ? "rgba(230,184,74,0.08)" : undefined,
        boxShadow: selected ? "0 0 0 1px rgba(230,184,74,0.25), 0 0 20px rgba(230,184,74,0.12)" : "none"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: selected ? "var(--gold-bright)" : "var(--text-main)", textTransform: "uppercase" }}>
          {title}
        </div>
        {selected && <span style={{ color: "var(--gold-bright)" }}>✓</span>}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{tagline}</div>
      {best && <div style={{ fontSize: 12, color: "var(--win)", marginTop: 6 }}>Best for: {best}</div>}
      {watch && <div style={{ fontSize: 12, color: "var(--loss)", marginTop: 3 }}>Watch out for: {watch}</div>}
      {onDetails && (
        <button
          onClick={(e) => { e.stopPropagation(); onDetails(); }}
          style={{ marginTop: 8, fontSize: 11, border: "1px solid var(--line)", borderRadius: 6, padding: "4px 10px", color: "#5ca8ff", background: "none" }}
        >
          ⓘ Details
        </button>
      )}
    </div>
  );
}
