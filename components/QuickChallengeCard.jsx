import React, { useState, useRef } from "react";
import { resolveFightCode } from "../lib/fightCodeService";
import { supabase } from "../lib/supabaseClient";
import { executeBattle } from "../lib/battleService";
import { generateIdempotencyKey, savePendingBattle, getPendingBattle, clearPendingBattle } from "../lib/idempotencyService";
import FighterPicker from "./FighterPicker.jsx";
import FighterVisual from "./FighterVisual.jsx";

export default function QuickChallengeCard({ user, profile, onNavigate }) {
  const [codeInput, setCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [opponent, setOpponent] = useState(null);
  const [myIds, setMyIds] = useState([]);
  const [starting, setStarting] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const idempotencyKeyRef = useRef(getPendingBattle("quickChallenge")?.key || null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setCodeInput(text);
    } catch {
      // clipboard read unavailable — user can paste manually
    }
  };

  const handleLoad = async () => {
    setError("");
    setOpponent(null);
    if (!codeInput.trim()) return;

    setLoading(true);
    const result = await resolveFightCode(codeInput);
    setLoading(false);

    if (!result.success) { setError(result.error); return; }
    setOpponent(result);
    setMyIds([]);
  };

  const requiredCount = opponent?.fighters.length || 1;

  const handleFight = async () => {
    setError("");
    setSaveFailed(false);
    if (myIds.length !== requiredCount) { setError(`Select exactly ${requiredCount} fighter(s).`); return; }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = generateIdempotencyKey(user.id);
      savePendingBattle("quickChallenge", idempotencyKeyRef.current, { note: "battle code fight in progress" });
    }

    setStarting(true);
    try {
      const { data } = await supabase.from("fighters").select("*").in("id", myIds);
      const myFighters = myIds.map((id) => (data || []).find((f) => f.id === id)).filter(Boolean);

      const { result, iWon } = await executeBattle({
        user, profile,
        myTeam: { fighter_snapshots: myFighters },
        opponentTeam: { fighter_snapshots: opponent.fighters },
        battleMode: opponent.battleSize,
        battleType: "PVP_CODE",
        opponentUserId: null,
        idempotencyKey: idempotencyKeyRef.current
      });
      idempotencyKeyRef.current = null;
      clearPendingBattle("quickChallenge");
      onNavigate("pixelBattleAnimation", { battleResult: result, iWon });
    } catch (e) {
      setSaveFailed(true);
      setError(e.message);
      setStarting(false);
    }
  };

  return (
    <div className="card card-glow">
      <div className="card-title">Quick Challenge via Fight Code</div>
      <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 10 }}>
        Paste the Fight Code your friend sent you to instantly load their fighter.
      </div>

      {error && <div className="error-box">{error}</div>}
      {saveFailed && (
        <button className="btn btn-primary" onClick={handleFight} disabled={starting}>
          {starting ? "Retrying..." : "Retry Save"}
        </button>
      )}

      <div className="field" style={{ marginBottom: 8 }}>
        <input
          type="text"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          placeholder="PC-XXXX-XXXX"
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        {navigator.clipboard?.readText && (
          <button className="btn" style={{ marginBottom: 0, width: "auto", padding: "10px 14px" }} onClick={handlePaste}>Paste</button>
        )}
        <button className="btn btn-primary" style={{ marginBottom: 0 }} onClick={handleLoad} disabled={loading || !codeInput.trim()}>
          {loading ? "Loading..." : "Load Fighter"}
        </button>
      </div>

      {opponent && (
        <div style={{ marginTop: 14 }}>
          <div className="success-box">
            {opponent.fighters.length === 1 ? "Valid fighter found" : `Valid ${opponent.battleSize} roster found`} — from {opponent.ownerDisplayName}.
          </div>
          {opponent.fighters.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <div style={{ width: 48, height: 48, flexShrink: 0 }}><FighterVisual fighter={f} size={46} /></div>
              <div>
                <div style={{ fontWeight: 700 }}>{f.fighter_name}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{f.power_source} · {f.fighting_style} · STR {f.strength} SPD {f.speed} DUR {f.durability} IQ {f.battle_iq} STA {f.stamina}</div>
              </div>
            </div>
          ))}

          <div className="card-title" style={{ marginTop: 12 }}>Select Your Fighter{requiredCount > 1 ? "s" : ""}</div>
          <FighterPicker userId={user.id} battleSize={opponent.battleSize} selectedIds={myIds} onChange={setMyIds} />
          <button className="btn btn-primary" onClick={handleFight} disabled={starting}>
            {starting ? "Running Battle..." : "Start Fight"}
          </button>
        </div>
      )}
    </div>
  );
}
