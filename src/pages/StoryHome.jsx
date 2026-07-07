import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterVisual from "../components/FighterVisual.jsx";
import { getOrCreateStoryProgress, getUnlockedAbilities, beginFirstRun } from "../lib/storyService";
import { computeEffectiveStats } from "../lib/storyEngine";
import { getAbilityByKey } from "../lib/storyBosses";
import StoryRunSummary from "../components/StoryRunSummary.jsx";

export default function StoryHome({ user, onNavigate }) {
  const [fighters, setFighters] = useState([]);
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

  const handleContinueRun = () => onNavigate("storyLevel", { fighterId });

  if (loading) return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("chooseMode")}>← Back</button>
      </div>

      <h2 style={{ marginBottom: 6, color: "var(--gold-bright)", textTransform: "uppercase" }}>Story Mode</h2>
      <div style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 14 }}>Seven bosses. One fighter. No team required.</div>

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

              <div className="card">
                <div className="card-title">Equipped Story Abilities</div>
                {[progress.equipped_ability_1, progress.equipped_ability_2, progress.equipped_ability_3, progress.equipped_ability_4, progress.equipped_ability_5, progress.equipped_ability_6, progress.equipped_ability_7].map((key, i) => {
                  const ability = key ? getAbilityByKey(key) : null;
                  return (
                    <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>
                      Slot {i + 1}: {ability ? <strong style={{ color: "var(--gold-bright)" }}>{ability.name}</strong> : <span style={{ color: "var(--text-dim)" }}>Empty</span>}
                    </div>
                  );
                })}
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6 }}>{unlockedAbilities.length} abilities unlocked total.</div>
              </div>

              <StoryRunSummary progress={progress} unlockedAbilities={unlockedAbilities} onReset={() => window.location.reload()} />

              <button className="btn" onClick={() => onNavigate("storyBossIntel", { fighterId })}>Boss Intel</button>
              <button className="btn" onClick={() => onNavigate("storyAbilityArchive", { fighterId })}>Ability Archive</button>

              {progress.run_status === "active" ? (
                <button className="btn btn-primary" onClick={handleContinueRun}>Continue Run — Level {progress.current_level}</button>
              ) : progress.run_status === "pending_training" ? (
                <button className="btn btn-primary" onClick={() => onNavigate("storyTraining", { fighterId })}>Continue to Training</button>
              ) : (
                <button className="btn btn-primary" onClick={handleBeginRun}>Begin Run</button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
