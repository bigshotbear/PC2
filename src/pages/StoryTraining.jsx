import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getAbilityByKey } from "../lib/storyBosses";
import { computeEffectiveStats } from "../lib/storyEngine";
import { getOrCreateStoryProgress, getUnlockedAbilities, upgradeAbility, updateStoryProgress } from "../lib/storyService";
import StoryRunSummary from "../components/StoryRunSummary.jsx";

const STAT_LABELS = { strength: "Strength", speed: "Speed", durability: "Durability", battle_iq: "Battle IQ", stamina: "Stamina" };

export default function StoryTraining({ user, fighterId, onNavigate }) {
  const [fighter, setFighter] = useState(null);
  const [progress, setProgress] = useState(null);
  const [unlocked, setUnlocked] = useState([]);
  const [mode, setMode] = useState(null);
  const [points, setPoints] = useState({ strength: 0, speed: 0, durability: 0, battle_iq: 0, stamina: 0 });
  const [claimed, setClaimed] = useState(false);
  const [claimSummary, setClaimSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: f } = await supabase.from("fighters").select("*").eq("id", fighterId).single();
      setFighter(f);
      const p = await getOrCreateStoryProgress(user.id, fighterId);
      setProgress(p);
      const u = await getUnlockedAbilities(user.id, fighterId);
      setUnlocked(u);
    })();
  }, [user.id, fighterId]);

  const resetPoints = () => setPoints({ strength: 0, speed: 0, durability: 0, battle_iq: 0, stamina: 0 });

  if (!progress || !fighter) return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;

  const alreadyClaimed = progress.run_status !== "pending_training";
  const remaining = 2 - Object.values(points).reduce((s, v) => s + v, 0);

  const adjustPoint = (key, delta) => {
    setPoints((prev) => {
      const next = Math.max(0, prev[key] + delta);
      const otherTotal = Object.entries(prev).filter(([k]) => k !== key).reduce((s, [, v]) => s + v, 0);
      if (next + otherTotal > 2) return prev;
      return { ...prev, [key]: next };
    });
  };

  const finish = async (extraFields = {}) => {
    await updateStoryProgress(progress.id, { run_status: "idle", ...extraFields });
    setClaimed(true);
  };

  const handleTakePoints = async () => {
    if (remaining !== 0) { setError("Assign both points before continuing."); return; }
    setSaving(true);
    try {
      const eff = computeEffectiveStats(fighter, progress);
      const changed = Object.entries(points).filter(([, v]) => v > 0)
        .map(([key, v]) => `${STAT_LABELS[key]} increased from ${eff[key]} to ${eff[key] + v}`);
      setClaimSummary(changed.join(". "));
      await finish({
        strength_bonus: (progress.strength_bonus || 0) + points.strength,
        speed_bonus: (progress.speed_bonus || 0) + points.speed,
        durability_bonus: (progress.durability_bonus || 0) + points.durability,
        battle_iq_bonus: (progress.battle_iq_bonus || 0) + points.battle_iq,
        stamina_bonus: (progress.stamina_bonus || 0) + points.stamina
      });
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const handleUpgrade = async (abilityKey) => {
    setSaving(true);
    try {
      await upgradeAbility(user.id, fighterId, abilityKey);
      const ability = getAbilityByKey(abilityKey);
      const current = unlocked.find((u) => u.ability_key === abilityKey);
      setClaimSummary(`${ability?.name} upgraded to Level ${Math.min(3, (current?.upgrade_level || 1) + 1)}`);
      await finish();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const handleBeginNewRun = async () => {
    await updateStoryProgress(progress.id, {
      run_status: "active", current_level: 1, total_attempts: (progress.total_attempts || 0) + 1,
      wins_this_run: 0, losses_this_run: 0, completed_bosses: []
    });
    onNavigate("storyLevel", { fighterId });
  };

  return (
    <div className="page">
      <h2 style={{ color: "var(--gold-bright)", textTransform: "uppercase" }}>Training</h2>
      <div style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 14 }}>
        The run ended, but everything you've earned stays with you.
      </div>

      {error && <div className="error-box">{error}</div>}

      <StoryRunSummary progress={progress} unlockedAbilities={unlocked} />

      {claimed || alreadyClaimed ? (
        <>
          <div className="success-box">Training saved.{claimSummary ? ` ${claimSummary}.` : ""}</div>
          <button className="btn btn-primary" onClick={handleBeginNewRun}>Begin New Run</button>
        </>
      ) : !mode ? (
        <div className="mode-grid">
          <button className="card mode-card" onClick={() => setMode("points")}>
            <div className="mode-icon">📈</div>
            <div><div className="mode-card-title">Gain 2 Stat Points</div><div className="mode-card-sub">Distribute across your five stats.</div></div>
          </button>
          <button className="card mode-card" onClick={() => setMode("ability")}>
            <div className="mode-icon">⬆</div>
            <div><div className="mode-card-title">Upgrade an Ability</div><div className="mode-card-sub">Improve one unlocked ability by one level.</div></div>
          </button>
        </div>
      ) : mode === "points" ? (
        <div className="card">
          <div className="card-title">Distribute 2 Points — {remaining} remaining</div>
          {Object.keys(STAT_LABELS).map((key) => {
            const eff = computeEffectiveStats(fighter, progress);
            const before = eff[key];
            const after = before + points[key];
            return (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span>{STAT_LABELS[key]}: {before}{points[key] > 0 ? ` → ${after}` : ""}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="icon-btn" onClick={() => adjustPoint(key, -1)}>−</button>
                  <span style={{ width: 20, textAlign: "center" }}>{points[key]}</span>
                  <button className="icon-btn" onClick={() => adjustPoint(key, 1)}>+</button>
                </div>
              </div>
            );
          })}
          <button className="btn btn-primary" onClick={handleTakePoints} disabled={saving || remaining !== 0}>Confirm Training</button>
          <button className="btn btn-ghost" onClick={resetPoints}>Reset Points</button>
          <button className="btn btn-ghost" onClick={() => setMode(null)}>Back</button>
        </div>
      ) : (
        <div className="card">
          <div className="card-title">Upgrade an Unlocked Ability</div>
          {unlocked.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>No abilities unlocked yet — choose stat points instead.</div>
          ) : (
            unlocked.map((u) => {
              const ability = getAbilityByKey(u.ability_key);
              return (
                <div key={u.id} className="card" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>{ability?.name} <span style={{ color: "var(--text-dim)", fontSize: 12 }}>(Level {u.upgrade_level}/3)</span></div>
                  <button className="btn btn-primary" style={{ marginBottom: 0 }} onClick={() => handleUpgrade(u.ability_key)} disabled={saving || u.upgrade_level >= 3}>
                    {u.upgrade_level >= 3 ? "Max Level" : "Upgrade"}
                  </button>
                </div>
              );
            })
          )}
          <button className="btn btn-ghost" onClick={() => setMode(null)}>Back</button>
        </div>
      )}
    </div>
  );
}
