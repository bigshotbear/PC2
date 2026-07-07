import React, { useEffect, useState } from "react";
import { getAbilityByKey } from "../lib/storyBosses";
import { getOrCreateStoryProgress, getUnlockedAbilities, updateStoryProgress } from "../lib/storyService";

const FILTERS = ["All", "Attack", "Defense", "Passive", "Tactical", "Equipped", "Unequipped"];
const TYPE_TO_FILTER = { attack: "Attack", defense: "Defense", passive: "Passive", counter: "Tactical", mobility: "Tactical", buff: "Tactical", debuff: "Tactical", area: "Tactical", ultimate: "Attack" };
const TYPE_COLOR = { attack: "var(--loss)", defense: "var(--blue-bright)", passive: "var(--win)", counter: "var(--purple-bright)", mobility: "var(--cyan-bright)", buff: "var(--gold-bright)", debuff: "var(--purple-bright)", area: "var(--purple-bright)", ultimate: "var(--loss)" };

export default function StoryAbilityManagerModal({ user, fighterId, onClose }) {
  const [progress, setProgress] = useState(null);
  const [unlocked, setUnlocked] = useState([]);
  const [slots, setSlots] = useState(Array(7).fill(null));
  const [filter, setFilter] = useState("All");
  const [activeSlot, setActiveSlot] = useState(null); // slot index being filled, or null
  const [detailsFor, setDetailsFor] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const saveSlots = async (newSlots) => {
    setSlots(newSlots);
    try {
      await updateStoryProgress(progress.id, {
        equipped_ability_1: newSlots[0], equipped_ability_2: newSlots[1], equipped_ability_3: newSlots[2],
        equipped_ability_4: newSlots[3], equipped_ability_5: newSlots[4], equipped_ability_6: newSlots[5], equipped_ability_7: newSlots[6]
      });
    } catch (e) {
      setError("Ability save failed — " + e.message);
      return false;
    }
    return true;
  };

  const handleEquip = async (abilityKey, slotIndexOverride = null) => {
    const targetSlot = slotIndexOverride !== null ? slotIndexOverride : activeSlot;
    if (targetSlot === null) return;
    if (slots.includes(abilityKey)) { setError("That ability is already equipped in another slot."); return; }
    setError("");
    const next = [...slots];
    const wasFilled = !!next[targetSlot];
    next[targetSlot] = abilityKey;
    const ok = await saveSlots(next);
    if (ok) showToast(wasFilled ? "Ability replaced" : "Ability equipped");
    setActiveSlot(null);
  };

  const handleRemove = async (slotIndex) => {
    const next = [...slots];
    next[slotIndex] = null;
    const ok = await saveSlots(next);
    if (ok) showToast("Ability removed");
  };

  if (loading) {
    return (
      <div className="pc-modal-overlay">
        <div className="pc-modal-sheet"><div className="spinner" /></div>
      </div>
    );
  }

  const filteredUnlocked = unlocked.filter((u) => {
    const ability = getAbilityByKey(u.ability_key);
    if (!ability) return false;
    const isEquipped = slots.includes(u.ability_key);
    if (filter === "Equipped") return isEquipped;
    if (filter === "Unequipped") return !isEquipped;
    if (filter === "All") return true;
    return TYPE_TO_FILTER[ability.type] === filter;
  });

  return (
    <div className="pc-modal-overlay" onClick={onClose}>
      <div className="pc-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="card-title" style={{ fontSize: 15, color: "var(--purple-bright)", margin: 0 }}>Equip or Change Abilities</div>
          <button className="back-btn" onClick={onClose}>✕ Close</button>
        </div>

        {toast && <div className="success-box" style={{ marginBottom: 10 }}>{toast}</div>}
        {error && <div className="error-box">{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
          {slots.map((key, i) => {
            const ability = key ? getAbilityByKey(key) : null;
            const isActive = activeSlot === i;
            return (
              <button
                key={i}
                className={`card ${isActive ? "pc-selected" : ability ? "card-purple" : ""}`}
                style={{ padding: 8, margin: 0, minHeight: 64, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: "pointer" }}
                onClick={() => (ability ? setDetailsFor({ ability, slotIndex: i }) : setActiveSlot(isActive ? null : i))}
              >
                <div style={{ fontSize: 9, color: "var(--text-dim)" }}>SLOT {i + 1}</div>
                {ability ? (
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--gold-bright)", textAlign: "center", lineHeight: 1.2 }}>{ability.name}</div>
                ) : (
                  <div style={{ fontSize: 18, color: isActive ? "var(--gold-bright)" : "var(--text-dim)" }}>+</div>
                )}
              </button>
            );
          })}
        </div>

        {detailsFor && (
          <div className="card card-glow" style={{ marginBottom: 14 }}>
            <div className="card-title">{detailsFor.ability.name} — Slot {detailsFor.slotIndex + 1}</div>
            <div style={{ fontSize: 13, marginBottom: 10 }}>{detailsFor.ability.desc}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" style={{ marginBottom: 0, flex: 1 }} onClick={() => { setActiveSlot(detailsFor.slotIndex); setDetailsFor(null); }}>Replace</button>
              <button className="btn btn-danger" style={{ marginBottom: 0, flex: 1 }} onClick={() => { handleRemove(detailsFor.slotIndex); setDetailsFor(null); }}>Remove</button>
            </div>
            <button className="btn btn-ghost" onClick={() => setDetailsFor(null)}>Close Details</button>
          </div>
        )}

        {activeSlot !== null && (
          <div style={{ fontSize: 12, color: "var(--gold)", marginBottom: 10 }}>
            Filling Slot {activeSlot + 1} — tap an ability below.
            <button className="btn btn-ghost" style={{ marginTop: 6 }} onClick={() => setActiveSlot(null)}>Cancel</button>
          </div>
        )}

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {FILTERS.map((f) => (
            <button key={f} className="chip" style={{ cursor: "pointer", background: filter === f ? "rgba(160,107,255,0.2)" : "transparent", borderColor: filter === f ? "var(--purple)" : "var(--line)" }} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {filteredUnlocked.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>No abilities match this filter yet.</div>
        ) : (
          filteredUnlocked.map((u) => {
            const ability = getAbilityByKey(u.ability_key);
            const isEquipped = slots.includes(u.ability_key);
            return (
              <div key={u.id} className={`card ${isEquipped ? "card-success" : ""}`} style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ color: TYPE_COLOR[ability.type] || "var(--gold-bright)" }}>{ability.name}</strong>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{TYPE_TO_FILTER[ability.type] || "Tactical"} · Lvl {u.upgrade_level}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", margin: "4px 0 8px" }}>{ability.desc}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {isEquipped ? (
                    <span className="chip" style={{ borderColor: "var(--win)", color: "var(--win)" }}>Equipped</span>
                  ) : (
                    <button
                      className={`btn ${activeSlot !== null ? "btn-primary" : ""}`}
                      style={{ marginBottom: 0 }}
                      onClick={() => handleEquip(u.ability_key, activeSlot !== null ? activeSlot : slots.findIndex((s) => !s))}
                      disabled={activeSlot === null && !slots.includes(null)}
                    >
                      {activeSlot !== null ? `Equip to Slot ${activeSlot + 1}` : slots.includes(null) ? "Equip to Open Slot" : "All Slots Full"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
