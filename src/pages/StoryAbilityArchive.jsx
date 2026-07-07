import React, { useEffect, useState } from "react";
import { getAbilityByKey, ALL_STORY_ABILITIES } from "../lib/storyBosses";
import { getOrCreateStoryProgress, getUnlockedAbilities, updateStoryProgress } from "../lib/storyService";

export default function StoryAbilityArchive({ user, fighterId, onNavigate }) {
  const [progress, setProgress] = useState(null);
  const [unlocked, setUnlocked] = useState([]);
  const [slots, setSlots] = useState([null, null, null, null, null, null, null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const p = await getOrCreateStoryProgress(user.id, fighterId);
      setProgress(p);
      setSlots([p.equipped_ability_1, p.equipped_ability_2, p.equipped_ability_3, p.equipped_ability_4, p.equipped_ability_5, p.equipped_ability_6, p.equipped_ability_7]);
      const u = await getUnlockedAbilities(user.id, fighterId);
      setUnlocked(u);
      setLoading(false);
    })();
  }, [user.id, fighterId]);

  const toggleEquip = (abilityKey) => {
    setError("");
    const isEquipped = slots.includes(abilityKey);
    if (isEquipped) {
      setSlots(slots.map((s) => (s === abilityKey ? null : s)));
      return;
    }
    const emptyIndex = slots.findIndex((s) => !s);
    if (emptyIndex === -1) { setError("All 7 slots full — unequip one first."); return; }
    const next = [...slots];
    next[emptyIndex] = abilityKey;
    setSlots(next);
  };

  const handleSave = async () => {
    await updateStoryProgress(progress.id, {
      equipped_ability_1: slots[0], equipped_ability_2: slots[1], equipped_ability_3: slots[2],
      equipped_ability_4: slots[3], equipped_ability_5: slots[4], equipped_ability_6: slots[5], equipped_ability_7: slots[6]
    });
    onNavigate("storyHome", { fighterId });
  };

  if (loading) return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("storyHome", { fighterId })}>← Story Home</button>
      </div>
      <h2 style={{ color: "var(--gold-bright)", textTransform: "uppercase" }}>Ability Archive</h2>

      {error && <div className="error-box">{error}</div>}

      <div className="card card-glow">
        <div className="card-title">Equipped Slots</div>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const ability = slots[i] ? getAbilityByKey(slots[i]) : null;
          return (
            <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>
              Slot {i + 1}: {ability ? <strong style={{ color: "var(--gold-bright)" }}>{ability.name}</strong> : <span style={{ color: "var(--text-dim)" }}>Empty</span>}
            </div>
          );
        })}
      </div>

      {unlocked.length === 0 ? (
        <div className="empty-state"><div className="display">No abilities unlocked yet</div><p>Defeat a boss and choose "Take an Ability" to start your archive.</p></div>
      ) : (
        unlocked.map((u) => {
          const ability = getAbilityByKey(u.ability_key);
          const isEquipped = slots.includes(u.ability_key);
          return (
            <div key={u.id} className="card" style={{ border: isEquipped ? "1px solid var(--gold)" : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ color: "var(--gold-bright)" }}>{ability?.name}</strong>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Lvl {u.upgrade_level}/3</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 6 }}>{ability?.desc}</div>
              <div style={{ fontSize: 11, color: "var(--gold)", marginBottom: 6 }}>
                {u.upgrade_level < 3 ? `Next level: stronger effect and improved visual.` : "Max level reached."}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>From: {ability?.source_boss_name}</div>
              <button className={`btn ${isEquipped ? "btn-danger" : "btn-primary"}`} style={{ marginBottom: 0 }} onClick={() => toggleEquip(u.ability_key)}>
                {isEquipped ? "Unequip" : "Equip"}
              </button>
            </div>
          );
        })
      )}

      <div className="card">
        <div className="card-title">Locked Abilities</div>
        {ALL_STORY_ABILITIES.filter((a) => !unlocked.some((u) => u.ability_key === a.key)).map((a) => (
          <div key={a.key} style={{ fontSize: 13, marginBottom: 6, color: "var(--text-dim)" }}>
            🔒 <strong>{a.name}</strong> — defeat {a.source_boss_name} and choose "Take an Ability" to unlock.
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={handleSave}>Save &amp; Return</button>
    </div>
  );
}
