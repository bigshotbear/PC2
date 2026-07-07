import React from "react";

export default function PowerBudgetMeter({ cost, cap }) {
  const over = cost > cap;
  const pct = Math.min(100, (cost / cap) * 100);
  return (
    <div className="card" style={{ position: "sticky", top: 0, zIndex: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-dim)", marginBottom: 6 }}>
        <span>Power Budget</span>
        <span style={{ color: over ? "var(--loss)" : "var(--gold-bright)" }}>{cost} / {cap} points used</span>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: "#262b38", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: over ? "var(--loss)" : "linear-gradient(90deg, var(--gold-dim), var(--gold-bright))", transition: "width .2s ease" }} />
      </div>
      {over && <div style={{ fontSize: 11, color: "var(--loss)", marginTop: 4 }}>Over budget by {cost - cap} — lower a level to continue.</div>}
    </div>
  );
}
