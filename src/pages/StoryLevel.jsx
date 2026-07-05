import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterVisual from "../components/FighterVisual.jsx";
import { getBossByLevel, getAbilityByKey } from "../lib/storyBosses";
import { runStoryLevelBattle } from "../lib/storyEngine";
import { pickBossDialogue } from "../lib/storyDialogue";
import {
  getOrCreateStoryProgress, getOrCreateBossProgress,
  recordBossResult, updateStoryProgress
} from "../lib/storyService";

export default function StoryLevel({ user, fighterId, onNavigate }) {
  const [fighter, setFighter] = useState(null);
  const [progress, setProgress] = useState(null);
  const [bossProgress, setBossProgress] = useState(null);
  const [equippedAbilities, setEquippedAbilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fighting, setFighting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: f } = await supabase.from("fighters").select("*").eq("id", fighterId).single();
        setFighter(f);
        const p = await getOrCreateStoryProgress(user.id, fighterId);
        setProgress(p);
        const boss = getBossByLevel(p.current_level);
        if (boss) {
          const bp = await getOrCreateBossProgress(user.id, fighterId, boss.key);
          setBossProgress(bp);
        }
        setEquippedAbilities([p.equipped_ability_1, p.equipped_ability_2, p.equipped_ability_3].filter(Boolean));
      } catch (e) {
        setError("Could not load level: " + e.message);
      }
      setLoading(false);
    })();
  }, [fighterId, user.id]);

  if (loading) return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;
  if (error) return <div className="page"><div className="error-box">{error}</div></div>;

  const boss = getBossByLevel(progress.current_level);
  if (!boss) return <div className="page"><div className="error-box">No boss found for this level.</div></div>;

  const intelTier = bossProgress?.intel_level >= 3 ? 3 : bossProgress?.intel_level >= 1 ? 1 : 0;
  const intelText = boss.hints[intelTier];

  const handleFight = async () => {
    setFighting(true);
    const storyResult = runStoryLevelBattle({
      fighter, progress, equippedAbilityKeys: equippedAbilities, level: progress.current_level
    });

    const memory = await recordBossResult(user.id, fighterId, boss.key, storyResult, equippedAbilities);

    if (storyResult.won) {
      const newHighest = Math.max(progress.highest_level, progress.current_level);
      await updateStoryProgress(progress.id, { highest_level: newHighest, run_status: "active" });
    } else {
      const newHighest = Math.max(progress.highest_level, progress.current_level);
      await updateStoryProgress(progress.id, {
        run_status: "pending_training", highest_level: newHighest,
        last_boss_key: boss.key, last_defeat_cause: boss.signature_move,
        current_level: 1
      });
    }

    setResult({ ...storyResult, timesLost: memory.timesLost });
    setFighting(false);
  };

  if (result) {
    const dialogue = !result.won ? pickBossDialogue(boss, result, result.timesLost) : null;
    return (
      <div className="page">
        <div className="card card-glow" style={{ textAlign: "center" }}>
          <div className={`card-value ${result.won ? "win" : "loss"}`} style={{ fontSize: 28 }}>{result.won ? "VICTORY" : "DEFEAT"}</div>
          {result.won && <div style={{ fontSize: 20, color: "var(--gold-bright)", marginTop: 6 }}>Grade: {result.grade}</div>}
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8 }}>
            {fighter.fighter_name}: {result.playerScore} vs {boss.name}: {result.bossScore}
          </div>
        </div>

        {result.reachedPhase2 && (
          <div className="card">
            <div className="card-title">Phase Two Triggered</div>
            <div style={{ fontSize: 13 }}>{boss.phase2_behavior}</div>
          </div>
        )}
        {result.reachedPhase3 && (
          <div className="card">
            <div className="card-title">Phase Three Triggered</div>
            <div style={{ fontSize: 13 }}>{boss.phase3_behavior}</div>
          </div>
        )}

        {result.milestones.length > 0 && (
          <div className="card">
            <div className="card-title">Stat Milestones</div>
            {result.milestones.map((m) => (
              <div key={m.stat} style={{ fontSize: 13 }}>{m.stat.replace("_", " ")} reached {m.tier}+ — visual enhancement active.</div>
            ))}
          </div>
        )}

        {!result.won && (
          <div className="card">
            <div className="card-title">{boss.name}</div>
            <p style={{ fontSize: 14, fontStyle: "italic" }}>"{dialogue}"</p>
          </div>
        )}

        {result.won ? (
          <button className="btn btn-primary" onClick={() => onNavigate("storyReward", { fighterId, bossKey: boss.key, level: progress.current_level, grade: result.grade })}>
            Continue to Reward
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => onNavigate("storyTraining", { fighterId })}>
            Continue to Training
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("storyHome", { fighterId })}>← Story Home</button>
      </div>

      <h2 style={{ color: "var(--gold-bright)", textTransform: "uppercase" }}>Level {progress.current_level} of 7</h2>

      <div className="card card-glow">
        <div className="card-title">{boss.name}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 8 }}>{boss.theme}</div>
        <p style={{ fontSize: 14, fontStyle: "italic", marginBottom: 10 }}>{boss.intro}</p>
        <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
          <FighterVisual fighter={{ character_type: boss.character_type, fighting_style: boss.fighting_style, power_source: boss.power_source, main_power: boss.signature_move }} size={110} animated />
        </div>
        <div style={{ fontSize: 13 }}>Signature Move: <strong style={{ color: "var(--gold-bright)" }}>{boss.signature_move}</strong></div>
      </div>

      <div className="card">
        <div className="card-title">Boss Intel</div>
        <p style={{ fontSize: 13.5 }}>{intelText}</p>
      </div>

      <div className="card">
        <div className="card-title">Your Fighter</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 56, height: 56 }}><FighterVisual fighter={fighter} size={54} /></div>
          <div style={{ fontWeight: 700 }}>{fighter.fighter_name}</div>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 8 }}>
          Equipped abilities: {equippedAbilities.length === 0 ? "None" : equippedAbilities.map((k) => getAbilityByKey(k)?.name).join(", ")}
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleFight} disabled={fighting}>
        {fighting ? "Fighting..." : "Start Battle"}
      </button>
    </div>
  );
}
