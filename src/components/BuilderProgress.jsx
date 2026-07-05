import React from "react";

const STEPS = ["Identity", "Powers", "Stats", "Appearance", "Finish"];

export default function BuilderProgress({ currentStep, onJump }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 4 }}>
      {STEPS.map((label, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <button
            key={label}
            onClick={() => isDone && onJump(i)}
            style={{
              flex: 1, background: "none", border: "none", padding: 0, cursor: isDone ? "pointer" : "default",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              background: isActive ? "var(--gold-bright)" : isDone ? "rgba(230,184,74,0.3)" : "var(--bg-panel)",
              color: isActive ? "#0a0c12" : isDone ? "var(--gold-bright)" : "var(--text-dim)",
              border: `1px solid ${isActive || isDone ? "var(--gold)" : "var(--line)"}`
            }}>
              {isDone ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: 9.5, color: isActive ? "var(--gold-bright)" : "var(--text-dim)", textTransform: "uppercase", textAlign: "center" }}>
              {label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
