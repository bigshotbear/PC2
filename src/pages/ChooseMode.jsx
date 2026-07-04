import React from "react";

const MODES = [
  { key: "vsComputer", title: "VS Computer", sub: "Pick your fighters, fight a random AI roster" },
  { key: "vsCommunity", title: "VS Community", sub: "Fight a build made by a real Power Clash player" },
  { key: "fightFriend", title: "Fight a Friend", sub: "Battle a friend's fighters directly" },
  { key: "enterCode", title: "Enter Battle Code", sub: "Send or receive a Fighter/Roster Code" },
  { key: "story", title: "Story Mode", sub: "Pick a fighter and begin your campaign" }
];

export default function ChooseMode({ onNavigate }) {
  const handleSelect = (mode) => {
    if (mode.key === "vsComputer") return onNavigate("battleFlow", { mode: "computer", singlePlayerMode: "ai" });
    if (mode.key === "vsCommunity") return onNavigate("battleFlow", { mode: "computer", singlePlayerMode: "community" });
    if (mode.key === "fightFriend") return onNavigate("battleFlow", { mode: "friend" });
    if (mode.key === "enterCode") return onNavigate("battleCode");
    if (mode.key === "story") return onNavigate("storyModeSetup");
  };

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("dashboard")}>← Back</button>
      </div>

      <h2 style={{ marginBottom: 6, color: "var(--gold-bright)", textTransform: "uppercase" }}>Choose Mode</h2>
      <div style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 16 }}>
        Pick any saved fighter directly — a team is never required.
      </div>

      <div className="mode-grid">
        {MODES.map((mode) => (
          <button key={mode.key} className="card mode-card" onClick={() => handleSelect(mode)}>
            <div className="mode-icon">⚡</div>
            <div>
              <div className="mode-card-title">{mode.title}</div>
              <div className="mode-card-sub">{mode.sub}</div>
            </div>
          </button>
        ))}
      </div>

      <button className="btn" style={{ marginTop: 6 }} onClick={() => onNavigate("savedFighters")}>Saved Fighters</button>
      <button className="btn" onClick={() => onNavigate("savedTeams")}>Saved Teams (optional presets)</button>
      <button className="btn" onClick={() => onNavigate("battleHistory")}>Battle History</button>
    </div>
  );
}
