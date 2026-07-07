import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { saveDisplayName } from "../lib/displayNameService";
import AvatarCircle from "../components/AvatarCircle.jsx";

function mostCommon(list) {
  if (!list.length) return "—";
  const counts = {};
  list.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export default function Profile({ user, profile, onNavigate, onLogout }) {
  const [fighterCount, setFighterCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [favoriteSource, setFavoriteSource] = useState("—");
  const [favoriteStyle, setFavoriteStyle] = useState("—");
  const [recentBattles, setRecentBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const [securing, setSecuring] = useState(false);
  const [secureEmail, setSecureEmail] = useState("");
  const [securePassword, setSecurePassword] = useState("");
  const [secureError, setSecureError] = useState("");
  const [secureSuccess, setSecureSuccess] = useState(false);

  const handleCopyName = async () => {
    try { await navigator.clipboard.writeText(profile.display_name); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt("Copy your player name:", profile.display_name); }
  };

  const handleSaveName = async () => {
    setNameError("");
    const result = await saveDisplayName(user.id, newName);
    if (!result.success) { setNameError(result.error); return; }
    setEditingName(false);
    window.location.reload();
  };

  const handleSecureAccount = async () => {
    setSecureError("");
    if (!secureEmail.trim() || securePassword.length < 6) {
      setSecureError("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setSecuring(true);
    const { error } = await supabase.auth.updateUser({ email: secureEmail.trim(), password: securePassword });
    setSecuring(false);
    if (error) { setSecureError(error.message); return; }
    await supabase.from("profiles").update({ is_guest: false, email: secureEmail.trim(), updated_at: new Date().toISOString() }).eq("id", user.id);
    setSecureSuccess(true);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);

      const [{ data: fighters }, { count: teamTotal }, { data: battles }] = await Promise.all([
        supabase.from("fighters").select("power_source, fighting_style").eq("owner_id", user.id),
        supabase.from("teams").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase
          .from("battle_history")
          .select("*")
          .contains("participant_ids", [user.id])
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      setFighterCount(fighters?.length || 0);
      setTeamCount(teamTotal || 0);
      setFavoriteSource(mostCommon((fighters || []).map((f) => f.power_source)));
      setFavoriteStyle(mostCommon((fighters || []).map((f) => f.fighting_style)));
      setRecentBattles(battles || []);
      setLoading(false);
    })();
  }, [user.id]);

  const winRatePct = profile ? Math.round((profile.win_rate || 0) * 100) : 0;

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("dashboard")}>← Back</button>
      </div>

      <div className="hero-header" style={{ padding: "20px 16px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <AvatarCircle name={profile?.display_name} size={72} />
        </div>
        <div className="hero-name" style={{ fontSize: 24 }}>{profile?.display_name}</div>
        <div className="hero-handle">{profile?.email}</div>
        {profile?.is_guest && <span className="chip" style={{ marginTop: 8, position: "relative" }}>Guest Account</span>}
      </div>

      <div className="card">
        <div className="card-title">Your Player Name</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gold-bright)", marginBottom: 10 }}>@{profile?.display_name}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" style={{ marginBottom: 0 }} onClick={handleCopyName}>{copied ? "Player name copied" : "Copy Player Name"}</button>
          <button className="btn" style={{ marginBottom: 0 }} onClick={() => { setEditingName(true); setNewName(profile.display_name); }}>Edit Display Name</button>
        </div>
        {editingName && (
          <div style={{ marginTop: 10 }}>
            {nameError && <div className="error-box">{nameError}</div>}
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={20} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" style={{ marginBottom: 0 }} onClick={handleSaveName}>Save</button>
              <button className="btn btn-ghost" style={{ marginBottom: 0 }} onClick={() => setEditingName(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {profile?.is_guest && (
        <div className="card card-glow">
          <div className="card-title">Secure My Account</div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 10 }}>
            Add an email and password to keep this exact account — same fighters, friends, teams, and history — recoverable from any device.
          </div>
          {secureSuccess ? (
            <div className="success-box">Account secured! You can now log in with your email anywhere.</div>
          ) : (
            <>
              {secureError && <div className="error-box">{secureError}</div>}
              <div className="field"><label>Email</label><input type="email" value={secureEmail} onChange={(e) => setSecureEmail(e.target.value)} /></div>
              <div className="field"><label>Password</label><input type="password" value={securePassword} onChange={(e) => setSecurePassword(e.target.value)} /></div>
              <button className="btn btn-primary" onClick={handleSecureAccount} disabled={securing}>{securing ? "Securing..." : "Secure My Account"}</button>
            </>
          )}
        </div>
      )}

      <div className="card card-glow" style={{ textAlign: "center" }}>
        <div className="card-title">Victory Ribbons</div>
        <div className="card-value gold" style={{ fontSize: 32 }}>{profile?.total_ribbons ?? 0}</div>
      </div>

      <div className="stat-grid">
        <div className="card"><div className="card-title">Wins</div><div className="card-value win">{profile?.total_wins ?? 0}</div></div>
        <div className="card"><div className="card-title">Losses</div><div className="card-value loss">{profile?.total_losses ?? 0}</div></div>
        <div className="card"><div className="card-title">Win Rate</div><div className="card-value gold">{winRatePct}%</div></div>
        <div className="card"><div className="card-title">Current Streak</div><div className="card-value">{profile?.current_win_streak ?? 0}</div></div>
        <div className="card"><div className="card-title">Longest Streak</div><div className="card-value">{profile?.longest_win_streak ?? 0}</div></div>
        <div className="card"><div className="card-title">Total Battles</div><div className="card-value">{profile?.total_battles ?? 0}</div></div>
      </div>

      {!loading && (
        <>
          <div className="card">
            <div className="card-title">Favorites</div>
            <div style={{ fontSize: 14 }}>Power Source: <strong style={{ color: "var(--gold-bright)" }}>{favoriteSource}</strong></div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Fighting Style: <strong style={{ color: "var(--gold-bright)" }}>{favoriteStyle}</strong></div>
          </div>

          <div className="card">
            <div className="card-title">Collection</div>
            <div style={{ fontSize: 14 }}>{fighterCount} saved fighters</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>{teamCount} saved teams</div>
          </div>

          <div className="card">
            <div className="card-title">Recent Battles</div>
            {recentBattles.length === 0 ? (
              <div style={{ color: "var(--text-dim)", fontSize: 14 }}>No battles yet.</div>
            ) : (
              recentBattles.map((b) => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span>{b.arena_name}</span>
                  <span style={{ color: b.winner_id === user.id ? "var(--win)" : "var(--loss)" }}>
                    {b.winner_id === user.id ? "WIN" : "LOSS"}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <button className="btn btn-danger" onClick={onLogout}>Log Out</button>
    </div>
  );
}
