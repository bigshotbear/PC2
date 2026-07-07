import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterVisual from "../components/FighterVisual.jsx";
import { getOrCreateStoryProgress, getUnlockedAbilities, beginFirstRun, updateStoryProgress } from "../lib/storyService";
import StoryLevelMap from "../components/StoryLevelMap.jsx";
import EquippedAbilitiesSummary from "../components/EquippedAbilitiesSummary.jsx";
import StoryAbilityManagerModal from "../components/StoryAbilityManagerModal.jsx";
import { computeEffectiveStats } from "../lib/storyEngine";
import { getAbilityByKey } from "../lib/storyBosses";
import StoryRunSummary from "../components/StoryRunSummary.jsx";

export default function StoryHome({ user, onNavigate }) {
  const [fighters, setFighters] = useState([]);
  const [showAbilityManager, setShowAbilityManager] = useState(false);
  const [fighterId, setFighterId] = useState(null);
  const [fighter, setFighter] = useState(null);
  const [progress, setProgress] = useState(null);
  const [unlockedAbilities, setUnlockedAbilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("fighters").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      setFighters(data || []);
      if (data?.length) setFighterId(data[0].id);
      else setLoading(false);
    })();
  }, [user.id]);

  useEffect(() => {
    if (!fighterId) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const f = fighters.find((x) => x.id === fighterId);
        setFighter(f);
        const p = await getOrCreateStoryProgress(user.id, fighterId);
        setProgress(p);
        const abilities = await getUnlockedAbilities(user.id, fighterId);
        setUnlockedAbilities(abilities);
      } catch (e) {
        setError("Could not load Story Mode progress: " + e.message);
      }
      setLoading(false);
    })();
  }, [fighterId, fighters, user.id]);

  const handleBeginRun = async () => {
    const updated = await beginFirstRun(progress.id, progress.total_attempts);
    setProgress(updated);
    onNavigate("storyLevel", { fighterId });
  };

  const handleRetryCheckpoint = async () => {
    const updated = await updateStoryProgress(progress.id, { run_status: "active", total_attempts: (progress.total_attempts || 0) + 1 });
    setProgress(updated);
    onNavigate("storyLevel", { fighterId });
  };

  const handleContinueRun = () => onNavigate("storyLevel", { fighterId });

  if (loading) return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("chooseMode")}>← Back</button>
      </div>

      <div className="hero-header" style={{ padding: "18px 16px", marginBottom: 16 }}>
        <div className="hero-name" style={{ fontSize: 22 }}>Story Mode</div>
        <div style={{ color: "var(--cyan-bright)", fontSize: 12.5, position: "relative" }}>Seventeen bosses across two arcs. One fighter. No team required.</div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {fighters.length === 0 ? (
        <div className="empty-state">
          <div className="display">No saved fighters</div>
          <p>Build a fighter first, then come back to Story Mode.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-title">Select Fighter</div>
            <select value={fighterId || ""} onChange={(e) => setFighterId(e.target.value)}>
              {fighters.map((f) => <option key={f.id} value={f.id}>{f.fighter_name}</option>)}
            </select>
          </div>

          {fighter && progress && (
            <>
              <div className="card card-glow" style={{ textAlign: "center" }}>
                <div style={{ width: 100, height: 100, margin: "0 auto" }}><FighterVisual fighter={fighter} size={100} animated /></div>
                <div style={{ fontWeight: 700, fontSize: 18, marginTop: 8 }}>{fighter.fighter_name}</div>
                {progress.conqueror_of_seven && <div className="chip" style={{ marginTop: 6, borderColor: "var(--gold-bright)", color: "var(--gold-bright)" }}>Campaign Conquered</div>}
              </div>

              <StoryLevelMap progress={progress} />

              <div className="card">
                <div className="card-title">Effective Story Stats</div>
                {(() => {
                  const eff = computeEffectiveStats(fighter, progress);
                  const rows = [
                    ["Strength", fighter.strength, progress.strength_bonus, eff.strength],
                    ["Speed", fighter.speed, progress.speed_bonus, eff.speed],
                    ["Durability", fighter.durability, progress.durability_bonus, eff.durability],
                    ["Battle IQ", fighter.battle_iq, progress.battle_iq_bonus, eff.battle_iq],
                    ["Stamina", fighter.stamina, progress.stamina_bonus, eff.stamina]
                  ];
                  return rows.map(([label, base, bonus, effVal]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span>{label}</span>
                      <span>{base} <span style={{ color: "var(--gold)" }}>+{bonus || 0}</span> = <strong>{effVal}</strong></span>
                    </div>
                  ));
                })()}
              </div>

              <div className="stat-grid">
                <div className="card"><div className="card-title">Highest Level</div><div className="card-value gold">{progress.highest_level}</div></div>
                <div className="card"><div className="card-title">Current Level</div><div className="card-value">{progress.current_level}</div></div>
                <div className="card"><div className="card-title">Total Attempts</div><div className="card-value">{progress.total_attempts}</div></div>
                <div className="card"><div className="card-title">Completed Runs</div><div className="card-value win">{progress.completed_runs}</div></div>
              </div>

              <EquippedAbilitiesSummary progress={progress} onManage={() => setShowAbilityManager(true)} />
              <div style={{ fontSize: 12, color: "var(--text-dim)", margin: "-8px 0 12px" }}>{unlockedAbilities.length} abilities unlocked total.</div>

              <StoryRunSummary progress={progress} unlockedAbilities={unlockedAbilities} onReset={() => window.location.reload()} />

              <button className="btn" onClick={() => onNavigate("storyBossIntel", { fighterId })}>Boss Intel</button>
              <button className="btn" onClick={() => onNavigate("storyAbilityArchive", { fighterId })}>Ability Archive</button>

              {progress.run_status === "active" ? (
                <button className="btn btn-primary" onClick={handleContinueRun}>Continue Run — Level {progress.current_level}</button>
              ) : progress.run_status === "pending_training" ? (
                <button className="btn btn-primary" onClick={() => onNavigate("storyTraining", { fighterId })}>Continue to Training</button>
              ) : progress.current_level > 1 ? (
                <button className="btn btn-primary" onClick={handleRetryCheckpoint}>Retry Level {progress.current_level}</button>
              ) : (
                <button className="btn btn-primary" onClick={handleBeginRun}>Begin Run</button>
              )}
            </>
          )}
        </>
      )}

      {showAbilityManager && (
        <StoryAbilityManagerModal
          user={user}
          fighterId={fighterId}
          onClose={() => { setShowAbilityManager(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}
