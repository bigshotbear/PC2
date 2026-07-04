import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FighterPicker from "../components/FighterPicker.jsx";
import QuickChallengeCard from "../components/QuickChallengeCard.jsx";
import { createFightCode } from "../lib/fightCodeService";

const SIZES = [{ key: "1v1", count: 1 }, { key: "2v2", count: 2 }, { key: "3v3", count: 3 }];

export default function BattleCode({ user, profile, onNavigate }) {
  const [sendSize, setSendSize] = useState("1v1");
  const [sendIds, setSendIds] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sendError, setSendError] = useState("");

  const requiredSendCount = SIZES.find((s) => s.key === sendSize).count;

  const handleGenerate = async () => {
    setSendError("");
    setGeneratedCode("");
    if (sendIds.length !== requiredSendCount) { setSendError(`Select exactly ${requiredSendCount} fighter(s).`); return; }

    setGenerating(true);
    const { data } = await supabase.from("fighters").select("*").in("id", sendIds);
    const ordered = sendIds.map((id) => (data || []).find((f) => f.id === id)).filter(Boolean);

    const codeType = ordered.length === 1 ? "fighter" : "roster";
    const result = await createFightCode(ordered, profile?.display_name, codeType, requiredSendCount);
    setGenerating(false);

    if (!result.success) { setSendError(result.error); return; }
    setGeneratedCode(result.code);
    try { await navigator.clipboard.writeText(result.code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* fallback text field still shown */ }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Power Clash Fight Code",
          text: `Fight my Power Clash fighter using code: ${generatedCode}`,
          url: window.location.origin
        });
      } catch { /* user cancelled share sheet */ }
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
        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "Generate Code"}
        </button>

        {generatedCode && (
          <>
            <input readOnly value={generatedCode} style={{ width: "100%", fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 8, letterSpacing: 1 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" style={{ marginBottom: 0 }} onClick={async () => { try { await navigator.clipboard.writeText(generatedCode); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt("Copy this code:", generatedCode); } }}>
                {copied ? "Copied!" : "Copy Code"}
              </button>
              {navigator.share && (
                <button className="btn" style={{ marginBottom: 0 }} onClick={handleShare}>Share</button>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 8 }}>
              This code stays active until you delete the fighter or regenerate it — it won't expire on its own.
            </div>
          </>
        )}
      </div>

      <QuickChallengeCard user={user} profile={profile} onNavigate={onNavigate} />
    </div>
  );
}
