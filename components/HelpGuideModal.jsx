import React, { useState } from "react";
import { CHARACTER_TYPE_INFO, FIGHTING_STYLE_INFO, POWER_SOURCE_INFO } from "../lib/fighterMeta";

const GLOSSARY = [
  { term: "Synergy", body: "Choices that work especially well together — like two fighters sharing a power source, or a Strategist paired with a Brawler." },
  { term: "Counter", body: "A power source or ability that is especially effective against another. Fire counters Ice, Water counters Fire, and so on." },
  { term: "Power Budget", body: "The total number of points available for your Main Power, Secondary Power, Special Skill, and Ultimate. It changes based on 1v1 (10), 2v2 (9), 3v3 (8), or 5v5 (7)." },
  { term: "Battle IQ", body: "One of your five stats. It's weighted slightly higher in battle scoring because smart fighters adapt mid-fight." },
  { term: "Passive Badge", body: "A badge that improves efficiency or consistency rather than raw offense or defense." },
  { term: "Tactical Badge", body: "A badge focused on arena adaptation, counters, and team coordination." },
  { term: "Arena", body: "The battlefield for a fight, randomly chosen. Some arenas boost or penalize specific power sources." },
  { term: "Battle Twist", body: "A random modifier that changes the flavor of a fight — like fog rewarding Battle IQ, or an energy drain making Stamina matter more." }
];

export default function HelpGuideModal({ onClose }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();

  const glossaryMatches = GLOSSARY.filter((g) => !q || g.term.toLowerCase().includes(q) || g.body.toLowerCase().includes(q));
  const typeMatches = Object.entries(CHARACTER_TYPE_INFO).filter(([k]) => !q || k.toLowerCase().includes(q));
  const styleMatches = Object.entries(FIGHTING_STYLE_INFO).filter(([k]) => !q || k.toLowerCase().includes(q));
  const sourceMatches = Object.entries(POWER_SOURCE_INFO).filter(([k]) => !q || k.toLowerCase().includes(q));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(9,11,16,0.92)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div className="card card-glow" style={{ maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto", marginBottom: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="card-title" style={{ fontSize: 16 }}>Full Game Guide</div>
        <input className="search-bar" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search terms, types, styles, power sources..." />

        {glossaryMatches.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div className="card-title" style={{ fontSize: 12 }}>Glossary</div>
            {glossaryMatches.map((g) => (
              <div key={g.term} style={{ marginBottom: 8, fontSize: 13 }}>
                <strong style={{ color: "var(--gold-bright)" }}>{g.term}:</strong> {g.body}
              </div>
            ))}
          </div>
        )}

        {typeMatches.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div className="card-title" style={{ fontSize: 12 }}>Character Types</div>
            {typeMatches.map(([name, info]) => (
              <div key={name} style={{ marginBottom: 6, fontSize: 13 }}><strong>{name}:</strong> {info.blurb} {info.perk}</div>
            ))}
          </div>
        )}

        {styleMatches.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div className="card-title" style={{ fontSize: 12 }}>Fighting Styles</div>
            {styleMatches.map(([name, info]) => (
              <div key={name} style={{ marginBottom: 6, fontSize: 13 }}><strong>{name}:</strong> Pro: {info.pro} Con: {info.con}</div>
            ))}
          </div>
        )}

        {sourceMatches.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div className="card-title" style={{ fontSize: 12 }}>Power Sources</div>
            {sourceMatches.map(([name, body]) => (
              <div key={name} style={{ marginBottom: 6, fontSize: 13 }}><strong>{name}:</strong> {body}</div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
          Power point cap — a universal 10 points, the same for every battle size (1v1, 2v2, 3v3, 5v5). Your fighter works unchanged in any mode.
        </div>

        <button className="btn btn-primary" onClick={onClose}>Close Guide</button>
      </div>
    </div>
  );
}
