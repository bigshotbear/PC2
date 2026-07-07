import React, { useState } from "react";
import { getAbilityByKey, TOTAL_STORY_LEVELS } from "../lib/storyBosses";
import { updateStoryProgress } from "../lib/storyService";

export default function StoryRunSummary({ progress, unlockedAbilities = [], onReset }) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  const equipped = [progress.equipped_ability_1, progress.equipped_ability_2, progress.equipped_ability_3, progress.equipped_ability_4, progress.equipped_ability_5, progress.equipped_ability_6, progress.equipped_ability_7]
    .filter(Boolean).map((k) => getAbilityByKey(k)?.name).filter(Boolean);

  const totalBonus = (progress.strength_bonus || 0) + (progress.speed_bonus || 0) + (progress.durability_bonus || 0) + (progress.battle_iq_bonus || 0) + (progress.stamina_bonus || 0);

  const handleReset = async () => {
    await updateStoryProgress(progress.id, { run_status: "idle", current_level: 1, wins_this_run: 0, losses_this_run: 0, completed_bosses: [] });
    setConfirmingReset(false);
    if (onReset) onReset();
  };

  return (
    <div className="card">
      <div className="card-title">Story Run Progress</div>
      <div style={{ fontSize: 13, marginBottom: 4 }}>Level {progress.current_level} of {TOTAL_STORY_LEVELS}</div>
      <div style={{ fontSize: 13, marginBottom: 4 }}>This run: <span style={{ color: "var(--win)" }}>{progress.wins_this_run || 0}W</span> / <span style={{ color: "var(--loss)" }}>{progress.losses_this_run || 0}L</span></div>
      <div style={{ fontSize: 13, marginBottom: 4 }}>Total Story stat bonus: <strong style={{ color: "var(--gold-bright)" }}>+{totalBonus}</strong> <span style={{ color: "var(--text-dim)" }}>(Story Run Upgrade — never affects normal battles)</span></div>
      <div style={{ fontSize: 13, marginBottom: 4 }}>Abilities gained: {unlockedAbilities.length}{equipped.length > 0 ? ` (equipped: ${equipped.join(", ")})` : ""}</div>
      {progress.completed_bosses?.length > 0 && (
        <div style={{ fontSize: 13, marginBottom: 4 }}>Defeated this run: {progress.completed_bosses.length}/7</div>
      )}

      {progress.run_status === "active" && (
        confirmingReset ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, color: "var(--loss)", marginBottom: 6 }}>Reset this run back to Level 1? Permanent upgrades and abilities stay.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-danger" style={{ marginBottom: 0, width: "auto", padding: "8px 14px" }} onClick={handleReset}>Confirm Reset</button>
              <button className="btn btn-ghost" style={{ marginBottom: 0, width: "auto", padding: "8px 14px" }} onClick={() => setConfirmingReset(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-ghost" style={{ marginTop: 6 }} onClick={() => setConfirmingReset(true)}>Reset Run</button>
        )
      )}
    </div>
  );
}
