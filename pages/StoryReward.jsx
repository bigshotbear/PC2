import React, { useEffect, useState, useRef } from "react";
import { getBossByKey, TOTAL_STORY_LEVELS } from "../lib/storyBosses";
import { STAT_KEYS } from "../lib/storyEngine";
import { getOrCreateStoryProgress, getUnlockedAbilities, claimStoryReward, getUnclaimedStoryWin } from "../lib/storyService";
import { savePendingBattle, getPendingBattle, clearPendingBattle } from "../lib/idempotencyService";

const STAT_LABELS = { strength: "Strength", speed: "Speed", durability: "Durability", battle_iq: "Battle IQ", stamina: "Stamina" };

export default function StoryReward({ user, fighterId, bossKey: bossKeyProp, level: levelProp, grade: gradeProp, completionId: completionIdProp, onNavigate }) {
  const [progress, setProgress] = useState(null);
  const [unlockedKeys, setUnlockedKeys] = useState([]);
  const [mode, setMode] = useState(null);
  const [points, setPoints] = useState({ strength: 0, speed: 0, durability: 0, battle_iq: 0, stamina: 0 });
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [error, setError] = useState("");
  const [showFinalVictory, setShowFinalVictory] = useState(false);
  const [completionId, setCompletionId] = useState(completionIdProp || null);
  const [bossKey, setBossKey] = useState(bossKeyProp || null);
  const [level, setLevel] = useState(levelProp || null);
  const [grade, setGrade] = useState(gradeProp || null);
  const [resolvingCompletion, setResolvingCompletion] = useState(!completionIdProp);
  const [noRewardFound, setNoRewardFound] = useState(false);

  const boss = bossKey ? getBossByKey(bossKey) : null;
  const isFinal = level >= TOTAL_STORY_LEVELS;
  const slotKey = `storyReward:${completionId}`;
  const pendingClaimRef = useRef(null);

  // Recover everything the screen needs (completion id, boss, level,
  // grade) if the route params are missing — a hard refresh wipes this
  // app's in-memory routing state entirely. Try the per-fighter pointer
  // saved at battle-completion time first, then fall back to a real
  // server query that needs no client storage at all.
  useEffect(() => {
    if (completionIdProp) return;
    (async () => {
      const stored = getPendingBattle(`unclaimedWin:${fighterId}`)?.payload;
      if (stored?.completionId) {
        setCompletionId(stored.completionId);
        setBossKey(stored.bossKey);
        setLevel(stored.level);
        setGrade(stored.grade);
        setResolvingCompletion(false);
        return;
      }
      const recovered = await getUnclaimedStoryWin(fighterId);
      if (recovered) {
        setCompletionId(recovered.completion_id);
        setBossKey(recovered.boss_key);
        setLevel(recovered.level);
        setGrade(recovered.grade);
      } else {
        setNoRewardFound(true);
      }
      setResolvingCompletion(false);
    })();
  }, [completionIdProp, fighterId]);

  useEffect(() => {
    if (completionId) {
      const pending = getPendingBattle(slotKey)?.payload || null;
      pendingClaimRef.current = pending;
      if (pending) setSaveFailed(true);
    }
  }, [completionId]);

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

  const persistClaim = async (claim) => {
    if (!completionId) {
      setSaveFailed(true);
      setError("Missing a valid battle completion reference — please return to Story Home and retry the level.");
      return;
    }
    setSaving(true);
    setSaveFailed(false);
    setError("");
    try {
      await claimStoryReward({
        completionId,
        rewardType: claim.rewardType,
        abilityKey: claim.abilityKey,
        statPoints: claim.statPoints
      });
      clearPendingBattle(slotKey);
      clearPendingBattle(`unclaimedWin:${fighterId}`);
      pendingClaimRef.current = null;
      setSaveFailed(false);
      if (isFinal) {
        setShowFinalVictory(true);
      } else {
        onNavigate("storyLevel", { fighterId });
      }
    } catch (e) {
      setSaveFailed(true);
      setError(e.message);
    }
    setSaving(false);
  };

  const startClaim = (claim) => {
    pendingClaimRef.current = claim;
    savePendingBattle(slotKey, completionId, claim);
    persistClaim(claim);
  };

  const handleTakeAbility = (ability) => {
    startClaim({ rewardType: "ability", abilityKey: ability.key });
  };

  const handleTakePoints = () => {
    if (remainingPoints !== 0) { setError("Assign all 7 points before continuing."); return; }
    startClaim({ rewardType: "points", statPoints: points });
  };

  const handleRetry = () => {
    if (pendingClaimRef.current) persistClaim(pendingClaimRef.current);
  };

  if (resolvingCompletion) {
    return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /><div style={{ color: "var(--text-dim)", marginTop: 10 }}>Recovering your victory...</div></div>;
  }

  if (noRewardFound) {
    return (
      <div className="page">
        <div className="card card-danger">
          <div className="card-title">No Pending Reward Found</div>
          <p style={{ fontSize: 14, marginBottom: 10 }}>
            We couldn't find an unclaimed victory for this fighter. If you just won a fight, try again from Story Home.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate("storyHome", { fighterId })}>Return to Story Home</button>
        </div>
      </div>
    );
  }

  if (!progress) return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;

  if (saveFailed) {
    return (
      <div className="page">
        <div className="card card-danger">
          <div className="card-title">Reward Not Saved</div>
          <p style={{ fontSize: 14, marginBottom: 10 }}>Reward could not be saved. Tap Retry.</p>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-primary" onClick={handleRetry} disabled={saving || !pendingClaimRef.current}>
            {saving ? "Retrying..." : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  if (showFinalVictory) {
    return (
      <div className="page">
        <div className="card card-glow" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26, color: "var(--gold-bright)", fontWeight: 700 }}>CAMPAIGN CONQUERED</div>
          <p style={{ fontSize: 14, marginTop: 10 }}>The Everything Guy falls. Your fighter's name is etched into Power Clash history.</p>
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
          <button className="card mode-card card-purple" onClick={() => setMode("ability")}>
            <div className="mode-icon">⚡</div>
            <div><div className="mode-card-title">Take an Ability</div><div className="mode-card-sub">Permanently unlock one of {boss.name}'s abilities.</div></div>
          </button>
          <button className="card mode-card card-glow" onClick={() => setMode("points")}>
            <div className="mode-icon">📈</div>
            <div><div className="mode-card-title">Gain 7 Stat Points</div><div className="mode-card-sub">Distribute across your five stats.</div></div>
          </button>
        </div>
      )}

      {mode === "ability" && (
        <div className="card card-purple">
          <div className="card-title">Choose an Ability</div>
          {availableAbilities.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>All of {boss.name}'s abilities are already unlocked — choose stat points instead.</div>
          ) : (
            availableAbilities.map((a) => (
              <div key={a.key} className="card" style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: "var(--purple-bright)" }}>{a.name}</div>
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
        <div className="card card-glow">
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
            {saving ? "Saving..." : "Confirm Points"}
          </button>
          <button className="btn btn-ghost" onClick={() => setMode(null)}>Back</button>
        </div>
      )}
    </div>
  );
}
