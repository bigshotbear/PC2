import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterPicker from "../components/FighterPicker.jsx";
import QuickChallengeCard from "../components/QuickChallengeCard.jsx";
import BadgeLoadoutSelector from "../components/BadgeLoadoutSelector.jsx";
import { generateComputerTeam } from "../lib/computerGenerator";
import { executeBattle, executeGauntletBattle } from "../lib/battleService";
import { getRandomCommunityBuilds, recordCommunityBuildResult } from "../lib/communityBuildService";
import { orderComputerLineup } from "../lib/gauntletStrategy";
import LineupOrderSelector from "../components/LineupOrderSelector.jsx";

const SIZES = [
  { key: "1v1", label: "1v1 — one fighter against one fighter", count: 1 },
  { key: "2v2", label: "2v2 — two fighters on each side", count: 2 },
  { key: "3v3", label: "3v3 — three fighters on each side", count: 3 },
  { key: "5v5", label: "5v5 — five fighters on each side", count: 5 }
];

/**
 * mode: "computer" | "friend"
 * Fighter-first flow — a saved team is never required, only offered as
 * an optional quick-fill inside FighterPicker.
 */
export default function BattleFlow({ user, profile, mode, preselectedFighterId, singlePlayerMode: initialSinglePlayerMode, onNavigate }) {
  const [singlePlayerMode, setSinglePlayerMode] = useState(initialSinglePlayerMode || null); // "ai" | "community"
  const [battleSize, setBattleSize] = useState(preselectedFighterId ? "1v1" : null);
  const [myFighterIds, setMyFighterIds] = useState(preselectedFighterId ? [preselectedFighterId] : []);
  const [friends, setFriends] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendFighterIds, setFriendFighterIds] = useState([]);
  const [cpuTeam, setCpuTeam] = useState(null);
  const [communityBuilds, setCommunityBuilds] = useState(null);
  const [communityError, setCommunityError] = useState("");
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [myFighters, setMyFighters] = useState(null);
  const [badgeSelections, setBadgeSelections] = useState({});
  const [showLoadout, setShowLoadout] = useState(false);
  const [battleFormat, setBattleFormat] = useState(null); // "team" | "gauntlet"
  const [lineupVisibility, setLineupVisibility] = useState("open");
  const [showLineupOrder, setShowLineupOrder] = useState(false);

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

  const loadCommunityOpponents = async (excludeIds = []) => {
    setCommunityError("");
    setLoadingCommunity(true);
    const result = await getRandomCommunityBuilds(requiredCount, excludeIds);
    setLoadingCommunity(false);
    if (!result.success) { setCommunityError(result.error); return; }
    setCommunityBuilds(result.builds);
  };

  const handleConfirmMatchup = async () => {
    setError("");
    if (myFighterIds.length !== requiredCount) { setError(`Select exactly ${requiredCount} fighter(s).`); return; }
    if (mode === "computer" && singlePlayerMode === "ai" && !cpuTeam) { setError("Generate an opponent first."); return; }
    if (mode === "computer" && singlePlayerMode === "community" && !communityBuilds) { setError("Load a Community opponent first."); return; }
    if (mode === "friend" && friendFighterIds.length !== requiredCount) { setError(`Select exactly ${requiredCount} of your friend's fighters.`); return; }

    const fetched = await fetchFightersByIds(myFighterIds);
    setMyFighters(fetched);
    setBadgeSelections({});
    if (battleFormat === "gauntlet") {
      setShowLineupOrder(true);
    } else {
      setShowLoadout(true);
    }
  };

  const handleStart = async () => {
    setError("");
    setStarting(true);
    try {
      const myFightersWithBadges = myFighters.map((f) => ({ ...f, active_badges: badgeSelections[f.id] || [] }));
      let opponentFightersRaw, opponentUserId = null, battleType;

      if (mode === "computer" && singlePlayerMode === "ai") {
        opponentFightersRaw = cpuTeam.fighter_snapshots;
        battleType = "VS_COMPUTER";
      } else if (mode === "computer" && singlePlayerMode === "community") {
        opponentFightersRaw = communityBuilds.map((b) => b.fighter_snapshot);
        battleType = "VS_COMPUTER";
      } else {
        opponentFightersRaw = await fetchFightersByIds(friendFighterIds);
        opponentUserId = selectedFriend.id;
        battleType = "PVP_FRIEND";
      }

      if (battleFormat === "gauntlet") {
        const opponentLineup = mode === "computer" ? orderComputerLineup(opponentFightersRaw) : opponentFightersRaw;
        const { result, iWon, totalRibbons } = await executeGauntletBattle({
          user, profile,
          myLineup: myFightersWithBadges, opponentLineup,
          battleMode: battleSize, battleType, opponentUserId,
          lineupVisibility
        });

        if (mode === "computer" && singlePlayerMode === "community" && communityBuilds) {
          communityBuilds.forEach((b) => recordCommunityBuildResult(b.id, !iWon));
        }

        onNavigate("pixelBattleAnimation", {
          battleResult: result, iWon, totalRibbons,
          rematchConfig: { format: "gauntlet", myLineup: myFightersWithBadges, opponentLineup, battleMode: battleSize, battleType, opponentUserId, lineupVisibility }
        });
        return;
      }

      const myTeam = { fighter_snapshots: myFightersWithBadges };
      const opponentTeam = { fighter_snapshots: opponentFightersRaw };

      const { result, iWon, totalRibbons } = await executeBattle({
        user, profile, myTeam, opponentTeam, battleMode: battleSize, battleType, opponentUserId
      });

      if (mode === "computer" && singlePlayerMode === "community" && communityBuilds) {
        communityBuilds.forEach((b) => recordCommunityBuildResult(b.id, !iWon));
      }

      onNavigate("pixelBattleAnimation", {
        battleResult: result, iWon, totalRibbons,
        rematchConfig: { format: "team", myTeam, opponentTeam, battleMode: battleSize, battleType, opponentUserId }
      });
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
        {mode === "computer"
          ? singlePlayerMode === "community" ? "VS Community" : singlePlayerMode === "ai" ? "VS Computer" : "Single Player"
          : "Fight a Friend"}
      </h2>

      {error && <div className="error-box">{error}</div>}

      {mode === "friend" && (
        <>
          <QuickChallengeCard user={user} profile={profile} onNavigate={onNavigate} />
          <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 12, margin: "10px 0" }}>— or challenge a friend directly —</div>
        </>
      )}

      {mode === "computer" && !singlePlayerMode ? (
        <div className="mode-grid">
          <button className="card mode-card" onClick={() => setSinglePlayerMode("ai")} style={{ border: "1px solid var(--line)" }}>
            <div className="mode-icon">🤖</div>
            <div>
              <div className="mode-card-title">Fight the Computer</div>
              <div className="mode-card-sub">Battle a randomly generated AI fighter.</div>
            </div>
          </button>
          <button className="card mode-card" onClick={() => setSinglePlayerMode("community")} style={{ border: "1px solid var(--line)" }}>
            <div className="mode-icon">🌐</div>
            <div>
              <div className="mode-card-title">Fight Community Builds</div>
              <div className="mode-card-sub">Battle a fighter created by another real Power Clash player.</div>
            </div>
          </button>
        </div>
      ) : !battleSize ? (
        <div className="card">
          <div className="card-title">Choose Battle Size</div>
          {SIZES.map((s) => (
            <button key={s.key} className="btn" onClick={() => setBattleSize(s.key)}>{s.label}</button>
          ))}
        </div>
      ) : battleSize !== "1v1" && !battleFormat ? (
        <div className="mode-grid">
          <button className="card mode-card" onClick={() => setBattleFormat("team")}>
            <div className="mode-icon">🛡</div>
            <div>
              <div className="mode-card-title">Team Battle</div>
              <div className="mode-card-sub">All selected fighters participate together.</div>
            </div>
          </button>
          <button className="card mode-card" onClick={() => setBattleFormat("gauntlet")}>
            <div className="mode-icon">⚔</div>
            <div>
              <div className="mode-card-title">Gauntlet Battle</div>
              <div className="mode-card-sub">One fighter per side at a time. Winners carry health forward.</div>
            </div>
          </button>
          {mode === "computer" && (
            <div className="card">
              <div className="card-title">Opponent Lineup Visibility</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" style={{ marginBottom: 0, borderColor: lineupVisibility === "open" ? "var(--gold)" : "var(--line)" }} onClick={() => setLineupVisibility("open")}>Open Lineup</button>
                <button className="btn" style={{ marginBottom: 0, borderColor: lineupVisibility === "blind" ? "var(--gold)" : "var(--line)" }} onClick={() => setLineupVisibility("blind")}>Blind Lineup</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-title">Your Fighters ({battleSize}{battleFormat === "gauntlet" ? " · Gauntlet" : ""})</div>
            <FighterPicker userId={user.id} battleSize={battleSize} selectedIds={myFighterIds} onChange={setMyFighterIds} />
          </div>

          {mode === "computer" && singlePlayerMode === "ai" && myFighterIds.length === requiredCount && (
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

          {mode === "computer" && singlePlayerMode === "community" && myFighterIds.length === requiredCount && (
            <div className="card">
              <div className="card-title">Community Opponent</div>
              {communityError && <div className="error-box">{communityError}</div>}
              <button className="btn btn-primary" onClick={() => loadCommunityOpponents([])} disabled={loadingCommunity}>
                {loadingCommunity ? "Loading..." : "Load Community Opponent"}
              </button>
              {communityBuilds && (
                <>
                  {communityBuilds.map((b) => (
                    <div key={b.id} className="fighter-card" style={{ marginTop: 8 }}>
                      <div className="fighter-thumb" />
                      <div className="fighter-card-body">
                        <div className="fighter-card-name">{b.fighter_name}</div>
                        <div className="fighter-card-meta">by {b.owner_display_name} · {b.power_source} · {b.fighting_style}</div>
                      </div>
                    </div>
                  ))}
                  <button className="btn" onClick={() => loadCommunityOpponents(communityBuilds.map((b) => b.id))} disabled={loadingCommunity}>
                    Find Another Opponent
                  </button>
                </>
              )}
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
                  <p>Friend search is currently unavailable. You can still battle instantly using a Fight Code above.</p>
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

          {showLineupOrder && myFighters ? (
            <>
              <LineupOrderSelector fighters={myFighters} onChange={setMyFighters} />
              <button className="btn btn-primary" onClick={() => { setShowLineupOrder(false); setShowLoadout(true); }}>
                Continue to Active Badges
              </button>
            </>
          ) : showLoadout && myFighters ? (
            <BadgeLoadoutSelector
              fighters={myFighters}
              value={badgeSelections}
              onChange={(fighterId, names) => setBadgeSelections((prev) => ({ ...prev, [fighterId]: names }))}
              onContinue={handleStart}
            />
          ) : (
            <button className="btn btn-primary" onClick={handleConfirmMatchup} disabled={starting}>
              {starting ? "Running Battle..." : "Confirm Matchup"}
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => { setBattleSize(null); setBattleFormat(null); setMyFighterIds([]); setCpuTeam(null); setSelectedFriend(null); setFriendFighterIds([]); setCommunityBuilds(null); setCommunityError(""); setShowLoadout(false); setShowLineupOrder(false); setMyFighters(null); }}>
            Change Battle Size
          </button>
          {mode === "computer" && (
            <button className="btn btn-ghost" onClick={() => { setSinglePlayerMode(null); setBattleSize(null); setBattleFormat(null); setMyFighterIds([]); setCpuTeam(null); setCommunityBuilds(null); setShowLoadout(false); setShowLineupOrder(false); setMyFighters(null); }}>
              Change Mode
            </button>
          )}
        </>
      )}
    </div>
  );
}
