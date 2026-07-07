import React from "react";
import { getAbilityByKey } from "../lib/storyBosses";

export default function EquippedAbilitiesSummary({ progress, onManage }) {
  const slots = [
    progress.equipped_ability_1, progress.equipped_ability_2, progress.equipped_ability_3,
    progress.equipped_ability_4, progress.equipped_ability_5, progress.equipped_ability_6, progress.equipped_ability_7
  ];
  const filledCount = slots.filter(Boolean).length;

  return (
    <div className="card card-purple">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div className="card-title" style={{ margin: 0 }}>Equipped Story Abilities ({filledCount}/7)</div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {slots.map((key, i) => {
          const ability = key ? getAbilityByKey(key) : null;
          return (
            <div key={i} className="chip" style={{ borderColor: ability ? "var(--purple)" : "var(--line)", color: ability ? "var(--purple-bright)" : "var(--text-dim)", fontSize: 10.5 }}>
              {ability ? ability.name : `Slot ${i + 1} empty`}
            </div>
          );
        })}
      </div>
      <button className="btn btn-purple" style={{ marginBottom: 0 }} onClick={onManage}>
        Equip or Change Abilities
      </button>
    </div>
  );
}
