import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterVisual from "../components/FighterVisual.jsx";
import { getBossByLevel, getAbilityByKey, TOTAL_STORY_LEVELS } from "../lib/storyBosses";
import { computeEffectiveStats, STAT_KEYS } from "../lib/storyEngine";
import { judgeStoryBattleSafe } from "../lib/storyRefereeService";
import { pickBossDialogue } from "../lib/storyDialogue";
import {
  getOrCreateStoryProgress, getOrCreateBossProgress,
  completeStoryBattle, updateStoryProgress, getUnclaimedStoryWin, getStoryCompletion
} from "../lib/storyService";
import { generateIdempotencyKey, savePendingBattle, getPendingBattle, clearPendingBattle } from "../lib/idempotencyService";
import StoryRunSummary from "../components/StoryRunSummary.jsx";
import EquippedAbilitiesSummary from "../components/EquippedAbilitiesSummary.jsx";
import StoryAbilityManagerModal from "../components/StoryAbilityManagerModal.jsx";
import ClashAftermath from "../components/ClashAftermath.jsx";
import { adaptStoryResult } from "../lib/resultAdapters";

const STAT_LABELS = { strength: "Strength", speed: "Speed", durability: "Durability", battle_iq: "Battle IQ", stamina: "Stamina" };

function StatBar({ label, mine, theirs }) {
  const max = Math.max(mine, theirs, 1) * 1.15;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color: mine > theirs ? "var(--win)" : mine < theirs ? "var(--loss)" : "var(--text-dim)" }}>
          {mine} vs {theirs}
        </span>
      </div>
      <div style={{ display: "flex", gap: 3, height: 8 }}>
        <div style={{ flex: 1, background: "#262b38", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(mine / max) * 100}%`, background: "var(--win)", marginLeft: "auto" }} />
        </div>
        <div style={{ flex: 1, background: "#262b38", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(theirs / max) * 100}%`, background: "var(--loss)" }} />
        </div>
      </div>
    </div>
  );
}

export default function StoryLevel({ user, fighterId, onNavigate }) {
  const [fighter, setFighter] = useState(null);
  const [progress, setProgress] = useState(null);
  const [bossProgress, setBossProgress] = useState(null);
  const [equippedAbilities, setEquippedAbilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState("intel");
  const [planText, setPlanText] = useState("");
  const [guided, setGuided] = useState({ opener: "", defense: "", counter: "", arena: "", finish: "" });
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [judgment, setJudgment] = useState(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [showAbilityManager, setShowAbilityManager] = useState(false);
  const [saving, setSaving] = useState(false);
  const pendingRef = React.useRef(null); // { key, bossKey, level, fighterId, result }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: f } = await supabase.from("fighters").select("*").eq("id", fighterId).single();
        setFighter(f);
        const p = await getOrCreateStoryProgress(user.id, fighterId);
        setProgress(p);
        const boss = getBossByLevel(p.current_level);
        if (boss) setBossProgress(await getOrCreateBossProgress(user.id, fighterId, boss.key));
        setEquippedAbilities([p.equipped_ability_1, p.equipped_ability_2, p.equipped_ability_3, p.equipped_ability_4, p.equipped_ability_5, p.equipped_ability_6, p.equipped_ability_7].filter(Boolean));

        const pending = getPendingBattle("storyLevel");
        if (pending && pending.payload?.fighterId === fighterId) {
          pendingRef.current = pending.payload;
          setJudgment(pending.payload.result);
          setSaveFailed(true);
          setStep("result");
        } else {
          // No failed-save recovery needed — check whether a battle already
          // saved successfully but display state was lost (hard refresh).
          //
          // Recovery order, exactly:
          //   1. sessionStorage fast-path (same tab, either win or loss)
          //   2. a KNOWN completionId (persists across claim/no-claim) via
          //      get_story_completion — works whether the reward has
          //      already been claimed or not
          //   3. only if no completionId is known at all, fall back to
          //      get_unclaimed_story_win — that one is reward-status-aware
          //      by design and would miss an already-claimed completion,
          //      which is exactly why step 2 exists.
          const lastResult = getPendingBattle(`lastStoryResult:${fighterId}`)?.payload;
          if (lastResult?.result) {
            setJudgment(lastResult.result);
            setStep("result");
          } else {
            const knownCompletionId = getPendingBattle(`lastCompletionId:${fighterId}`)?.payload?.completionId;
            if (knownCompletionId) {
              const completion = await getStoryCompletion(knownCompletionId);
              if (completion?.result_snapshot) {
                setJudgment(completion.result_snapshot);
                setStep("result");
              }
            } else {
              const recovered = await getUnclaimedStoryWin(fighterId);
              if (recovered?.result_snapshot) {
                setJudgment(recovered.result_snapshot);
                setStep("result");
              }
            }
          }
        }
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

  const effective = computeEffectiveStats(fighter, progress);
  const equippedAbilityObjs = equippedAbilities.map(getAbilityByKey).filter(Boolean);
  const intelTier = bossProgress?.intel_level >= 3 ? 3 : bossProgress?.intel_level >= 1 ? 1 : 0;

  const composedPlan = () => {
    const guidedText = Object.entries(guided).filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v}`).join(". ");
    return planText.trim().length >= guidedText.length ? planText.trim() : guidedText;
  };

  const handleSubmitPlan = async (skip = false) => {
    const finalPlan = skip ? "" : composedPlan();
    if (!skip && finalPlan.length > 0 && finalPlan.length < 40) {
      setError("Add a bit more detail, or use Skip if you'd rather fight without a written plan.");
      return;
    }
    setError("");
    setStep("fighting");
    setPhaseIndex(0);

    const result = await judgeStoryBattleSafe({
      fighter, progress, boss, equippedAbilities: equippedAbilityObjs, planText: finalPlan,
      timesDefeated: bossProgress?.times_defeated || 0
    });

    const won = result.winner === "player";
    const key = generateIdempotencyKey(user.id);
    const timesLostBefore = bossProgress?.times_lost || 0;

    // Persist the ALREADY-DECIDED result before attempting to save. If the
    // save fails or the page reloads, Retry Save reuses this exact result
    // — the referee (with its own randomness) never runs a second time.
    const pendingPayload = {
      key, fighterId, bossKey: boss.key, level: progress.current_level, won,
      result: { ...result, won, timesLost: timesLostBefore + (won ? 0 : 1) }
    };
    pendingRef.current = pendingPayload;
    savePendingBattle("storyLevel", key, pendingPayload);

    await persistStoryResult(pendingPayload);
  };

  const persistStoryResult = async (pendingPayload) => {
    setSaving(true);
    setSaveFailed(false);
    try {
      const fullResult = { ...pendingPayload.result };
      const saved = await completeStoryBattle({
        idempotencyKey: pendingPayload.key,
        fighterId: pendingPayload.fighterId,
        bossKey: pendingPayload.bossKey,
        level: pendingPayload.level,
        won: pendingPayload.won,
        grade: pendingPayload.result.grade,
        bossLowestHealth: pendingPayload.won ? 20 : 60,
        defeatCause: boss.signature_move,
        resultSnapshot: { ...fullResult, completionId: undefined } // stored durably server-side, keyed by completion_id itself
      });
      clearPendingBattle("storyLevel");
      setSaveFailed(false);

      const finalResult = { ...fullResult, completionId: saved.completion_id };

      // Persists regardless of claim status — this is what lets the
      // aftermath screen recover even after story_reward_claims has a
      // row for this completion. Overwritten (not cleared) by the next
      // battle's own completion id.
      savePendingBattle(`lastCompletionId:${pendingPayload.fighterId}`, saved.completion_id, { completionId: saved.completion_id });

      // Fast-path recovery for THIS screen (win or loss) — survives a
      // hard refresh in the same tab. The server-side result_snapshot
      // (written above) is the durable backup if this is ever unavailable.
      savePendingBattle(`lastStoryResult:${pendingPayload.fighterId}`, saved.completion_id, { result: finalResult });

      // Separate, win-only pointer used specifically by the reward screen.
      if (pendingPayload.won) {
        savePendingBattle(`unclaimedWin:${pendingPayload.fighterId}`, saved.completion_id, {
          completionId: saved.completion_id,
          bossKey: pendingPayload.bossKey,
          level: pendingPayload.level,
          grade: pendingPayload.result.grade
        });
      }
      setJudgment(finalResult);
    } catch (e) {
      setSaveFailed(true);
      setError(e.message);
    }
    setSaving(false);
  };

  const handleRetrySave = () => {
    if (pendingRef.current) persistStoryResult(pendingRef.current);
  };

  if (step === "fighting" && !judgment) {
    return (
      <div className="page center" style={{ minHeight: "60vh", flexDirection: "column", gap: 14 }}>
        <div className="spinner" />
        <div style={{ color: "var(--text-dim)" }}>The referee is evaluating your plan...</div>
      </div>
    );
  }

  if (step === "fighting" && judgment) {
    const phase = judgment.fightPhases[phaseIndex];
    const isLast = phaseIndex === judgment.fightPhases.length - 1;
    const health = judgment.healthTimeline?.[phaseIndex] || { player: 100, opponent: 100 };
    return (
      <div className="page">
        <div className="card card-glow">
          <div className="card-title">{phase.phase}</div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ flex: 1, marginRight: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>{fighter.fighter_name.toUpperCase()}</div>
              <div style={{ height: 10, borderRadius: 6, background: "#262b38", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${health.player}%`, background: "linear-gradient(90deg, var(--win), #1e9c6f)", transition: "width .4s ease" }} />
              </div>
            </div>
            <div style={{ flex: 1, marginLeft: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4, textAlign: "right" }}>{boss.name.toUpperCase()}</div>
              <div style={{ height: 10, borderRadius: 6, background: "#262b38", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${health.opponent}%`, marginLeft: `${100 - health.opponent}%`, background: "linear-gradient(90deg, #ff8a8a, var(--loss))", transition: "width .4s ease" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, margin: "10px 0" }}>
            <FighterVisual fighter={fighter} size={90} facing="right" animated state="attack" />
            <FighterVisual fighter={{ character_type: boss.character_type, fighting_style: boss.fighting_style, power_source: boss.power_source }} size={90} facing="left" animated />
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.5, textAlign: "center" }}>{phase.text}</p>
        </div>
        <button className="btn btn-primary" onClick={() => (isLast ? setStep("result") : setPhaseIndex((i) => i + 1))}>
          {isLast ? "See Result" : "Continue"}
        </button>
      </div>
    );
  }

  if (step === "result" && judgment) {
    const dialogue = !judgment.won ? pickBossDialogue(boss, { weakestStat: judgment.biggestOpponentAdvantage || "durability", usedRecommendedCounter: judgment.abilityInteractions.length > 0, margin: judgment.margin / 100 }, judgment.timesLost) : null;

    const aftermathData = adaptStoryResult({ ...judgment, levelFought: pendingRef.current?.level || progress.current_level }, boss, fighter);

    if (saveFailed) {
      return (
        <div className="page">
          <div className="card" style={{ borderColor: "var(--loss)" }}>
            <div style={{ fontSize: 14, color: "var(--loss)", marginBottom: 10 }}>Battle completed, but progress could not be saved.</div>
            {error && <div className="error-box">{error}</div>}
            <button className="btn btn-primary" onClick={handleRetrySave} disabled={saving}>{saving ? "Retrying..." : "Retry Save"}</button>
          </div>
        </div>
      );
    }

    return (
      <ClashAftermath
        data={aftermathData}
        actions={{
          onClaimReward: judgment.won ? () => { clearPendingBattle(`lastStoryResult:${fighterId}`); onNavigate("storyReward", { fighterId, bossKey: boss.key, level: pendingRef.current?.level || progress.current_level, grade: judgment.grade, completionId: judgment.completionId }); } : null,
          onContinueToTraining: !judgment.won ? () => { clearPendingBattle(`lastStoryResult:${fighterId}`); onNavigate("storyTraining", { fighterId }); } : null,
          onViewHistory: () => onNavigate("battleHistory"),
          onReturnHome: () => { clearPendingBattle(`lastStoryResult:${fighterId}`); onNavigate("storyHome", { fighterId }); }
        }}
      >
        {!judgment.won && (
          <div className="card">
            <div className="card-title">{boss.name}</div>
            <p style={{ fontSize: 14, fontStyle: "italic" }}>"{dialogue}"</p>
          </div>
        )}
      </ClashAftermath>
    );
  }

  if (step === "plan") {
    return (
      <div className="page">
        <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
          <button className="back-btn" onClick={() => setStep("intel")}>← Back to Intel</button>
        </div>
        <h2 style={{ color: "var(--gold-bright)", textTransform: "uppercase" }}>How Will You Approach This Fight?</h2>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 12 }}>
          Optional — write a plan for a bonus strategy score, or skip straight to the fight. A vague or impossible plan just won't score well; you can only use what your fighter actually has.
        </div>

        {error && <div className="error-box">{error}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn btn-cyan" style={{ marginBottom: 0, flex: 1 }} onClick={() => handleSubmitPlan(true)}>Go Straight to Battle</button>
          <button className="btn btn-ghost" style={{ marginBottom: 0, flex: 1 }} onClick={() => setShowAbilityManager(true)}>Edit Abilities</button>
        </div>

        <div className="card">
          <div className="card-title">Your Fighter's Actual Kit</div>
          <div style={{ fontSize: 13, lineHeight: 1.7 }}>
            <div>Main Power: <strong style={{ color: "var(--gold-bright)" }}>{fighter.main_power}</strong></div>
            <div>Secondary Power: <strong style={{ color: "var(--gold-bright)" }}>{fighter.secondary_power}</strong></div>
            {fighter.special_skill !== "None" && <div>Special Skill: <strong style={{ color: "var(--gold-bright)" }}>{fighter.special_skill}</strong></div>}
            <div>Ultimate: <strong style={{ color: "var(--gold-bright)" }}>{fighter.ultimate_move}</strong></div>
            {equippedAbilityObjs.length > 0 && <div>Story Abilities: <strong style={{ color: "var(--gold-bright)" }}>{equippedAbilityObjs.map((a) => a.name).join(", ")}</strong></div>}
          </div>
          <div style={{ fontSize: 12, color: "var(--gold)", marginTop: 10 }}>
            💡 Suggestion: mention {fighter.main_power}, how you'll handle {boss.signature_move}, and how you'll use the arena to your advantage.
          </div>
        </div>

        <div className="card">
          <div className="field">
            <label>Full Plan (optional)</label>
            <textarea rows={5} value={planText} onChange={(e) => setPlanText(e.target.value)} placeholder="e.g. I'll open with my main power to test their defense, stay mobile to avoid their signature move, and use the arena's..." />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 10 }}>{planText.trim().length} characters</div>

          <div className="card-title" style={{ marginTop: 6 }}>Or Use Guided Sections</div>
          {[
            ["opener", "Opening move"],
            ["defense", "Defensive approach"],
            ["counter", `How you'll counter ${boss.signature_move}`],
            ["arena", "How you'll use the arena"],
            ["finish", "Finishing strategy"]
          ].map(([key, label]) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <input type="text" value={guided[key]} onChange={(e) => setGuided((g) => ({ ...g, [key]: e.target.value }))} />
            </div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={() => handleSubmitPlan(false)}>Submit Plan &amp; Start Battle</button>
        <button className="btn btn-ghost" onClick={() => handleSubmitPlan(true)}>Go Straight to Battle</button>

        {showAbilityManager && (
          <StoryAbilityManagerModal user={user} fighterId={fighterId} onClose={() => { setShowAbilityManager(false); window.location.reload(); }} />
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("storyHome", { fighterId })}>← Story Home</button>
      </div>

      <h2 style={{ color: "var(--gold-bright)", textTransform: "uppercase" }}>Level {progress.current_level} of {TOTAL_STORY_LEVELS} — Opponent Intel</h2>

      <div className="card card-glow">
        <div className="card-title">{boss.name}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 8 }}>{boss.theme}</div>
        <p style={{ fontSize: 14, fontStyle: "italic", marginBottom: 10 }}>{boss.intro}</p>
        <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
          <FighterVisual fighter={{ character_type: boss.character_type, fighting_style: boss.fighting_style, power_source: boss.power_source }} size={100} animated />
        </div>
        <div style={{ fontSize: 13 }}>Power Source: <strong>{boss.power_source}</strong> · Style: <strong>{boss.fighting_style}</strong></div>
        <div style={{ fontSize: 13 }}>Signature Move: <strong style={{ color: "var(--gold-bright)" }}>{boss.signature_move}</strong></div>
        <div style={{ fontSize: 12.5, color: "var(--gold)", marginTop: 6 }}>Intel: {boss.hints[intelTier]}</div>
        <div className="chip" style={{ marginTop: 8, fontSize: 10 }}>Hidden phase possible — incomplete intelligence</div>
      </div>

      <div className="card">
        <div className="card-title">Matchup Comparison — You vs {boss.name}</div>
        {STAT_KEYS.map((key) => <StatBar key={key} label={STAT_LABELS[key]} mine={effective[key]} theirs={boss.stats[key]} />)}
      </div>

      <EquippedAbilitiesSummary progress={progress} onManage={() => setShowAbilityManager(true)} />

      <button className="btn btn-primary" onClick={() => setStep("plan")}>Submit Battle Plan</button>

      <StoryRunSummary progress={progress} unlockedAbilities={equippedAbilities} />

      {showAbilityManager && (
        <StoryAbilityManagerModal user={user} fighterId={fighterId} onClose={() => { setShowAbilityManager(false); window.location.reload(); }} />
      )}
    </div>
  );
}
