import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { executeBattle, executeGauntletBattle } from "../lib/battleService";
import { adaptNormalBattleResult } from "../lib/resultAdapters";
import { savePendingBattle, getPendingBattle } from "../lib/idempotencyService";
import ClashAftermath from "../components/ClashAftermath.jsx";
import BadgeLoadoutSelector from "../components/BadgeLoadoutSelector.jsx";

const RESULT_SLOT = "lastBattleResult";

export default function BattleResult({ user, profile, battleResult, iWon, totalRibbons, rematchConfig, onNavigate }) {
  const [recoveredResult, setRecoveredResult] = useState(null);
  const [recovering, setRecovering] = useState(!battleResult);
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  const [rematching, setRematching] = useState(false);
  const [changingBadges, setChangingBadges] = useState(false);
  const [rematchBadgeSelections, setRematchBadgeSelections] = useState({});
  const [error, setError] = useState("");

  // sessionStorage stores ONLY a pointer (the battle's real id) — never
  // the displayed facts themselves. On recovery we always re-fetch the
  // actual row from battle_history (RLS-protected: only returns it if the
  // caller is a participant), so a refresh can never show stale or wrong
  // data, and the battle is never re-simulated.
  useEffect(() => {
    if (battleResult?.id) {
      savePendingBattle(RESULT_SLOT, battleResult.id, { battleId: battleResult.id, iWon, totalRibbons, rematchConfig });
      return;
    }
    if (battleResult) return; // has data but no id (shouldn't happen) — just render what we have

    (async () => {
      const stored = getPendingBattle(RESULT_SLOT)?.payload;
      if (!stored?.battleId) { setRecoveryFailed(true); setRecovering(false); return; }

      const { data, error: fetchError } = await supabase
        .from("battle_history")
        .select("*")
        .eq("id", stored.battleId)
        .maybeSingle();

      if (fetchError || !data) { setRecoveryFailed(true); setRecovering(false); return; }

      const won = data.winner_id === user.id;
      setRecoveredResult({ battleResult: data, iWon: won, totalRibbons: stored.totalRibbons, rematchConfig: stored.rematchConfig });
      setRecovering(false);
    })();
  }, [battleResult, user.id]);

  const r = battleResult || recoveredResult?.battleResult;
  const won = battleResult ? iWon : recoveredResult?.iWon;
  const ribbons = battleResult ? totalRibbons : recoveredResult?.totalRibbons;
  const rematch = battleResult ? rematchConfig : recoveredResult?.rematchConfig;

  if (recovering) {
    return (
      <div className="page center" style={{ minHeight: "60vh", flexDirection: "column", gap: 14 }}>
        <div className="spinner" />
        <div style={{ color: "var(--text-dim)" }}>Loading your battle result...</div>
      </div>
    );
  }

  if (recoveryFailed || !r) {
    return (
      <div className="page">
        <div className="card card-danger">
          <div className="card-title">No Result Found</div>
          <p style={{ fontSize: 14, marginBottom: 10 }}>We couldn't recover a battle result to display. Check Battle History for your past fights.</p>
          <button className="btn btn-primary" onClick={() => onNavigate("battleHistory")}>View Battle History</button>
          <button className="btn btn-ghost" onClick={() => onNavigate("dashboard")}>Return Home</button>
        </div>
      </div>
    );
  }

  const data = adaptNormalBattleResult(r, won, ribbons);

  const handleRematch = async () => {
    if (!rematch) { onNavigate("chooseMode"); return; }
    setRematching(true);
    setError("");
    try {
      // No idempotencyKey passed — executeBattle/executeGauntletBattle
      // generate a fresh one internally, guaranteeing this is recorded as
      // a genuinely new attempt, never merged with the previous result.
      const executor = rematch.format === "gauntlet"
        ? executeGauntletBattle({ user, profile, myLineup: rematch.myLineup, opponentLineup: rematch.opponentLineup, battleMode: rematch.battleMode, battleType: rematch.battleType, opponentUserId: rematch.opponentUserId, lineupVisibility: rematch.lineupVisibility })
        : executeBattle({ user, profile, myTeam: rematch.myTeam, opponentTeam: rematch.opponentTeam, battleMode: rematch.battleMode, battleType: rematch.battleType, opponentUserId: rematch.opponentUserId });
      const { result, iWon: won2, totalRibbons: newTotal } = await executor;
      onNavigate("pixelBattleAnimation", { battleResult: result, iWon: won2, totalRibbons: newTotal, rematchConfig: rematch });
    } catch (e) {
      setError(e.message);
      setRematching(false);
    }
  };

  const handleRematchWithNewBadges = async () => {
    if (!rematch) return;
    setRematching(true);
    setError("");
    try {
      if (rematch.format === "gauntlet") {
        const updatedLineup = rematch.myLineup.map((f) => ({ ...f, active_badges: rematchBadgeSelections[f.id] || f.active_badges || [] }));
        const updatedConfig = { ...rematch, myLineup: updatedLineup };
        const { result, iWon: won2, totalRibbons: newTotal } = await executeGauntletBattle({ user, profile, myLineup: updatedLineup, opponentLineup: updatedConfig.opponentLineup, battleMode: updatedConfig.battleMode, battleType: updatedConfig.battleType, opponentUserId: updatedConfig.opponentUserId, lineupVisibility: updatedConfig.lineupVisibility });
        onNavigate("pixelBattleAnimation", { battleResult: result, iWon: won2, totalRibbons: newTotal, rematchConfig: updatedConfig });
        return;
      }
      const updatedFighters = rematch.myTeam.fighter_snapshots.map((f) => ({ ...f, active_badges: rematchBadgeSelections[f.id] || f.active_badges || [] }));
      const updatedConfig = { ...rematch, myTeam: { ...rematch.myTeam, fighter_snapshots: updatedFighters } };
      const { result, iWon: won2, totalRibbons: newTotal } = await executeBattle({ user, profile, myTeam: updatedConfig.myTeam, opponentTeam: updatedConfig.opponentTeam, battleMode: updatedConfig.battleMode, battleType: updatedConfig.battleType, opponentUserId: updatedConfig.opponentUserId });
      onNavigate("pixelBattleAnimation", { battleResult: result, iWon: won2, totalRibbons: newTotal, rematchConfig: updatedConfig });
    } catch (e) {
      setError(e.message);
      setRematching(false);
    }
  };

  if (changingBadges && rematch) {
    return (
      <div className="page">
        {error && <div className="error-box">{error}</div>}
        <BadgeLoadoutSelector
          fighters={rematch.format === "gauntlet" ? rematch.myLineup : rematch.myTeam.fighter_snapshots}
          value={rematchBadgeSelections}
          onChange={(id, names) => setRematchBadgeSelections((prev) => ({ ...prev, [id]: names }))}
          onContinue={handleRematchWithNewBadges}
        />
      </div>
    );
  }

  return (
    <div>
      {error && <div className="page" style={{ paddingBottom: 0 }}><div className="error-box">{error}</div></div>}
      {rematching ? (
        <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>
      ) : (
        <ClashAftermath
          data={data}
          actions={{
            onFightAgain: handleRematch,
            onViewHistory: () => onNavigate("battleHistory"),
            onReturnHome: () => onNavigate("dashboard")
          }}
        />
      )}
      {!rematching && rematch && (
        <div className="page" style={{ paddingTop: 0 }}>
          <button className="btn btn-ghost" onClick={() => setChangingBadges(true)}>Change Badges &amp; Rematch</button>
        </div>
      )}
    </div>
  );
}
