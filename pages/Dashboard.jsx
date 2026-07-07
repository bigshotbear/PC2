import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterVisual from "../components/FighterVisual.jsx";

function StatCard({ label, value, tone }) {
  return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div className={`card-value ${tone || ""}`}>{value}</div>
    </div>
  );
}

function QuickAction({ label, icon, onClick, tone }) {
  return (
    <button className={`btn ${tone ? "btn-" + tone : ""}`} style={{ marginBottom: 0 }} onClick={onClick}>
      {icon} {label}
    </button>
  );
}

export default function Dashboard({ user, profile, onNavigate, onLogout }) {
  const [favoriteFighter, setFavoriteFighter] = useState(null);
  const [storyProgress, setStoryProgress] = useState(null);
  const [recentBattles, setRecentBattles] = useState([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  const winRatePct = profile ? Math.round((profile.win_rate || 0)) : 0;

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoadingExtras(true);
      const { data: fighters } = await supabase
        .from("fighters").select("*").eq("owner_id", user.id)
        .order("updated_at", { ascending: false }).limit(1);
      setFavoriteFighter(fighters?.[0] || null);

      const { data: story } = await supabase
        .from("story_fighter_progress").select("*").eq("user_id", user.id)
        .order("updated_at", { ascending: false }).limit(1);
      setStoryProgress(story?.[0] || null);

      const { data: battles } = await supabase
        .from("battle_history").select("*")
        .contains("participant_ids", [user.id])
        .order("created_at", { ascending: false }).limit(5);
      setRecentBattles(battles || []);

      setLoadingExtras(false);
    })();
  }, [user?.id]);

  const equippedCount = storyProgress
    ? [storyProgress.equipped_ability_1, storyProgress.equipped_ability_2, storyProgress.equipped_ability_3, storyProgress.equipped_ability_4, storyProgress.equipped_ability_5, storyProgress.equipped_ability_6, storyProgress.equipped_ability_7].filter(Boolean).length
    : 0;

  return (
    <div className="page">
      <div className="hero-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div>
            <div className="hero-name">{profile ? profile.display_name : "Loading..."}</div>
            {profile?.display_name && <div className="hero-handle">@{profile.display_name}</div>}
          </div>
          {favoriteFighter && (
            <div style={{ width: 64, height: 64, position: "relative" }}>
              <FighterVisual fighter={favoriteFighter} size={64} animated />
            </div>
          )}
        </div>

        <div className="hero-meta-row">
          <div className="hero-meta-chip">🔥 Streak: <strong style={{ color: "var(--gold-bright)" }}>{profile?.current_win_streak ?? 0}</strong></div>
          {favoriteFighter && <div className="hero-meta-chip">Active Fighter: <strong style={{ color: "var(--cyan-bright)" }}>{favoriteFighter.fighter_name}</strong></div>}
          {recentBattles[0] && (
            <div className="hero-meta-chip">
              Last Result: <strong style={{ color: recentBattles[0].winner_id === user?.id ? "var(--win)" : "var(--loss)" }}>
                {recentBattles[0].winner_id === user?.id ? "WIN" : "LOSS"}
              </strong>
            </div>
          )}
        </div>

        {storyProgress?.run_status === "active" && (
          <button
            className="btn btn-primary pc-pulse"
            style={{ marginTop: 16, marginBottom: 0, position: "relative" }}
            onClick={() => onNavigate("storyHome")}
          >
            ⚡ Continue Story — Level {storyProgress.current_level}
          </button>
        )}
      </div>

      <div className="card-title" style={{ marginTop: 6, marginBottom: 8, fontSize: 12 }}>Normal Battle Record</div>
      <div className="stat-grid" style={{ marginBottom: 14 }}>
        <StatCard label="Wins" value={profile?.total_wins ?? 0} tone="win" />
        <StatCard label="Losses" value={profile?.total_losses ?? 0} tone="loss" />
        <StatCard label="Win Rate" value={`${winRatePct}%`} tone="gold" />
        <StatCard label="Current Streak" value={profile?.current_win_streak ?? 0} tone="gold" />
      </div>
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <StatCard label="Total Battles" value={profile?.total_battles ?? 0} />
        <StatCard label="Victory Ribbons" value={profile?.total_ribbons ?? 0} tone="gold" />
      </div>

      {storyProgress && (
        <>
          <div className="card-title" style={{ marginBottom: 8, fontSize: 12 }}>Story Record</div>
          <div className="card card-purple">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span>Current Level</span><strong style={{ color: "var(--purple-bright)" }}>{storyProgress.current_level}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span>Highest Level Reached</span><strong style={{ color: "var(--gold-bright)" }}>{storyProgress.highest_level}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span>Equipped Abilities</span><strong>{equippedCount} / 7</strong>
            </div>
            <button className="btn btn-purple" style={{ marginTop: 6, marginBottom: 0 }} onClick={() => onNavigate("storyHome")}>
              {storyProgress.run_status === "active" ? "Continue Run" : "Open Story Mode"}
            </button>
          </div>
        </>
      )}

      <div className="card-title" style={{ marginTop: 20, marginBottom: 8, fontSize: 12 }}>Quick Actions</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <QuickAction label="Create Fighter" icon="✨" onClick={() => onNavigate("fighterBuilder")} tone="primary" />
        <QuickAction label="Fight Computer" icon="🤖" onClick={() => onNavigate("chooseMode")} tone="cyan" />
        <QuickAction label="Battle Code" icon="🔑" onClick={() => onNavigate("battleCode")} tone="cyan" />
        <QuickAction label="Challenge Friend" icon="🤝" onClick={() => onNavigate("friends")} tone="purple" />
      </div>

      <div className="card-title" style={{ marginBottom: 8, fontSize: 12 }}>Recent Battles</div>
      {loadingExtras ? (
        <div className="card"><div style={{ fontSize: 13, color: "var(--text-dim)" }}>Loading...</div></div>
      ) : recentBattles.length === 0 ? (
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>No battles yet. Create a fighter and enter your first clash.</div>
        </div>
      ) : (
        recentBattles.map((b) => {
          const won = b.winner_id === user?.id;
          return (
            <div key={b.id} className={`card ${won ? "card-success" : "card-danger"}`} style={{ padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: won ? "var(--win)" : "var(--loss)" }}>{won ? "VICTORY" : "DEFEAT"}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{b.battle_type} · {b.battle_mode} · {new Date(b.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>vs {won ? b.loser_name : b.winner_name}</div>
              </div>
            </div>
          );
        })
      )}

      <div className="card-title" style={{ marginTop: 20, marginBottom: 8, fontSize: 12 }}>More</div>
      <button className="btn" onClick={() => onNavigate("chooseMode")}>⚔ Choose Mode</button>
      <button className="btn" onClick={() => onNavigate("savedFighters")}>Saved Fighters</button>
      <button className="btn" onClick={() => onNavigate("teamBuilder")}>+ Create Team</button>
      <button className="btn" onClick={() => onNavigate("savedTeams")}>Saved Teams</button>
      <button className="btn" onClick={() => onNavigate("communityBuilds")}>Community Builds</button>
      <button className="btn" onClick={() => onNavigate("customPowerJudge")}>Custom Power Judge</button>
      <button className="btn" onClick={() => onNavigate("badgeGuide")}>Badge Guide</button>
      <button className="btn" onClick={() => onNavigate("battleHistory")}>Battle History</button>
      <button className="btn" onClick={() => onNavigate("profile")}>Profile</button>

      <button className="btn btn-danger" onClick={onLogout} style={{ marginTop: 10 }}>
        Log Out
      </button>
    </div>
  );
}
