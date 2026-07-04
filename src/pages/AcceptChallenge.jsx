import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterPicker from "../components/FighterPicker.jsx";
import { executeBattle } from "../lib/battleService";

export default function AcceptChallenge({ user, profile, challengeId, onNavigate }) {
  const [challenge, setChallenge] = useState(null);
  const [senderName, setSenderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error: loadError } = await supabase.from("battle_challenges").select("*").eq("id", challengeId).single();
      if (loadError || !data) { setError("Could not load this challenge."); setLoading(false); return; }
      setChallenge(data);
      const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", data.sender_id).maybeSingle();
      setSenderName(prof?.display_name || "Your friend");
      setLoading(false);
    })();
  }, [challengeId]);

  const requiredCount = challenge ? { "1v1": 1, "2v2": 2, "3v3": 3, "5v5": 5 }[challenge.battle_size] : 1;

  const handleFight = async () => {
    setError("");
    if (selectedIds.length !== requiredCount) { setError(`Select exactly ${requiredCount} fighter(s).`); return; }

    setStarting(true);
    try {
      const { data: fighters } = await supabase.from("fighters").select("*").in("id", selectedIds);
      const myFighters = selectedIds.map((id) => (fighters || []).find((f) => f.id === id)).filter(Boolean);

      const { result, iWon, savedHistoryId } = await executeBattle({
        user, profile,
        myTeam: { fighter_snapshots: myFighters },
        opponentTeam: { fighter_snapshots: challenge.sender_fighter_snapshots },
        battleMode: challenge.battle_size,
        battleType: "PVP_FRIEND",
        opponentUserId: challenge.sender_id
      });

      await supabase.from("battle_challenges").update({
        status: "completed",
        receiver_fighter_snapshots: myFighters,
        battle_result_id: savedHistoryId,
        completed_at: new Date().toISOString()
      }).eq("id", challengeId);

      onNavigate("pixelBattleAnimation", { battleResult: result, iWon });
    } catch (e) {
      setError("Battle failed to run: " + e.message);
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;
  }

  if (error && !challenge) {
    return (
      <div className="page">
        <div className="error-box">{error}</div>
        <button className="btn" onClick={() => onNavigate("friends")}>Back to Friends</button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("friends")}>← Back</button>
      </div>

      <h2 style={{ marginBottom: 16, color: "var(--gold-bright)", textTransform: "uppercase" }}>
        {senderName}'s Challenge — {challenge.battle_size}
      </h2>

      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <div className="card-title">Opponent Roster</div>
        {challenge.sender_fighter_snapshots.map((f, i) => (
          <div key={i} className="fighter-card" style={{ marginBottom: 6 }}>
            <div className="fighter-thumb" />
            <div className="fighter-card-body">
              <div className="fighter-card-name">{f.fighter_name}</div>
              <div className="fighter-card-meta">{f.power_source} · {f.fighting_style}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Select Your Fighters</div>
        <FighterPicker userId={user.id} battleSize={challenge.battle_size} selectedIds={selectedIds} onChange={setSelectedIds} />
      </div>

      <button className="btn btn-primary" onClick={handleFight} disabled={starting}>
        {starting ? "Running Battle..." : "Accept & Fight"}
      </button>
    </div>
  );
}
