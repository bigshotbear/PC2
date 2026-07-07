import React, { useState } from "react";
import { INSPIRATION_CATEGORIES, INSPIRATION_PRESETS } from "../lib/inspirationPresets";

export default function InspirationPickerModal({ onApply, onClose }) {
  const [category, setCategory] = useState(INSPIRATION_CATEGORIES[0]);
  const [preview, setPreview] = useState(null);

  const presets = INSPIRATION_PRESETS.filter((p) => p.category === category);

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg-void)", zIndex: 80, display: "flex", flexDirection: "column" }}>
      <div className="topbar" style={{ position: "static" }}>
        <div className="topbar-title">Inspiration Archetypes</div>
        <button className="back-btn" onClick={onClose}>✕ Close</button>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "10px 16px" }}>
        {INSPIRATION_CATEGORIES.map((c) => (
          <button key={c} className="chip" style={{ cursor: "pointer", background: category === c ? "rgba(230,184,74,0.2)" : "transparent" }} onClick={() => { setCategory(c); setPreview(null); }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {!preview ? (
          presets.map((p) => (
            <button key={p.key} className="card" style={{ width: "100%", textAlign: "left", cursor: "pointer" }} onClick={() => setPreview(p)}>
              <div style={{ fontWeight: 700, color: "var(--gold-bright)" }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Playstyle reference: {p.reference} · {p.difficulty}</div>
              <div style={{ fontSize: 12.5, marginTop: 4 }}>{p.playstyle}</div>
            </button>
          ))
        ) : (
          <div className="card card-glow">
            <div className="card-title">{preview.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>Playstyle reference: {preview.reference} · {preview.difficulty}</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>{preview.playstyle}</p>
            <div style={{ fontSize: 12.5, color: "var(--loss)", marginBottom: 10 }}>Watch out for: {preview.concern}</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.8, marginBottom: 12 }}>
              <div>Character Type: <strong>{preview.build.character_type}</strong></div>
              <div>Fighting Style: <strong>{preview.build.fighting_style}</strong></div>
              <div>Power Source: <strong>{preview.build.power_source}</strong></div>
              <div>Main Power: <strong>{preview.build.main_power}</strong></div>
              <div>Secondary Power: <strong>{preview.build.secondary_power}</strong></div>
              <div>Ultimate: <strong>{preview.build.ultimate_move}</strong></div>
              <div>Weakness: <strong>{preview.build.weakness}</strong></div>
            </div>
            <button className="btn btn-primary" onClick={() => onApply(preview)}>Use This Build</button>
            <button className="btn btn-ghost" onClick={() => setPreview(null)}>Back to List</button>
          </div>
        )}
      </div>
    </div>
  );
}
