import React from "react";

const MODES = [
  { key: "vsComputer", title: "VS Computer", sub: "Pick your fighters, fight a random AI roster", icon: "🤖", accent: "cyan" },
  { key: "vsCommunity", title: "VS Community", sub: "Fight a build made by a real Power Clash player", icon: "🌐", accent: "cyan" },
  { key: "fightFriend", title: "Fight a Friend", sub: "Battle a friend's fighters directly", icon: "🤝", accent: "purple" },
  { key: "enterCode", title: "Enter Battle Code", sub: "Send or receive a Fighter/Roster Code", icon: "🔑", accent: "purple" },
  { key: "story", title: "Story Mode", sub: "Pick a fighter and begin your campaign", icon: "📖", accent: "gold" }
];

const GROUPS = [
  {
    label: "Create", accent: "gold",
    items: [
      { title: "Create Fighter", sub: "Build a new original fighter", icon: "✨", action: "fighterBuilder" },
      { title: "Saved Fighters", sub: "Manage your roster", icon: "🗂", action: "savedFighters" },
      { title: "Create Team", sub: "Optional preset for 2v2/3v3/5v5", icon: "👥", action: "teamBuilder" },
      { title: "Saved Teams", sub: "Optional presets only", icon: "📋", action: "savedTeams" }
    ]
  },
  {
    label: "Explore", accent: "purple",
    items: [
      { title: "Community Builds", sub: "Search, publish, recover fighters", icon: "🌍", action: "communityBuilds" },
      { title: "Badge Guide", sub: "Every badge and how to earn it", icon: "🏅", action: "badgeGuide" },
      { title: "Custom Power Judge", sub: "Test the fairness of new powers", icon: "⚖", action: "customPowerJudge" }
    ]
  },
  {
    label: "Social & Records", accent: "blue",
    items: [
      { title: "Friends", sub: "Search, requests, challenges", icon: "🤝", action: "friends" },
      { title: "Battle History", sub: "Every past fight", icon: "📜", action: "battleHistory" },
      { title: "Profile", sub: "Your record and player name", icon: "👤", action: "profile" }
    ]
  }
];

export default function ChooseMode({ onNavigate }) {
  const handleSelect = (mode) => {
    if (mode.key === "vsComputer") return onNavigate("battleFlow", { mode: "computer", singlePlayerMode: "ai" });
    if (mode.key === "vsCommunity") return onNavigate("battleFlow", { mode: "computer", singlePlayerMode: "community" });
    if (mode.key === "fightFriend") return onNavigate("battleFlow", { mode: "friend" });
    if (mode.key === "enterCode") return onNavigate("battleCode");
    if (mode.key === "story") return onNavigate("storyHome");
  };

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("dashboard")}>← Back</button>
      </div>

      <h2 style={{ marginBottom: 6, color: "var(--gold-bright)", textTransform: "uppercase" }}>⚔ Battle</h2>
      <div style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 16 }}>
        Pick any saved fighter directly — a team is never required.
      </div>

      <div className="mode-grid">
        {MODES.map((mode) => (
          <button key={mode.key} className={`card mode-card card-${mode.accent === "gold" ? "glow" : mode.accent}`} onClick={() => handleSelect(mode)}>
            <div className="mode-icon">{mode.icon}</div>
            <div>
              <div className="mode-card-title">{mode.title}</div>
              <div className="mode-card-sub">{mode.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {GROUPS.map((group) => (
        <div key={group.label} style={{ marginTop: 22 }}>
          <div className="card-title" style={{ fontSize: 12, color: `var(--${group.accent === "gold" ? "gold" : group.accent}${group.accent === "gold" ? "-bright" : "-bright"})` }}>
            {group.label.toUpperCase()}
          </div>
          <div className="mode-grid">
            {group.items.map((item) => (
              <button key={item.action} className={`card mode-card card-${group.accent}`} onClick={() => onNavigate(item.action)}>
                <div className="mode-icon">{item.icon}</div>
                <div>
                  <div className="mode-card-title">{item.title}</div>
                  <div className="mode-card-sub">{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
