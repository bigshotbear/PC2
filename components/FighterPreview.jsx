import React, { useState } from "react";
import FighterVisual from "./FighterVisual.jsx";

export default function FighterPreview({ fighter }) {
  const [facing, setFacing] = useState("right");
  const [showAura, setShowAura] = useState(true);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card card-glow" style={{ textAlign: "center" }}>
      <div
        className="preview-stack"
        style={{ height: expanded ? 280 : 190, cursor: "pointer", transition: "height .2s ease" }}
        onClick={() => setExpanded((e) => !e)}
      >
        <FighterVisual fighter={fighter} size={expanded ? 240 : 160} facing={facing} animated showAura={showAura} />
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", margin: "8px 0" }}>
        <span className="chip">{fighter.character_type}</span>
        <span className="chip">{fighter.power_source}</span>
        <span className="chip">{fighter.fighting_style}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <button className="btn btn-ghost" style={{ marginBottom: 0, width: "auto", padding: "8px 12px" }} onClick={(e) => { e.stopPropagation(); setFacing((f) => (f === "right" ? "left" : "right")); }}>↔ Flip</button>
        <button className="btn btn-ghost" style={{ marginBottom: 0, width: "auto", padding: "8px 12px" }} onClick={(e) => { e.stopPropagation(); setShowAura((a) => !a); }}>{showAura ? "Hide Aura" : "Show Aura"}</button>
        <button className="btn btn-ghost" style={{ marginBottom: 0, width: "auto", padding: "8px 12px" }} onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x); }}>{expanded ? "Shrink" : "Expand"}</button>
      </div>
    </div>
  );
}
