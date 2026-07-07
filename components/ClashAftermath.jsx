import React, { useState } from "react";
import FighterVisual from "./FighterVisual.jsx";
import { buildNarration } from "../lib/battleNarration";
import ShareBattleCard from "./ShareBattleCard.jsx";

const BUCKET_LABELS = { damage: "Offensive Impact", defense: "Defense", support: "Stamina/Support", tactics: "Battle IQ/Tactics", badges: "Ability Impact" };
const BUCKET_COLORS = { damage: "#ff7a5c", defense: "#5ca8ff", support: "#4ade80", tactics: "#c084fc", badges: "#e6b84a" };

function MiniPortraitRow({ fighters, align, state }) {
  if (!fighters || fighters.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: align === "left" ? "flex-start" : "flex-end", flexWrap: "wrap" }}>
      {fighters.slice(0, 5).map((f, i) => (
        <div key={i} style={{ width: fighters.length > 1 ? 44 : 84, height: fighters.length > 1 ? 44 : 84 }}>
          <FighterVisual fighter={f} size={fighters.length > 1 ? 42 : 82} animated state={state} />
        </div>
      ))}
    </div>
  );
}

export default function ClashAftermath({ data, actions = {}, reducedMotion, children }) {
  const [showShare, setShowShare] = useState(false);
  const narration = buildNarration(data);
  const respectMotion = reducedMotion || (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  const winnerFighters = data.won ? data.myFighters : data.opponentFighters;
  const loserFighters = data.won ? data.opponentFighters : data.myFighters;

  const badgeCount = data.won ? (data.totalRibbons != null ? "+1 Ribbon" : null) : null;

  return (
    <div className="page">
      {/* ============ 1. CINEMATIC RESULT HEADER ============ */}
      <div className={`card ${data.won ? "card-success" : "card-danger"} pc-aftermath-header`} style={{ textAlign: "center", overflow: "hidden", position: "relative" }}>
        {!respectMotion && <div className="pc-impact-lines" />}
        {!respectMotion && <div className="pc-particles" />}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "0.06em", color: data.won ? "var(--win)" : "var(--loss)" }}>
            {data.won ? "VICTORY" : "DEFEAT"}
          </div>
          <div style={{ fontSize: 15, fontStyle: "italic", color: "var(--gold-bright)", margin: "8px 0" }}>"{narration.headline}"</div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0" }}>
            <div style={{ flex: 1 }}>
              <div className={`pc-winner-spotlight ${!respectMotion ? "pc-pulse" : ""}`} style={{ display: "inline-block" }}>
                <MiniPortraitRow fighters={winnerFighters} align="left" state={respectMotion ? "idle" : "victory"} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>WINNER</div>
            </div>
            <div style={{ fontSize: 20, color: "var(--text-dim)", padding: "0 10px" }}>VS</div>
            <div style={{ flex: 1 }}>
              <MiniPortraitRow fighters={loserFighters} align="right" state="defeat" />
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>DEFEATED</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ 2. BATTLE SUMMARY ============ */}
      <div className="card card-panel">
        <div className="card-title">Battle Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
          <div>Mode: <strong>{data.battleMode} · {data.battleType}</strong></div>
          <div>Score: <strong>{Math.round(data.myScore)} — {Math.round(data.opponentScore)}</strong></div>
          <div>Winner: <strong style={{ color: "var(--win)" }}>{data.winnerName}</strong></div>
          <div>Defeated: <strong style={{ color: "var(--loss)" }}>{data.loserName}</strong></div>
          {data.grade && <div>Grade: <strong style={{ color: "var(--gold-bright)" }}>{data.grade}</strong></div>}
          {badgeCount && <div>Reward: <strong style={{ color: "var(--gold-bright)" }}>{badgeCount}</strong></div>}
          {data.arenaName && <div>Arena: <strong>{data.arenaName}</strong></div>}
          {data.mvpName && <div>MVP: <strong style={{ color: "var(--purple-bright)" }}>{data.mvpName}</strong></div>}
          {data.mode === "story" && (
            <>
              <div>Boss: <strong>{data.story.bossName}</strong></div>
              <div>Level: <strong>{data.story.level}</strong></div>
            </>
          )}
        </div>
      </div>

      {/* ============ 3. DYNAMIC BATTLE NARRATION ============ */}
      <div className="card card-cyan">
        <div className="card-title">Battle Recap</div>
        <p style={{ fontSize: 13.5, lineHeight: 1.7, marginBottom: 8 }}>{narration.opening}</p>
        <p style={{ fontSize: 13.5, lineHeight: 1.7, marginBottom: 8 }}>{narration.momentum}</p>
        {narration.tactical && <p style={{ fontSize: 13.5, lineHeight: 1.7, marginBottom: 8, color: "var(--purple-bright)" }}>{narration.tactical}</p>}
        <p style={{ fontSize: 13.5, lineHeight: 1.7, marginBottom: 8, color: "var(--gold)" }}>Turning point: {narration.turningPoint}</p>
        <p style={{ fontSize: 13.5, lineHeight: 1.7, marginBottom: 8, fontWeight: 700 }}>{narration.finish}</p>
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--text-dim)" }}>{narration.aftermath}</p>
      </div>

      {/* ============ 4. PERFORMANCE BREAKDOWN ============ */}
      <div className="card card-blue">
        <div className="card-title">Performance Breakdown</div>
        {data.breakdown ? (
          Object.entries(BUCKET_LABELS).map(([key, label]) => {
            const val = Math.max(0, data.breakdown[key] || 0);
            const total = Object.values(data.breakdown).reduce((s, v) => s + Math.max(0, v || 0), 0) || 1;
            const pct = Math.round((val / total) * 100);
            return (
              <div key={key} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span>{label}</span><span>{pct}%</span>
                </div>
                <div style={{ height: 8, background: "#262b38", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: BUCKET_COLORS[key] }} />
                </div>
              </div>
            );
          })
        ) : data.mode === "story" ? (
          <>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Strategy Score: <strong style={{ color: "var(--gold-bright)" }}>{data.story.strategyScore ?? "—"}/100</strong></div>
            {data.story.strategyStrengths?.length > 0 && (
              <div style={{ fontSize: 12.5, color: "var(--win)", marginBottom: 4 }}>Worked: {data.story.strategyStrengths.join(", ")}</div>
            )}
            {data.story.strategyHoles?.length > 0 && (
              <div style={{ fontSize: 12.5, color: "var(--loss)" }}>To improve: {data.story.strategyHoles.join(", ")}</div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>No detailed breakdown available for this fight.</div>
        )}
      </div>

      {/* ============ 5. STORY-SPECIFIC AFTERMATH ============ */}
      {data.mode === "story" && (
        <div className="card card-purple">
          <div className="card-title">Story Aftermath</div>
          <div style={{ fontSize: 13, marginBottom: 6 }}>Boss health reached: <strong>{data.story.bossLowestHealthPct}%</strong></div>
          {data.story.intelGained && <div style={{ fontSize: 13, marginBottom: 6, color: "var(--cyan-bright)" }}>New intel gained on {data.story.bossName}.</div>}
          {data.story.masteryGained && <div style={{ fontSize: 13, marginBottom: 6, color: "var(--cyan-bright)" }}>Pattern mastery increased.</div>}
          {data.story.defeatCause && <div style={{ fontSize: 13, color: "var(--loss)" }}>Defeated by: {data.story.defeatCause}</div>}
          {data.story.plainSummary && <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>{data.story.plainSummary}</div>}
        </div>
      )}

      {children}

      {/* ============ 6. ACTIONS ============ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
        {data.mode === "story" && data.won && actions.onClaimReward && (
          <button className="btn btn-primary" onClick={actions.onClaimReward}>Continue to Reward</button>
        )}
        {data.mode === "story" && !data.won && actions.onContinueToTraining && (
          <button className="btn btn-primary" onClick={actions.onContinueToTraining}>Continue to Training</button>
        )}
        {data.mode === "story" && !data.won && actions.onRetryLevel && (
          <button className="btn btn-primary" onClick={actions.onRetryLevel}>Retry This Level</button>
        )}
        {data.mode === "story" && !data.won && actions.onTrainAndReturn && (
          <button className="btn btn-cyan" onClick={actions.onTrainAndReturn}>Train and Return Later</button>
        )}
        {data.mode === "normal" && actions.onFightAgain && (
          <button className="btn btn-primary" onClick={actions.onFightAgain}>Fight Again</button>
        )}
        {actions.onShare !== false && (
          <button className="btn btn-purple" onClick={() => setShowShare(true)}>Share Battle Story</button>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {actions.onViewHistory && <button className="btn btn-ghost" style={{ flex: 1 }} onClick={actions.onViewHistory}>Battle History</button>}
          {actions.onReturnHome && <button className="btn btn-ghost" style={{ flex: 1 }} onClick={actions.onReturnHome}>Return Home</button>}
        </div>
      </div>

      {showShare && <ShareBattleCard data={data} narration={narration} onClose={() => setShowShare(false)} />}
    </div>
  );
}
