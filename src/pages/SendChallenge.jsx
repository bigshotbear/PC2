import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterPicker from "../components/FighterPicker.jsx";

const SIZES = [{ key: "1v1", count: 1 }, { key: "2v2", count: 2 }, { key: "3v3", count: 3 }];

export default function SendChallenge({ user, friendId, friendName, onNavigate }) {
  const [battleSize, setBattleSize] = useState("1v1");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const requiredCount = SIZES.find((s) => s.key === battleSize).count;

  const handleSend = async () => {
    setError("");
    if (selectedIds.length !== requiredCount) { setError(`Select exactly ${requiredCount} fighter(s).`); return; }

    setSending(true);
    const { data: fighters } = await supabase.from("fighters").select("*").in("id", selectedIds);
    const ordered = selectedIds.map((id) => (fighters || []).find((f) => f.id === id)).filter(Boolean);

    const { error: insertError } = await supabase.from("battle_challenges").insert({
      sender_id: user.id,
      receiver_id: friendId,
      battle_size: battleSize,
      sender_fighter_snapshots: ordered,
      status: "pending"
    });

    setSending(false);
    if (insertError) { setError("Could not send challenge: " + insertError.message); return; }
    setSent(true);
    setTimeout(() => onNavigate("friends"), 1000);
  };

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("friends")}>← Back</button>
      </div>

      <h2 style={{ marginBottom: 16, color: "var(--gold-bright)", textTransform: "uppercase" }}>
        Challenge {friendName || "Friend"}
      </h2>

      {error && <div className="error-box">{error}</div>}
      {sent && <div className="success-box">Challenge sent!</div>}

      <div className="card">
        <div className="card-title">Battle Size</div>
        <select value={battleSize} onChange={(e) => { setBattleSize(e.target.value); setSelectedIds([]); }}>
          <option value="1v1">1v1</option>
          <option value="2v2">2v2</option>
          <option value="3v3">3v3</option>
        </select>
      </div>

      <div className="card">
        <div className="card-title">Your Fighters</div>
        <FighterPicker userId={user.id} battleSize={battleSize} selectedIds={selectedIds} onChange={setSelectedIds} />
      </div>

      <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
        {sending ? "Sending..." : "Send Challenge"}
      </button>
    </div>
  );
}
