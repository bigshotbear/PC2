import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterPicker from "../components/FighterPicker.jsx";
import { generateComputerTeam } from "../lib/computerGenerator";
import { executeBattle } from "../lib/battleService";

const SIZES = [
  { key: "1v1", label: "1v1", count: 1 },
  { key: "2v2", label: "2v2", count: 2 },
  { key: "3v3", label: "3v3", count: 3 }
];

/**
 * mode: "computer" | "friend"
 * Fighter-first flow — a saved team is never required, only offered as
 * an optional quick-fill inside FighterPicker.
 */
export default function BattleFlow({ user, profile, mode, onNavigate }) {
  const [battleSize, setBattleSize] = useState(null);
  const [myFighterIds, setMyFighterIds] = useState([]);
  const [friends, setFriends] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendFighterIds, setFriendFighterIds] = useState([]);
  const [cpuTeam, setCpuTeam] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const requiredCount = SIZES.find((s) => s.key === battleSize)?.count || 1;

  const loadFriends = async () => {
    const { data: rels } = await supabase
      .from("friendships").select("*").eq("status", "accepted")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
    const ids = [...new Set((rels || []).map((r) => (r.user_id === user.id ? r.friend_id : r.user_id)))];
    if (ids.length === 0) { setFriends([]); return; }
    const { data: profs } = await supabase.from("profiles").select("*").in("id", ids);
    setFriends(profs || []);
  };

  const pickFriend = async (friend) => {
    setSelectedFriend(friend);
    setFriendFighterIds([]);
  };

  const fetchFightersByIds = async (ids) => {
    const { data } = await supabase.from("fighters").select("*").in("id", ids);
    return ids.map((id) => (data || []).find((f) => f.id === id)).filter(Boolean);
  };

  const handleStart = async () => {
    setError("");
    if (myFighterIds.length !== requiredCount) { setError(`Select exactly ${requiredCount} fighter(s).`); return; }

    setStarting(true);
    try {
      const myFighters = await fetchFightersByIds(myFighterIds);
      const myTeam = { fighter_snapshots: myFighters };
      let opponentTeam, opponentUserId = null, battleType;

      if (mode === "computer") {
        if (!cpuTeam) { setError("Generate an opponent first."); setStarting(false); return; }
        opponentTeam = cpuTeam;
        battleType = "VS_COMPUTER";
      } else {
        if (friendFighterIds.length !== requiredCount) { setError(`Select exactly ${requiredCount} of your friend's fighters.`); setStarting(false); return; }
        const friendFighters = await fetchFightersByIds(friendFighterIds);
        opponentTeam = { fighter_snapshots: friendFighters };
        opponentUserId = selectedFriend.id;
        battleType = "PVP_FRIEND";
      }

      const { result, iWon } = await executeBattle({
        user, profile, myTeam, opponentTeam, battleMode: battleSize, battleType, opponentUserId
      });
      onNavigate("pixelBattleAnimation", { battleResult: result, iWon });
    } catch (e) {
      setError("Battle failed to run: " + e.message);
      setStarting(false);
    }
  };

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("chooseMode")}>← Back</button>
      </div>

      <h2 style={{ marginBottom: 16, color: "var(--gold-bright)", textTransform: "uppercase" }}>
        {mode === "computer" ? "VS Computer" : "Fight a Friend"}
      </h2>

      {error && <div className="error-box">{error}</div>}

      {!battleSize ? (
        <div className="card">
          <div className="card-title">Choose Battle Size</div>
          {SIZES.map((s) => (
            <button key={s.key} className="btn" onClick={() => setBattleSize(s.key)}>{s.label}</button>
          ))}
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-title">Your Fighters ({battleSize})</div>
            <FighterPicker userId={user.id} battleSize={battleSize} selectedIds={myFighterIds} onChange={setMyFighterIds} />
          </div>

          {mode === "computer" && myFighterIds.length === requiredCount && (
            <div className="card">
              <div className="card-title">Opponent</div>
              <button className="btn btn-primary" onClick={() => setCpuTeam(generateComputerTeam(battleSize))}>
                Generate Opponent
              </button>
              {cpuTeam && cpuTeam.fighter_snapshots.map((f) => (
                <div key={f.id} className="fighter-card" style={{ marginTop: 8 }}>
                  <div className="fighter-thumb" />
                  <div className="fighter-card-body">
                    <div className="fighter-card-name">{f.fighter_name}</div>
                    <div className="fighter-card-meta">{f.power_source} · {f.fighting_style}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mode === "friend" && myFighterIds.length === requiredCount && (
            <div className="card">
              <div className="card-title">Choose a Friend</div>
              {friends === null ? (
                <button className="btn" onClick={loadFriends}>Load Friends</button>
              ) : friends.length === 0 ? (
                <div className="empty-state">
                  <div className="display">No friends yet</div>
                  <button className="btn" style={{ marginTop: 10 }} onClick={() => onNavigate("friends")}>Go to Friends</button>
                </div>
              ) : (
                friends.map((f) => (
                  <button key={f.id} className="btn" style={{ borderColor: selectedFriend?.id === f.id ? "var(--gold)" : "var(--line)" }} onClick={() => pickFriend(f)}>
                    {f.display_name}
                  </button>
                ))
              )}

              {selectedFriend && (
                <div style={{ marginTop: 10 }}>
                  <div className="card-title">{selectedFriend.display_name}'s Fighters</div>
                  <FighterPicker userId={selectedFriend.id} battleSize={battleSize} selectedIds={friendFighterIds} onChange={setFriendFighterIds} />
                </div>
              )}
            </div>
          )}

          <button className="btn btn-primary" onClick={handleStart} disabled={starting}>
            {starting ? "Running Battle..." : "Start Battle"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setBattleSize(null); setMyFighterIds([]); setCpuTeam(null); setSelectedFriend(null); setFriendFighterIds([]); }}>
            Change Battle Size
          </button>
        </>
      )}
    </div>
  );
}
