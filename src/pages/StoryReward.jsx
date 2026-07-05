import React, { useEffect, useState } from "react";
import { getBossByKey } from "../lib/storyBosses";
import { STAT_KEYS } from "../lib/storyEngine";
import { getOrCreateStoryProgress, getUnlockedAbilities, unlockAbility, updateStoryProgress } from "../lib/storyService";

const STAT_LABELS = { strength: "Strength", speed: "Speed", durability: "Durability", battle_iq: "Battle IQ", stamina: "Stamina" };

export default function StoryReward({ user, fighterId, bossKey, level, grade, onNavigate }) {
  const [progress, setProgress] = useState(null);
  const [unlockedKeys, setUnlockedKeys] = useState([]);
  const [mode, setMode] = useState(null);
  const [points, setPoints] = useState({ strength: 0, speed: 0, durability: 0, battle_iq: 0, stamina: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showFinalVictory, setShowFinalVictory] = useState(false);

  const boss = getBossByKey(bossKey);

  useEffect(() => {
    (async () => {
      const p = await getOrCreateStoryProgress(user.id, fighterId);
      setProgress(p);
      const unlocked = await getUnlockedAbilities(user.id, fighterId);
      setUnlockedKeys(unlocked.map((u) => u.ability_key));
    })();
  }, [user.id, fighterId]);

  const availableAbilities = boss.abilities.filter((a) => !unlockedKeys.includes(a.key));
  const remainingPoints = 7 - Object.values(points).reduce((s, v) => s + v, 0);

  const adjustPoint = (key, delta) => {
    setPoints((prev) => {
      const next = Math.max(0, prev[key] + delta);
      const otherTotal = Object.entries(prev).filter(([k]) => k !== key).reduce((s, [, v]) => s + v, 0);
      if (next + otherTotal > 7) return prev;
      return { ...prev, [key]: next };
    });
  };

  const advanceAfterReward = async () => {
    if (level >= 7) {
      await updateStoryProgress(progress.id, {
        completed_runs: (progress.completed_runs || 0) + 1,
        final_boss_victories: (progress.final_boss_victories || 0) + 1,
        conqueror_of_seven: true,
        best_victory_grade: grade,
        current_level: 1,
        run_status: "idle"
      });
      setShowFinalVictory(true);
    } else {
      await updateStoryProgress(progress.id, { current_level: level + 1, run_status: "active" });
      onNavigate("storyLevel", { fighterId });
    }
  };

  const handleTakeAbility = async (ability) => {
    setSaving(true);
    setError("");
    try {
      await unlockAbility(user.id, fighterId, ability.key, boss.key);
      await advanceAfterReward();
    } catch (e) {
      setError("Could not unlock ability: " + e.message);
      setSaving(false);
    }
  };

  const handleTakePoints = async () => {
    if (remainingPoints !== 0) { setError("Assign all 7 points before continuing."); return; }
    setSaving(true);
    setError("");
    try {
      await updateStoryProgress(progress.id, {
        strength_bonus: (progress.strength_bonus || 0) + points.strength,
        speed_bonus: (progress.speed_bonus || 0) + points.speed,
        durability_bonus: (progress.durability_bonus || 0) + points.durability,
        battle_iq_bonus: (progress.battle_iq_bonus || 0) + points.battle_iq,
        stamina_bonus: (progress.stamina_bonus || 0) + points.stamina
      });
      await advanceAfterReward();
    } catch (e) {
      setError("Could not apply stat points: " + e.message);
      setSaving(false);
    }
  };

  if (!progress) return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;

  if (showFinalVictory) {
    return (
      <div className="page">
        <div className="card card-glow" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26, color: "var(--gold-bright)", fontWeight: 700 }}>CONQUEROR OF THE SEVEN</div>
          <p style={{ fontSize: 14, marginTop: 10 }}>The Void King falls. Your fighter's name is etched into Power Clash history.</p>
          <p style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 10 }}>Higher challenge paths will become available in a future update.</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("storyHome", { fighterId })}>Return to Story Home</button>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 style={{ color: "var(--gold-bright)", textTransform: "uppercase" }}>Victory Reward</h2>
      <div style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 14 }}>Choose exactly one reward.</div>

      {error && <div className="error-box">{error}</div>}

      {!mode && (
        <div className="mode-grid">
          <button className="card mode-card" onClick={() => setMode("ability")}>
            <div className="mode-icon">⚡</div>
            <div><div className="mode-card-title">Take an Ability</div><div className="mode-card-sub">Permanently unlock one of {boss.name}'s abilities.</div></div>
          </button>
          <button className="card mode-card" onClick={() => setMode("points")}>
            <div className="mode-icon">📈</div>
            <div><div className="mode-card-title">Gain 7 Stat Points</div><div className="mode-card-sub">Distribute across your five stats.</div></div>
          </button>
        </div>
      )}

      {mode === "ability" && (
        <div className="card">
          <div className="card-title">Choose an Ability</div>
          {availableAbilities.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>All of {boss.name}'s abilities are already unlocked — choose stat points instead.</div>
          ) : (
            availableAbilities.map((a) => (
              <div key={a.key} className="card" style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: "var(--gold-bright)" }}>{a.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 6 }}>{a.desc}</div>
                {a.key === boss.primaryReward && <div style={{ fontSize: 12, color: "var(--win)", marginBottom: 6 }}>Recommended — helps against {getBossByKey(boss.helpsAgainst)?.name || "a future boss"}</div>}
                <button className="btn btn-primary" style={{ marginBottom: 0 }} onClick={() => handleTakeAbility(a)} disabled={saving}>
                  Unlock {a.name}
                </button>
              </div>
            ))
          )}
          <button className="btn btn-ghost" onClick={() => setMode(null)}>Back</button>
        </div>
      )}

      {mode === "points" && (
        <div className="card">
          <div className="card-title">Distribute 7 Points — {remainingPoints} remaining</div>
          {STAT_KEYS.map((key) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span>{STAT_LABELS[key]}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="icon-btn" onClick={() => adjustPoint(key, -1)}>−</button>
                <span style={{ width: 20, textAlign: "center" }}>{points[key]}</span>
                <button className="icon-btn" onClick={() => adjustPoint(key, 1)}>+</button>
              </div>
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleTakePoints} disabled={saving || remainingPoints !== 0}>
            Confirm Points
          </button>
          <button className="btn btn-ghost" onClick={() => setMode(null)}>Back</button>
        </div>
      )}
    </div>
  );
}
