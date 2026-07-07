import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import QuickChallengeCard from "../components/QuickChallengeCard.jsx";
import AvatarCircle from "../components/AvatarCircle.jsx";

export default function Friends({ user, profile, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friendships, setFriendships] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [challenges, setChallenges] = useState([]);
  const [viewingProfile, setViewingProfile] = useState(null);

  const loadFriendships = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("friendships")
      .select("*")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (loadError) {
      setError("Could not load friends: " + loadError.message);
      setLoading(false);
      return;
    }

    setFriendships(data || []);

    const otherIds = [...new Set((data || []).map((f) => (f.user_id === user.id ? f.friend_id : f.user_id)))];
    if (otherIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("*").in("id", otherIds);
      const map = {};
      (profs || []).forEach((p) => { map[p.id] = p; });
      setProfilesById(map);
    }
    setLoading(false);
  }, [user.id]);

  const loadChallenges = useCallback(async () => {
    const { data } = await supabase
      .from("battle_challenges")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    setChallenges(data || []);
  }, [user.id]);

  useEffect(() => {
    loadFriendships();
    loadChallenges();
  }, [loadFriendships, loadChallenges]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!searchTerm.trim()) return;

    setSearching(true);
    const { data, error: searchError } = await supabase.rpc("search_profiles", { search_term: searchTerm.trim() });
    setSearching(false);

    if (searchError) {
      setError("Search failed: " + searchError.message);
      return;
    }
    setSearchResults(data || []);
  };

  const sendRequest = async (targetId) => {
    setError("");
    setInfo("");
    const { error: insertError } = await supabase
      .from("friendships")
      .insert({ user_id: user.id, friend_id: targetId, status: "pending" });

    if (insertError) {
      setError("Could not send request: " + insertError.message);
      return;
    }
    setInfo("Friend request sent.");
    loadFriendships();
  };

  const respond = async (friendshipId, status) => {
    const { error: updateError } = await supabase
      .from("friendships")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", friendshipId);

    if (updateError) {
      setError("Could not update request: " + updateError.message);
      return;
    }
    loadFriendships();
  };

  const removeFriendship = async (friendshipId) => {
    const { error: deleteError } = await supabase.from("friendships").delete().eq("id", friendshipId);
    if (deleteError) {
      setError("Could not remove: " + deleteError.message);
      return;
    }
    loadFriendships();
  };

  const declineChallenge = async (id) => {
    await supabase.from("battle_challenges").update({ status: "declined" }).eq("id", id);
    loadChallenges();
  };

  const incoming = friendships.filter((f) => f.friend_id === user.id && f.status === "pending");
  const outgoing = friendships.filter((f) => f.user_id === user.id && f.status === "pending");
  const accepted = friendships.filter((f) => f.status === "accepted");
  const existingRelationIds = new Set(friendships.map((f) => (f.user_id === user.id ? f.friend_id : f.user_id)));

  const incomingChallenges = challenges.filter((c) => c.receiver_id === user.id && c.status === "pending");
  const sentChallenges = challenges.filter((c) => c.sender_id === user.id);

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("chooseMode")}>← Back</button>
      </div>

      <div className="hero-header" style={{ padding: "18px 16px", marginBottom: 16 }}>
        <div className="hero-name" style={{ fontSize: 22 }}>Friends</div>
        <div style={{ color: "var(--cyan-bright)", fontSize: 12.5, position: "relative" }}>Search, connect, and challenge other players directly.</div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {info && <div className="success-box">{info}</div>}

      {incomingChallenges.length > 0 && (
        <div className="card card-panel pc-pulse">
          <div className="card-title" style={{ color: "var(--gold-bright)" }}>⚔ Incoming Battle Challenges</div>
          {incomingChallenges.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
              <AvatarCircle name={profilesById[c.sender_id]?.display_name || "?"} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>
                  <strong>{profilesById[c.sender_id]?.display_name || "A friend"}</strong> challenged you to {c.battle_size}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="btn btn-primary" style={{ marginBottom: 0, width: "auto", padding: "8px 14px" }} onClick={() => onNavigate("acceptChallenge", { challengeId: c.id })}>
                    Accept &amp; Fight
                  </button>
                  <button className="btn btn-ghost" style={{ marginBottom: 0, width: "auto", padding: "8px 14px" }} onClick={() => declineChallenge(c.id)}>
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sentChallenges.length > 0 && (
        <div className="card card-blue">
          <div className="card-title">Sent Challenges</div>
          {sentChallenges.map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span>{profilesById[c.receiver_id]?.display_name || "Friend"} · {c.battle_size}</span>
              <span style={{ color: "var(--text-dim)" }}>{c.status}</span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSearch} className="card card-cyan">
        <div className="card-title" style={{ color: "var(--cyan-bright)" }}>🔍 Search Players</div>
        <div className="field" style={{ marginBottom: 10 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by display name or email"
          />
        </div>
        <button type="submit" className="btn btn-cyan" disabled={searching}>
          {searching ? "Searching..." : "Search"}
        </button>

        {searchResults.map((p) => (
          <div key={p.id} className="fighter-card" style={{ marginTop: 10 }}>
            <AvatarCircle name={p.display_name} size={40} />
            <div className="fighter-card-body">
              <div className="fighter-card-name">{p.display_name} {p.is_guest && <span className="chip" style={{ fontSize: 9, marginLeft: 4 }}>Guest</span>}</div>
            </div>
            {existingRelationIds.has(p.id) ? (
              <span className="tag-soon">Already connected</span>
            ) : (
              <button className="icon-btn" onClick={() => sendRequest(p.id)}>Add</button>
            )}
          </div>
        ))}
        {searchResults.length === 0 && searchTerm && !searching && (
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8 }}>
            No matches yet. Friend search can be unreliable — you can still battle instantly using a Battle Code below.
          </div>
        )}
      </form>

      <QuickChallengeCard user={user} profile={profile} onNavigate={onNavigate} />

      {loading ? (
        <div className="center" style={{ padding: 30 }}><div className="spinner" /></div>
      ) : (
        <>
          {incoming.length > 0 && (
            <div className="card card-panel">
              <div className="card-title">Incoming Requests</div>
              {incoming.map((f) => (
                <div key={f.id} className="fighter-card" style={{ marginBottom: 8 }}>
                  <AvatarCircle name={profilesById[f.user_id]?.display_name || "?"} size={40} />
                  <div className="fighter-card-body">
                    <div className="fighter-card-name">{profilesById[f.user_id]?.display_name || "Unknown"} {profilesById[f.user_id]?.is_guest && <span className="chip" style={{ fontSize: 9 }}>Guest</span>}</div>
                  </div>
                  <div className="fighter-card-actions">
                    <button className="icon-btn" onClick={() => respond(f.id, "accepted")}>✓</button>
                    <button className="icon-btn" onClick={() => respond(f.id, "declined")}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {outgoing.length > 0 && (
            <div className="card">
              <div className="card-title">Sent Requests</div>
              {outgoing.map((f) => (
                <div key={f.id} className="fighter-card" style={{ marginBottom: 8 }}>
                  <AvatarCircle name={profilesById[f.friend_id]?.display_name || "?"} size={40} />
                  <div className="fighter-card-body">
                    <div className="fighter-card-name">{profilesById[f.friend_id]?.display_name || "Unknown"}</div>
                    <div className="fighter-card-meta">Waiting for response</div>
                  </div>
                  <button className="icon-btn" onClick={() => removeFriendship(f.id)}>Cancel</button>
                </div>
              ))}
            </div>
          )}

          <div className="card card-purple">
            <div className="card-title" style={{ color: "var(--purple-bright)" }}>Friends</div>
            {accepted.length === 0 ? (
              <div className="empty-state">
                <div className="display">No friends yet</div>
                <p>Search above to send a request.</p>
              </div>
            ) : (
              accepted.map((f) => {
                const otherId = f.user_id === user.id ? f.friend_id : f.user_id;
                const otherProfile = profilesById[otherId];
                return (
                  <div key={f.id} className="fighter-card" style={{ marginBottom: 8 }}>
                    <AvatarCircle name={otherProfile?.display_name || "?"} size={40} />
                    <div className="fighter-card-body">
                      <div className="fighter-card-name">{otherProfile?.display_name || "Unknown"} {otherProfile?.is_guest && <span className="chip" style={{ fontSize: 9 }}>Guest</span>}</div>
                    </div>
                    <div className="fighter-card-actions">
                      <button className="icon-btn" title="View Profile" onClick={() => setViewingProfile(otherProfile)}>👤</button>
                      <button className="icon-btn" title="Challenge" onClick={() => onNavigate("sendChallenge", { friendId: otherId, friendName: otherProfile?.display_name })}>⚔</button>
                      <button className="icon-btn" title="Remove" onClick={() => removeFriendship(f.id)}>✕</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {viewingProfile && (
        <div className="pc-modal-overlay" onClick={() => setViewingProfile(null)}>
          <div className="pc-modal-sheet" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="back-btn" onClick={() => setViewingProfile(null)}>✕ Close</button>
            </div>
            <AvatarCircle name={viewingProfile.display_name} size={80} />
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gold-bright)", marginTop: 12 }}>{viewingProfile.display_name}</div>
            {viewingProfile.is_guest && <div className="chip" style={{ marginTop: 6 }}>Guest Account</div>}
            <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 10 }}>Public profile info only — no private details shown.</div>
          </div>
        </div>
      )}
    </div>
  );
}
