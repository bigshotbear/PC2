import React, { useEffect, useState } from "react";
import { STORY_BOSSES } from "../lib/storyBosses";
import { getAllBossProgress } from "../lib/storyService";
import FighterVisual from "../components/FighterVisual.jsx";
import EquippedAbilitiesSummary from "../components/EquippedAbilitiesSummary.jsx";
import StoryAbilityManagerModal from "../components/StoryAbilityManagerModal.jsx";
import { getOrCreateStoryProgress } from "../lib/storyService";

export default function StoryBossIntel({ user, fighterId, onNavigate }) {
  const [progressByBoss, setProgressByBoss] = useState({});
  const [progress, setProgress] = useState(null);
  const [showAbilityManager, setShowAbilityManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const rows = await getAllBossProgress(user.id, fighterId);
      const map = {};
      rows.forEach((r) => { map[r.boss_key] = r; });
      setProgressByBoss(map);
      setProgress(await getOrCreateStoryProgress(user.id, fighterId));
      setLoading(false);
    })();
  }, [user.id, fighterId]);

  if (loading) return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("storyHome", { fighterId })}>← Story Home</button>
      </div>

      <div className="hero-header" style={{ padding: "18px 16px", marginBottom: 16 }}>
        <div className="hero-name" style={{ fontSize: 22 }}>Boss Intel</div>
        <div style={{ color: "var(--purple-bright)", fontSize: 12.5, position: "relative" }}>Everything you've learned about every threat.</div>
      </div>

      {progress && <EquippedAbilitiesSummary progress={progress} onManage={() => setShowAbilityManager(true)} />}

      {STORY_BOSSES.map((boss) => {
        const bp = progressByBoss[boss.key];
        const intelTier = bp?.intel_level >= 3 ? 3 : bp?.intel_level >= 1 ? 1 : 0;
        const isFinale = boss.level === STORY_BOSSES.length;
        const defeated = (bp?.times_defeated || 0) > 0;
        return (
          <div className={`card card-panel ${isFinale ? "danger" : "purple"}`} key={boss.key} style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 56, height: 56, flexShrink: 0 }}>
              <FighterVisual fighter={{ character_type: boss.character_type, fighting_style: boss.fighting_style, power_source: boss.power_source }} size={54} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase" }}>Level {boss.level}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: isFinale ? "var(--loss)" : "var(--purple-bright)" }}>{boss.name}</div>
                </div>
                {defeated && <span className="chip" style={{ borderColor: "var(--win)", color: "var(--win)", fontSize: 10 }}>DEFEATED</span>}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)", margin: "4px 0 6px" }}>{boss.theme}</div>
              <p style={{ fontSize: 13, marginBottom: 6 }}>{boss.hints[intelTier]}</p>
              {bp && (
                <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
                  Fought {bp.times_fought} · Defeated {bp.times_defeated} · Lost {bp.times_lost}
                  {bp.best_victory_grade && <> · Best Grade: <strong style={{ color: "var(--gold-bright)" }}>{bp.best_victory_grade}</strong></>}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {showAbilityManager && (
        <StoryAbilityManagerModal user={user} fighterId={fighterId} onClose={() => { setShowAbilityManager(false); window.location.reload(); }} />
      )}
    </div>
  );
}
