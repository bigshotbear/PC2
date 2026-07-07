import React from "react";

export default function BadgeProgress({ title = "Badge Opportunities", items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ fontSize: 12, color: "var(--gold)", background: "rgba(230,184,74,0.06)", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px", marginTop: -6, marginBottom: 12 }}>
      <div style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: "0.06em", marginBottom: 4, color: "var(--text-dim)" }}>{title}</div>
      {items.map((i) => <div key={i}>• {i}</div>)}
    </div>
  );
}
