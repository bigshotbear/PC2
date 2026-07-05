import React, { useState } from "react";
import { saveDisplayName } from "../lib/displayNameService";

export default function ChooseDisplayName({ user, onDone }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);
    const result = await saveDisplayName(user.id, name);
    setSaving(false);
    if (!result.success) { setError(result.error); return; }
    onDone();
  };

  return (
    <div className="page center" style={{ minHeight: "100vh", maxWidth: 420 }}>
      <div style={{ width: "100%" }}>
        <h1 style={{ fontSize: 26, color: "var(--gold-bright)", textAlign: "center", textTransform: "uppercase", marginBottom: 10 }}>
          Choose Your Player Name
        </h1>
        <div style={{ color: "var(--text-dim)", fontSize: 13, textAlign: "center", marginBottom: 20 }}>
          This is how friends will find and challenge you. It must be unique.
        </div>

        <div className="card card-glow">
          {error && <div className="error-box">{error}</div>}
          <div className="field">
            <label>Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Connor, BigShotBear, Power-King92"
              maxLength={20}
            />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14 }}>
            3–20 characters. Letters, numbers, spaces, hyphens, and underscores only.
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : "Confirm Name"}
          </button>
        </div>
      </div>
    </div>
  );
}
