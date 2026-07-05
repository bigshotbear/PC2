import React, { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { calculateFighterBadges } from "../lib/badgeEngine";
import FighterVisual from "../components/FighterVisual.jsx";
import QuickChallengeCard from "../components/QuickChallengeCard.jsx";
import { getOrCreateFighterCode } from "../lib/fightCodeService";
import { uploadPortrait, validateImageFile } from "../lib/portraitUploadService";
import { publishCommunityBuild, setCommunityBuildVisibility } from "../lib/communityBuildService";
import { buildImagePrompt } from "../lib/imagePromptService";

const LEVEL_COLORS = { Bronze: "#c17a4a", Silver: "#b7bfc9", Gold: "var(--gold-bright)" };

function PortraitUploader({ user, fighter, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploadSuccess(false);

    const check = validateImageFile(file);
    if (!check.valid) { setUploadError(check.error); return; }

    setUploading(true);
    const result = await uploadPortrait(user.id, fighter.id, file);
    setUploading(false);

    if (!result.success) { setUploadError(result.error); return; }

    const { error: updateError } = await supabase.from("fighters").update({ portrait_url: result.url }).eq("id", fighter.id);
    if (updateError) { setUploadError("Portrait uploaded but failed to save. Try again."); return; }

    await publishCommunityBuild({ ...fighter, portrait_url: result.url }, undefined);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2000);
    onUploaded(result.url);
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={handlePick}
        title="Click to upload a custom portrait"
        style={{ width: 64, height: 64, flexShrink: 0, overflow: "hidden", borderRadius: 10, border: "1px solid var(--line)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <FighterVisual fighter={fighter} size={62} />
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleFile} />
      {uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(9,11,16,0.8)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--gold)" }}>Uploading...</div>}
      {uploadError && <div style={{ position: "absolute", top: 68, left: 0, width: 160, fontSize: 10, color: "var(--loss)" }}>{uploadError}</div>}
      {uploadSuccess && <div style={{ position: "absolute", top: 68, left: 0, width: 160, fontSize: 10, color: "var(--win)" }}>Portrait uploaded successfully.</div>}
    </div>
  );
}

export default function SavedFighters({ user, profile, onNavigate }) {
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [codeStatusById, setCodeStatusById] = useState({});
  const [showQuickChallenge, setShowQuickChallenge] = useState(false);
  const [headerPicking, setHeaderPicking] = useState(false);
  const [buildCodesByFighter, setBuildCodesByFighter] = useState({});
  const [buildCodeCopied, setBuildCodeCopied] = useState(null);
  const [promptCopied, setPromptCopied] = useState(null);

  const loadFighters = async () => {
    setLoading(true);
    setError("");
    const { data, error: loadError } = await supabase
      .from("fighters")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (loadError) {
      setError("Could not load fighters: " + loadError.message);
      return;
    }
    setFighters(data || []);

    const ids = (data || []).map((f) => f.id);
    if (ids.length > 0) {
      const { data: builds } = await supabase.from("community_builds").select("id, fighter_id, build_code, visibility").in("fighter_id", ids);
      const map = {};
      (builds || []).forEach((b) => { map[b.fighter_id] = b; });
      setBuildCodesByFighter(map);
    }
  };

  useEffect(() => {
    loadFighters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fighters;
    return fighters.filter((f) =>
      f.fighter_name.toLowerCase().includes(q) ||
      f.power_source.toLowerCase().includes(q) ||
      f.fighting_style.toLowerCase().includes(q)
    );
  }, [fighters, search]);

  const handleDelete = async (id) => {
    const { error: deleteError } = await supabase.from("fighters").delete().eq("id", id);
    if (deleteError) {
      setError("Delete failed: " + deleteError.message);
      return;
    }
    // Intentionally NOT deactivating the community_builds row here — the
    // Community Build backup must remain available via its Build Code
    // even after the personal fighter is deleted.
    setConfirmDeleteId(null);
    setFighters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCopyCode = async (fighter) => {
    setCodeStatusById((s) => ({ ...s, [fighter.id]: "generating" }));
    const result = await getOrCreateFighterCode(fighter, profile?.display_name);
    if (!result.success) {
      setCodeStatusById((s) => ({ ...s, [fighter.id]: null }));
      setError(result.error);
      return;
    }
    try {
      await navigator.clipboard.writeText(result.code);
    } catch {
      window.prompt("Copy this Fight Code:", result.code);
    }
    setCodeStatusById((s) => ({ ...s, [fighter.id]: result.code }));
    setTimeout(() => setCodeStatusById((s) => ({ ...s, [fighter.id]: null })), 3000);
  };

  const handlePortraitUploaded = (fighterId, url) => {
    setFighters((prev) => prev.map((f) => (f.id === fighterId ? { ...f, portrait_url: url } : f)));
  };

  const handleCopyBuildCode = async (fighterId) => {
    const build = buildCodesByFighter[fighterId];
    if (!build?.build_code) return;
    try { await navigator.clipboard.writeText(build.build_code); setBuildCodeCopied(fighterId); setTimeout(() => setBuildCodeCopied(null), 2000); }
    catch { window.prompt("Copy this Build Code:", build.build_code); }
  };

  const handleToggleVisibility = async (fighterId) => {
    const build = buildCodesByFighter[fighterId];
    if (!build) return;
    const nextVisibility = build.visibility === "public" ? "unlisted" : "public";
    await setCommunityBuildVisibility(build.id, nextVisibility);
    setBuildCodesByFighter((prev) => ({ ...prev, [fighterId]: { ...build, visibility: nextVisibility } }));
  };

  const handleCopyPrompt = async (fighter) => {
    const prompt = buildImagePrompt(fighter);
    try { await navigator.clipboard.writeText(prompt); setPromptCopied(fighter.id); setTimeout(() => setPromptCopied(null), 2500); }
    catch { window.prompt("Copy this image prompt:", prompt); }
  };

  const handleRemoveImage = async (fighterId) => {
    await supabase.from("fighters").update({ portrait_url: null }).eq("id", fighterId);
    setFighters((prev) => prev.map((f) => (f.id === fighterId ? { ...f, portrait_url: null } : f)));
  };

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("dashboard")}>← Back</button>
      </div>

      {/* --- Redesigned header: instructions + Generate Code --- */}
      <div className="card card-glow" style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
        <div style={{ flex: "1 1 220px" }}>
          <div className="card-title" style={{ marginBottom: 6 }}>How it works</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
            Generate a code, send it to your friend, have them send you their code, and fight!
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ flex: "0 0 auto", width: "auto", padding: "16px 22px", marginBottom: 0 }}
          onClick={() => setHeaderPicking((s) => !s)}
        >
          Generate Code
        </button>
      </div>

      {headerPicking && (
        <div className="card">
          <div className="card-title">Choose a fighter to generate a code for</div>
          {fighters.map((f) => (
            <button key={f.id} className="btn" onClick={async () => { setHeaderPicking(false); await handleCopyCode(f); }}>
              {f.fighter_name}
            </button>
          ))}
        </div>
      )}

      <button className="btn btn-primary" onClick={() => onNavigate("fighterBuilder")}>
        + Create Fighter
      </button>

      <input
        className="search-bar"
        placeholder="Search by name, power source, or style..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="center" style={{ padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="display">No fighters yet</div>
          <p>Build your first fighter to start Power Clash.</p>
        </div>
      ) : (
        filtered.map((f) => {
          const badges = calculateFighterBadges(f, f.power_point_cost, f.power_point_cap).slice(0, 3);
          const codeStatus = codeStatusById[f.id];
          return (
            <div className="card fighter-card" key={f.id} style={{ flexWrap: "wrap" }}>
              <PortraitUploader user={user} fighter={f} onUploaded={(url) => handlePortraitUploaded(f.id, url)} />
              <div className="fighter-card-body">
                <div className="fighter-card-name">{f.fighter_name}</div>
                <div className="fighter-card-meta">
                  {f.character_type} · {f.power_source} · {f.fighting_style}
                </div>
                <div className="fighter-card-meta">
                  Stats {f.stat_total}/100 · Power Cost {f.power_point_cost}/{f.power_point_cap}
                </div>
                {badges.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {badges.map((b) => (
                      <span key={b.name} className="chip" title={b.description} style={{ borderColor: LEVEL_COLORS[b.level], color: LEVEL_COLORS[b.level], fontSize: 10 }}>
                        {b.level === "Gold" ? "🥇" : b.level === "Silver" ? "🥈" : "🥉"} {b.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="fighter-card-actions">
                <button className="icon-btn" title="Edit" onClick={() => onNavigate("fighterBuilder", { fighterId: f.id })}>✎</button>
                <button className="icon-btn" title="Duplicate" onClick={() => onNavigate("fighterBuilder", { duplicateFrom: f.id })}>⧉</button>
                <button className="icon-btn" title="Delete" onClick={() => setConfirmDeleteId(f.id)}>✕</button>
              </div>

              <div style={{ width: "100%", display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary" style={{ marginBottom: 0, width: "auto", padding: "10px 14px" }} onClick={() => handleCopyCode(f)}>
                  {codeStatus === "generating" ? "Generating..." : codeStatus ? "Fight Code copied!" : "Copy Fighter Code"}
                </button>
                <button className="btn" style={{ marginBottom: 0, width: "auto", padding: "10px 14px" }} onClick={() => onNavigate("battleFlow", { mode: "computer", singlePlayerMode: "ai", preselectedFighterId: f.id })}>
                  Fight Now (Computer)
                </button>
                <button className="btn" style={{ marginBottom: 0, width: "auto", padding: "10px 14px" }} onClick={() => onNavigate("battleFlow", { mode: "computer", singlePlayerMode: "community", preselectedFighterId: f.id })}>
                  Fight Now (Community)
                </button>
                <button className="btn" style={{ marginBottom: 0, width: "auto", padding: "10px 14px" }} onClick={() => onNavigate("teamBuilder")}>
                  Add to Team
                </button>
              </div>
              {codeStatus && codeStatus !== "generating" && (
                <div style={{ width: "100%", fontSize: 12, color: "var(--gold)", marginTop: 6 }}>
                  Code: {codeStatus} (also copied to your clipboard)
                </div>
              )}

              {buildCodesByFighter[f.id] && (
                <div style={{ width: "100%", marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 6 }}>
                    BUILD CODE: <strong style={{ color: "var(--gold-bright)" }}>{buildCodesByFighter[f.id].build_code}</strong>
                    {" "}<span className="chip" style={{ fontSize: 9 }}>{buildCodesByFighter[f.id].visibility}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="icon-btn" onClick={() => handleCopyBuildCode(f.id)}>{buildCodeCopied === f.id ? "Copied!" : "Copy Build Code"}</button>
                    <button className="icon-btn" onClick={() => handleToggleVisibility(f.id)}>
                      {buildCodesByFighter[f.id].visibility === "public" ? "Make Unlisted" : "Publish to Community"}
                    </button>
                    <button className="icon-btn" onClick={() => handleCopyPrompt(f)}>{promptCopied === f.id ? "Copied!" : "Copy Image Prompt"}</button>
                    {f.portrait_url && <button className="icon-btn" onClick={() => handleRemoveImage(f.id)}>Remove Image</button>}
                  </div>
                </div>
              )}

              {confirmDeleteId === f.id && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(9,11,16,0.92)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <div style={{ fontSize: 14 }}>Delete {f.fighter_name}?</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)", maxWidth: 240, textAlign: "center" }}>
                    Deleting this personal fighter will remove your editable copy. Its Community Build backup will remain available using its Build Code.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-danger" style={{ width: "auto", padding: "8px 16px", marginBottom: 0 }} onClick={() => handleDelete(f.id)}>Delete</button>
                    <button className="btn btn-ghost" style={{ width: "auto", padding: "8px 16px", marginBottom: 0 }} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      <button className="btn btn-ghost" onClick={() => setShowQuickChallenge((s) => !s)}>
        {showQuickChallenge ? "Hide" : "Show"} Quick Challenge via Fight Code
      </button>
      {showQuickChallenge && <QuickChallengeCard user={user} profile={profile} onNavigate={onNavigate} />}
    </div>
  );
}
