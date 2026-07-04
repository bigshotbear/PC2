import React, { useState } from "react";
import FighterPicker from "../components/FighterPicker.jsx";
import { encodeFighterCode, decodeFighterCode } from "../lib/fighterCode";
import { executeBattle } from "../lib/battleService";
import { supabase } from "../lib/supabaseClient";

const SIZES = [
  { key: "1v1", count: 1 }, { key: "2v2", count: 2 }, { key: "3v3", count: 3 }
];

export default function BattleCode({ user, profile, onNavigate }) {
  // --- Send ---
  const [sendSize, setSendSize] = useState("1v1");
  const [sendIds, setSendIds] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [sendError, setSendError] = useState("");

  // --- Receive ---
  const [codeInput, setCodeInput] = useState("");
  const [decoded, setDecoded] = useState(null);
  const [decodeError, setDecodeError] = useState("");
  const [myIds, setMyIds] = useState([]);
  const [starting, setStarting] = useState(false);

  const requiredSendCount = SIZES.find((s) => s.key === sendSize).count;

  const handleGenerate = async () => {
    setSendError("");
    if (sendIds.length !== requiredSendCount) { setSendError(`Select exactly ${requiredSendCount} fighter(s).`); return; }
    const { data } = await supabase.from("fighters").select("*").in("id", sendIds);
    const ordered = sendIds.map((id) => (data || []).find((f) => f.id === id)).filter(Boolean);
    setGeneratedCode(encodeFighterCode(ordered, profile?.display_name));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy this code:", generatedCode);
    }
  };

  const handleLoadChallenge = () => {
    setDecodeError("");
    const result = decodeFighterCode(codeInput);
    if (!result.success) { setDecodeError(result.error); setDecoded(null); return; }
    setDecoded(result);
    setMyIds([]);
  };

  const requiredReceiveCount = decoded ? SIZES.find((s) => s.key === decoded.battleSize).count : 0;

  const handleFight = async () => {
    setDecodeError("");
    if (myIds.length !== requiredReceiveCount) { setDecodeError(`Select exactly ${requiredReceiveCount} fighter(s).`); return; }
    setStarting(true);
    try {
      const { data } = await supabase.from("fighters").select("*").in("id", myIds);
      const myFighters = myIds.map((id) => (data || []).find((f) => f.id === id)).filter(Boolean);
      const { result, iWon } = await executeBattle({
        user, profile,
        myTeam: { fighter_snapshots: myFighters },
        opponentTeam: { fighter_snapshots: decoded.fighters },
        battleMode: decoded.battleSize,
        battleType: "PVP_CODE",
        opponentUserId: null
      });
      onNavigate("pixelBattleAnimation", { battleResult: result, iWon });
    } catch (e) {
      setDecodeError("Battle failed to run: " + e.message);
      setStarting(false);
    }
  };

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("chooseMode")}>← Back</button>
      </div>

      <h2 style={{ marginBottom: 16, color: "var(--gold-bright)", textTransform: "uppercase" }}>Battle Code</h2>

      <div className="card card-glow">
        <div className="card-title">Send a Challenge</div>
        {sendError && <div className="error-box">{sendError}</div>}
        <div className="field" style={{ marginBottom: 8 }}>
          <select value={sendSize} onChange={(e) => { setSendSize(e.target.value); setSendIds([]); setGeneratedCode(""); }}>
            <option value="1v1">1v1</option>
            <option value="2v2">2v2</option>
            <option value="3v3">3v3</option>
          </select>
        </div>
        <FighterPicker userId={user.id} battleSize={sendSize} selectedIds={sendIds} onChange={setSendIds} />
        <button className="btn btn-primary" onClick={handleGenerate}>Generate Code</button>

        {generatedCode && (
          <>
            <textarea readOnly rows={3} value={generatedCode} style={{ width: "100%", fontSize: 11, marginBottom: 8 }} />
            <button className="btn" onClick={handleCopy}>{copied ? "Copied!" : "Copy Code"}</button>
          </>
        )}
      </div>

      <div className="card card-glow">
        <div className="card-title">Receive a Challenge</div>
        {decodeError && <div className="error-box">{decodeError}</div>}
        <div className="field">
          <textarea rows={3} value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Paste a PC- battle code here" />
        </div>
        <button className="btn" onClick={handleLoadChallenge} disabled={!codeInput.trim()}>Load Challenge</button>

        {decoded && (
          <>
            <div className="success-box" style={{ marginTop: 10 }}>
              Valid {decoded.battleSize} roster found from {decoded.ownerName} ({decoded.fighters.length} fighter{decoded.fighters.length > 1 ? "s" : ""}).
            </div>
            {decoded.fighters.map((f, i) => (
              <div key={i} className="fighter-card" style={{ marginBottom: 6 }}>
                <div className="fighter-thumb" />
                <div className="fighter-card-body">
                  <div className="fighter-card-name">{f.fighter_name}</div>
                  <div className="fighter-card-meta">{f.power_source} · {f.fighting_style}</div>
                </div>
              </div>
            ))}
            <div className="card-title" style={{ marginTop: 10 }}>Select Your Fighters</div>
            <FighterPicker userId={user.id} battleSize={decoded.battleSize} selectedIds={myIds} onChange={setMyIds} />
            <button className="btn btn-primary" onClick={handleFight} disabled={starting}>
              {starting ? "Running Battle..." : "Fight"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
