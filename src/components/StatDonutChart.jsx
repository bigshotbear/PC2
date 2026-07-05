import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { detectArchetype } from "../lib/archetypeDetector";

const COLORS = { strength: "#ff7a5c", speed: "#5ca8ff", durability: "#4ade80", battle_iq: "#c084fc", stamina: "#e6b84a" };
const LABELS = { strength: "Strength", speed: "Speed", durability: "Durability", battle_iq: "Battle IQ", stamina: "Stamina" };
const AFFECTS = {
  strength: "Physical damage, heavy attacks, and force-based abilities.",
  speed: "Turn order, evasion, and how quickly you can act.",
  durability: "How much damage you can absorb before going down.",
  battle_iq: "Adaptability, arena awareness, and countering opponents.",
  stamina: "Sustained output and Tank/Defender damage mitigation."
};

export default function StatDonutChart({ stats }) {
  const [selected, setSelected] = useState(null);
  const total = Object.values(stats).reduce((s, v) => s + v, 0);
  const data = Object.keys(LABELS).map((key) => ({ key, name: LABELS[key], value: stats[key] }));
  const archetype = detectArchetype(stats);

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const strongest = sorted.slice(0, 2).map((d) => d.name).join(" and ");
  const weakest = sorted[sorted.length - 1];

  return (
    <div className="card">
      <div className="card-title">Build Archetype</div>
      <div style={{ position: "relative", height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={2} onClick={(d) => setSelected(d.key)}>
              {data.map((d) => <Cell key={d.key} fill={COLORS[d.key]} cursor="pointer" opacity={selected && selected !== d.key ? 0.4 : 1} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v} pts`, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold-bright)", textAlign: "center", padding: "0 10px" }}>{archetype.toUpperCase()}</div>
          <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{total}/100</div>
        </div>
      </div>

      {selected && (
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 8, textAlign: "center" }}>
          <strong style={{ color: COLORS[selected] }}>{LABELS[selected]}:</strong> {AFFECTS[selected]}
        </div>
      )}

      <div style={{ fontSize: 12.5, marginTop: 10 }}>
        <div>Strongest areas: <strong style={{ color: "var(--win)" }}>{strongest}</strong></div>
        {weakest.value < 15 && <div style={{ marginTop: 2 }}>Possible concern: <strong style={{ color: "var(--loss)" }}>Low {weakest.name}</strong></div>}
      </div>
    </div>
  );
}
