import React, { useEffect, useRef, useState } from "react";
import { renderShareCard, canvasToBlob } from "../lib/shareCardRenderer";

export default function ShareBattleCard({ data, narration, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [shareUnavailable, setShareUnavailable] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      renderShareCard(canvasRef.current, { ...data, headline: narration.headline });
    }
  }, [data, narration]);

  const shareText = `${data.won ? "VICTORY" : "DEFEAT"} — ${data.winnerName} defeated ${data.loserName} ${Math.round(data.myScore)}-${Math.round(data.opponentScore)}${data.grade ? ` (Grade ${data.grade})` : ""}\n"${narration.headline}"${data.fightCode ? `\nFight Code: ${data.fightCode}` : ""}\nplay at powerclash.app`;

  const handleDownload = async () => {
    const blob = await canvasToBlob(canvasRef.current);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "power-clash-battle.png";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async () => {
    try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt("Copy this text:", shareText); }
  };

  const handleNativeShare = async () => {
    setShareUnavailable(false);
    if (!navigator.share) { setShareUnavailable(true); return; }
    try {
      const blob = await canvasToBlob(canvasRef.current);
      const file = new File([blob], "power-clash-battle.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "Power Clash Battle", text: shareText, files: [file] });
      } else {
        await navigator.share({ title: "Power Clash Battle", text: shareText });
      }
    } catch (e) {
      // user cancelled — not an error
    }
  };

  return (
    <div className="pc-modal-overlay" onClick={onClose}>
      <div className="pc-modal-sheet" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="card-title" style={{ margin: 0, color: "var(--gold-bright)" }}>Share Battle Story</div>
          <button className="back-btn" onClick={onClose}>✕ Close</button>
        </div>

        <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 360, borderRadius: 12, border: "1px solid var(--line)" }} />

        {shareUnavailable && (
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 10 }}>
            Native sharing isn't available on this browser — use Download Image or Copy Share Text instead.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleDownload}>Download Image</button>
          <button className="btn btn-cyan" onClick={handleCopyText}>{copied ? "Copied!" : "Copy Share Text"}</button>
          <button className="btn btn-purple" onClick={handleNativeShare}>Native Share</button>
        </div>
      </div>
    </div>
  );
}
