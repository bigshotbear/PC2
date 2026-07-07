import React, { useState } from "react";
import FighterPicker from "../components/FighterPicker.jsx";

export default function StoryModeSetup({ user, onNavigate }) {
  const [selectedIds, setSelectedIds] = useState([]);

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("chooseMode")}>← Back</button>
      </div>

      <h2 style={{ marginBottom: 16, color: "var(--gold-bright)", textTransform: "uppercase" }}>Story Mode</h2>

      <div className="card">
        <div className="card-title">Choose Your Fighter</div>
        <FighterPicker userId={user.id} battleSize="1v1" selectedIds={selectedIds} onChange={setSelectedIds} />
      </div>

      {selectedIds.length === 1 && (
        <div className="empty-state">
          <div className="display">Chapters coming soon</div>
          <p>Your fighter is locked in — campaign chapters and encounters are the next Story Mode update.</p>
        </div>
      )}
    </div>
  );
}
