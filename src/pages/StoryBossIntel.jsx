import React, { useEffect, useState } from "react";
import { STORY_BOSSES } from "../lib/storyBosses";
import { getAllBossProgress } from "../lib/storyService";

export default function StoryBossIntel({ user, fighterId, onNavigate }) {
  const [progressByBoss, setProgressByBoss] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const rows = await getAllBossProgress(user.id, fighterId);
      const map = {};
      rows.forEach((r) => { map[r.boss_key] = r; });
      setProgressByBoss(map);
      setLoading(false);
    })();
  }, [user.id, fighterId]);

  if (loading) return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("storyHome", { fighterId })}>← Story Home</button>
      </div>
      <h2 style={{ color: "var(--gold-bright)", textTransform: "uppercase", marginBottom: 14 }}>Boss Intel</h2>

      {STORY_BOSSES.map((boss) => {
        const bp = progressByBoss[boss.key];
        const intelTier = bp?.intel_level >= 3 ? 3 : bp?.intel_level >= 1 ? 1 : 0;
        return (
          <div className="card" key={boss.key}>
            <div className="card-title">Level {boss.level} — {boss.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 6 }}>{boss.theme}</div>
            <p style={{ fontSize: 13.5, marginBottom: 6 }}>{boss.hints[intelTier]}</p>
            {bp && (
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                Fought {bp.times_fought} · Defeated {bp.times_defeated} · Lost {bp.times_lost}
                {bp.best_victory_grade && <> · Best Grade: <strong style={{ color: "var(--gold-bright)" }}>{bp.best_victory_grade}</strong></>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
