import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { calculateFighterBadges } from "../lib/badgeEngine";
import { generateFightAnalystReport } from "../lib/fightAnalyst";
import { executeBattle, executeGauntletBattle } from "../lib/battleService";
import BadgeLoadoutSelector from "../components/BadgeLoadoutSelector.jsx";

const LEVEL_COLORS = { Bronze: "#c17a4a", Silver: "#b7bfc9", Gold: "var(--gold-bright)" };
const BUCKET_COLORS = { damage: "#ff7a5c", defense: "#5ca8ff", support: "#4ade80", tactics: "#c084fc", badges: "#e6b84a" };
const BUCKET_LABELS = { damage: "Damage", defense: "Defense & Blocking", support: "Support & Healing", tactics: "Tactical Actions", badges: "Badge Effects" };

function BadgePill({ badge, fighterName }) {
  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong style={{ color: LEVEL_COLORS[badge.level] }}>
          {badge.level === "Gold" ? "🥇" : badge.level === "Silver" ? "🥈" : "🥉"} {badge.name}
        </strong>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{badge.level}</span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 4 }}>
        Equipped by: {fighterName} — {badge.description}
      </div>
    </div>
  );
}

export default function BattleResult({ user, profile, battleResult, iWon, totalRibbons, rematchConfig, onNavigate }) {
  const r = battleResult;
  const [showLedger, setShowLedger] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showFullBadges, setShowFullBadges] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [copied, setCopied] = useState(false);
  const [rematching, setRematching] = useState(false);
  const [changingBadges, setChangingBadges] = useState(false);
  const [rematchBadgeSelections, setRematchBadgeSelections] = useState({});

  const myBreakdown = iWon ? r.impact_breakdown_a : r.impact_breakdown_b;
  const myContributions = iWon ? r.fighter_contributions_a : r.fighter_contributions_b;
  const myActiveBadges = iWon ? r.active_badges_a : r.active_badges_b;
  const myLedger = iWon ? r.score_ledger_a : r.score_ledger_b;
  const myScore = iWon ? r.player_a_score : r.player_b_score;

  const donutData = myBreakdown
    ? Object.keys(BUCKET_LABELS).map((key) => ({ key, name: BUCKET_LABELS[key], value: Math.max(0, myBreakdown[key] || 0) }))
    : [];
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

  const analyst = generateFightAnalystReport(r, iWon);

  const handleCopyFightCode = async () => {
    try { await navigator.clipboard.writeText(r.fight_code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt("Copy this Fight Code:", r.fight_code); }
  };

  const handleShare = async () => {
    const text = `${r.winner_name.toUpperCase()} WON\n${r.player_a_score} — ${r.player_b_score}\nMVP: ${r.mvp_fighter_name}\nVictory Ribbons: ${totalRibbons ?? "—"}\nFight Code: ${r.fight_code}\n\nThink your fighters can beat this build?`;
    if (navigator.share) {
      try { await navigator.share({ title: "Power Clash Fight Code", text }); return; } catch { /* cancelled */ }
    }
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  const handleRematch = async () => {
    if (!rematchConfig) { onNavigate("chooseMode"); return; }
    setRematching(true);
    try {
      const executor = rematchConfig.format === "gauntlet"
        ? executeGauntletBattle({ user, profile, myLineup: rematchConfig.myLineup, opponentLineup: rematchConfig.opponentLineup, battleMode: rematchConfig.battleMode, battleType: rematchConfig.battleType, opponentUserId: rematchConfig.opponentUserId, lineupVisibility: rematchConfig.lineupVisibility })
        : executeBattle({ user, profile, myTeam: rematchConfig.myTeam, opponentTeam: rematchConfig.opponentTeam, battleMode: rematchConfig.battleMode, battleType: rematchConfig.battleType, opponentUserId: rematchConfig.opponentUserId });
      const { result, iWon: won, totalRibbons: newTotal } = await executor;
      onNavigate("pixelBattleAnimation", { battleResult: result, iWon: won, totalRibbons: newTotal, rematchConfig });
    } catch (e) {
      setRematching(false);
    }
  };

  const handleRematchWithNewBadges = async () => {
    if (!rematchConfig) return;
    setRematching(true);
    try {
      if (rematchConfig.format === "gauntlet") {
        const updatedLineup = rematchConfig.myLineup.map((f) => ({ ...f, active_badges: rematchBadgeSelections[f.id] || f.active_badges || [] }));
        const updatedConfig = { ...rematchConfig, myLineup: updatedLineup };
        const { result, iWon: won, totalRibbons: newTotal } = await executeGauntletBattle({ user, profile, myLineup: updatedLineup, opponentLineup: updatedConfig.opponentLineup, battleMode: updatedConfig.battleMode, battleType: updatedConfig.battleType, opponentUserId: updatedConfig.opponentUserId, lineupVisibility: updatedConfig.lineupVisibility });
        onNavigate("pixelBattleAnimation", { battleResult: result, iWon: won, totalRibbons: newTotal, rematchConfig: updatedConfig });
        return;
      }
      const updatedFighters = rematchConfig.myTeam.fighter_snapshots.map((f) => ({
        ...f, active_badges: rematchBadgeSelections[f.id] || f.active_badges || []
      }));
      const updatedConfig = { ...rematchConfig, myTeam: { ...rematchConfig.myTeam, fighter_snapshots: updatedFighters } };
      const { result, iWon: won, totalRibbons: newTotal } = await executeBattle({ user, profile, myTeam: updatedConfig.myTeam, opponentTeam: updatedConfig.opponentTeam, battleMode: updatedConfig.battleMode, battleType: updatedConfig.battleType, opponentUserId: updatedConfig.opponentUserId });
      onNavigate("pixelBattleAnimation", { battleResult: result, iWon: won, totalRibbons: newTotal, rematchConfig: updatedConfig });
    } catch (e) {
      setRematching(false);
    }
  };

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("dashboard")}>← Dashboard</button>
      </div>

      <div className="card card-glow" style={{ textAlign: "center" }}>
        <div className={`card-value ${iWon ? "win" : "loss"}`} style={{ fontSize: 30 }}>{iWon ? "VICTORY" : "DEFEAT"}</div>
        <div style={{ marginTop: 6, fontSize: 15 }}>{r.player_a_score} — {r.player_b_score}</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{r.arena_name} · {r.battle_twist}</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>MVP: <strong style={{ color: "var(--gold-bright)" }}>{r.mvp_fighter_name}</strong></div>

        {iWon && (
          <div style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: "var(--gold)", letterSpacing: "0.06em" }}>VICTORY RIBBON EARNED</div>
            <div style={{ fontSize: 20, color: "var(--gold-bright)", fontWeight: 700 }}>+1 Ribbon</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Total Ribbons: {totalRibbons ?? "—"}</div>
          </div>
        )}
      </div>

      <div className="card">
        <button className="btn btn-primary" onClick={handleRematch} disabled={rematching || !rematchConfig}>
          {rematching ? "Running Rematch..." : "Rematch"}
        </button>
        <button className="btn" onClick={() => setChangingBadges((s) => !s)} disabled={!rematchConfig}>
          Change Badges &amp; Rematch
        </button>
        <button className="btn" onClick={() => onNavigate("chooseMode")}>Fight Someone Else</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" style={{ marginBottom: 0 }} onClick={handleCopyFightCode}>{copied ? "Copied!" : "Copy Fight Code"}</button>
          <button className="btn" style={{ marginBottom: 0 }} onClick={handleShare}>Share Result</button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>Fight Code: {r.fight_code}</div>
      </div>

      {changingBadges && rematchConfig && (
        <BadgeLoadoutSelector
          fighters={rematchConfig.format === "gauntlet" ? rematchConfig.myLineup : rematchConfig.myTeam.fighter_snapshots}
          value={rematchBadgeSelections}
          onChange={(id, names) => setRematchBadgeSelections((prev) => ({ ...prev, [id]: names }))}
          onContinue={handleRematchWithNewBadges}
        />
      )}

      {r.special_result && (
        <div className="card card-glow" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gold-bright)", letterSpacing: "0.06em" }}>{r.special_result.toUpperCase()}!</div>
        </div>
      )}

      {r.battle_format === "gauntlet" && r.gauntlet_matchups && r.gauntlet_matchups.length > 0 && (
        <div className="card">
          <div className="card-title">Gauntlet Matchups</div>
          {r.gauntlet_matchups.map((m) => (
            <div key={m.matchup_number} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
              <span>
                #{m.matchup_number}: {m.fighter_a} <span style={{ color: "var(--text-dim)" }}>vs</span> {m.fighter_b}
              </span>
              <span style={{ color: "var(--gold-bright)" }}>
                {m.winner_side === "A" ? m.fighter_a : m.fighter_b} wins ({m.end_health_winner}% hp)
              </span>
            </div>
          ))}
        </div>
      )}

      {r.play_of_match && (
        <div className="card card-glow">
          <div className="card-title">Play of the Match</div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{r.play_of_match}</div>
        </div>
      )}

      {donutTotal > 0 && (
        <div className="card">
          <div className="card-title">Where Your Impact Came From</div>
          <div style={{ position: "relative", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData} dataKey="value" nameKey="name"
                  innerRadius={55} outerRadius={85} paddingAngle={2}
                  onClick={(d) => setSelectedBucket(d.key)}
                >
                  {donutData.map((d) => <Cell key={d.key} fill={BUCKET_COLORS[d.key]} cursor="pointer" />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v.toFixed(1)} impact`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--gold-bright)" }}>{myScore?.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.06em" }}>TOTAL IMPACT</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            {donutData.map((d) => (
              <div key={d.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, cursor: "pointer" }} onClick={() => setSelectedBucket(d.key)}>
                <span><span style={{ color: BUCKET_COLORS[d.key] }}>●</span> {d.name}</span>
                <span style={{ color: "var(--text-dim)" }}>{d.value.toFixed(1)} impact — {donutTotal > 0 ? ((d.value / donutTotal) * 100).toFixed(1) : "0.0"}%</span>
              </div>
            ))}
          </div>
          {selectedBucket && (
            <div className="card" style={{ marginTop: 10, background: "var(--bg-panel)" }}>
              <div className="card-title">{BUCKET_LABELS[selectedBucket].toUpperCase()} DETAILS</div>
              {(myContributions || []).map((f) => (
                <div key={f.fighter_name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{f.fighter_name}</span>
                  <span style={{ color: "var(--text-dim)" }}>{(f[selectedBucket] || 0).toFixed(1)} impact</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {myContributions && myContributions.length > 0 && (
        <div className="card">
          <div className="card-title">Fighter Contribution</div>
          {myContributions.map((f) => {
            const maxImpact = Math.max(...myContributions.map((x) => x.total_impact), 1);
            return (
              <div key={f.fighter_name} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                  <strong>{f.fighter_name}</strong>
                  <span style={{ color: "var(--gold-bright)" }}>{f.total_impact.toFixed(1)} impact</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "#262b38", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(f.total_impact / maxImpact) * 100}%`, background: "var(--gold)", borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card card-glow">
        <div className="card-title">Fight Analyst Report</div>
        <div style={{ fontSize: 12.5, color: "var(--gold)", marginBottom: 4 }}>THE HIGHLIGHT REEL</div>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 10px" }}>{analyst.highlight_reel}</p>
        <div style={{ fontSize: 12.5, color: "var(--gold)", marginBottom: 4 }}>THE TURNING POINT</div>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 10px" }}>{analyst.turning_point}</p>
        <div style={{ fontSize: 12.5, color: "var(--gold)", marginBottom: 4 }}>COACH'S SCOUTING REPORT</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          <div><strong>What worked:</strong> {analyst.coach_report.what_worked}</div>
          <div><strong>What hurt:</strong> {analyst.coach_report.what_hurt}</div>
          <div><strong>Recommended change:</strong> {analyst.coach_report.recommended_change}</div>
        </div>
      </div>

      {myActiveBadges && myActiveBadges.some((f) => f.badges.length > 0) && (
        <div className="card">
          <div className="card-title">Active Badges This Fight</div>
          {myActiveBadges.flatMap((f) => f.badges.map((b) => (
            <BadgePill key={f.fighter_name + b.name} badge={b} fighterName={f.fighter_name} />
          )))}
          <button className="btn btn-ghost" onClick={() => setShowFullBadges((s) => !s)}>
            {showFullBadges ? "Hide" : "View"} Full Badge Collection
          </button>
          {showFullBadges && (
            <div style={{ marginTop: 10 }}>
              {(iWon ? r.player_a_team_snapshot : r.player_b_team_snapshot || []).map((f) => (
                <div key={f.fighter_name} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{f.fighter_name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {calculateFighterBadges(f, f.power_point_cost, f.power_point_cap).map((b) => (
                      <span key={b.name} className="chip" style={{ borderColor: LEVEL_COLORS[b.level], color: LEVEL_COLORS[b.level], fontSize: 10 }}>
                        {b.level === "Gold" ? "🥇" : b.level === "Silver" ? "🥈" : "🥉"} {b.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {((iWon ? r.active_synergies_detail_a : r.active_synergies_detail_b) || []).length > 0 && (
        <div className="card">
          <div className="card-title">Active Synergies</div>
          {(iWon ? r.active_synergies_detail_a : r.active_synergies_detail_b).map((s) => (
            <div key={s.name} style={{ marginBottom: 8 }}>
              <strong style={{ color: "var(--gold-bright)" }}>{s.name}</strong>
              <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>{s.description}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <button className="btn btn-ghost" onClick={() => setShowLedger((s) => !s)}>
          {showLedger ? "Hide" : "How Was My Score Calculated?"}
        </button>
        {showLedger && myLedger && (
          <div style={{ marginTop: 10 }}>
            {myLedger.map((line) => (
              <div key={line.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: line.label === "TOTAL" ? "none" : "1px solid var(--line)", fontWeight: line.label === "TOTAL" ? 700 : 400 }}>
                <span>{line.label}</span>
                <span style={{ color: line.value < 0 ? "var(--loss)" : "var(--text-main)" }}>{line.value >= 0 ? "+" : ""}{line.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!iWon && (
        <>
          <div className="card">
            <div className="card-title">Why You Lost</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
              {r.why_loser_lost?.map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
          </div>
          <div className="card">
            <div className="card-title">Improvement Tips</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: "var(--gold-bright)" }}>
              {r.improvement_tips?.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>
        </>
      )}

      <div className="card">
        <button className="btn btn-ghost" onClick={() => setShowTimeline((s) => !s)}>
          {showTimeline ? "Hide" : "View Full Battle Timeline"}
        </button>
        {showTimeline && (
          <div style={{ marginTop: 10 }}>
            {(r.animation_rounds || []).map((round, i) => (
              <div key={i} style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 4 }}>
                {i + 1}. {round.attackerName} used {round.moveName} on side {round.defenderSide} — {round.damageAmount} dmg (health after: {round.defenderHealthAfter})
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="btn" onClick={() => onNavigate("battleHistory")}>View Battle History</button>
    </div>
  );
}
