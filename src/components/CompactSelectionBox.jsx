import React from "react";

export default function CompactSelectionBox({ label, value, tagline, onOpen }) {
  return (
    <button className="card" style={{ width: "100%", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={onOpen}>
      <div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gold-bright)" }}>{value}</div>
        {tagline && <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{tagline}</div>}
      </div>
      <div style={{ color: "var(--gold)", fontSize: 18 }}>›</div>
    </button>
  );
}
