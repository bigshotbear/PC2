import React, { useEffect, useState } from "react";
import FighterVisual from "../components/FighterVisual.jsx";
import {
  searchCommunityBuilds, getCommunityBuildByCode, getMyPublishedBuilds,
  getMyUnlistedBuilds, copyBuildToMyFighters
} from "../lib/communityBuildService";

function BuildCard({ build, onCopy, copying }) {
  return (
    <div className="card">
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ width: 52, height: 52, flexShrink: 0 }}>
          <FighterVisual fighter={build.fighter_snapshot} size={50} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="fighter-card-name">{build.fighter_name}</div>
          <div className="fighter-card-meta">by {build.owner_display_name} · {build.power_source} · {build.fighting_style}</div>
          <div style={{ fontSize: 11, color: "var(--gold)", marginTop: 2 }}>Build Code: {build.build_code}</div>
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => onCopy(build)} disabled={copying}>
        {copying ? "Copying..." : "Copy to My Fighters"}
      </button>
    </div>
  );
}

export default function CommunityBuilds({ user, onNavigate }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeResult, setCodeResult] = useState(null);
  const [codeError, setCodeError] = useState("");
  const [myPublished, setMyPublished] = useState([]);
  const [myUnlisted, setMyUnlisted] = useState([]);
  const [copyingId, setCopyingId] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    (async () => {
      setMyPublished(await getMyPublishedBuilds(user.id));
      setMyUnlisted(await getMyUnlistedBuilds(user.id));
    })();
  }, [user.id]);

  const handleSearch = async () => {
    setSearching(true);
    setResults(await searchCommunityBuilds(search));
    setSearching(false);
  };

  const handleLoadCode = async () => {
    setCodeError("");
    setCodeResult(null);
    const result = await getCommunityBuildByCode(codeInput);
    if (!result.success) { setCodeError(result.error); return; }
    setCodeResult(result.build);
  };

  const handleCopy = async (build) => {
    setCopyingId(build.id);
    setCopySuccess("");
    const result = await copyBuildToMyFighters(user.id, build);
    setCopyingId(null);
    if (!result.success) { setCodeError(result.error); return; }
    setCopySuccess(`${result.fighter.fighter_name} added to your Saved Fighters!`);
  };

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("chooseMode")}>← Back</button>
      </div>

      <h2 style={{ color: "var(--gold-bright)", textTransform: "uppercase" }}>Community Builds</h2>

      {copySuccess && <div className="success-box">{copySuccess}</div>}

      <div className="card card-glow">
        <div className="card-title">Recover or Copy a Build</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>
          Copying a Community Build restores the fighter build. It does not restore the original account, friends, battle history, or ownership.
        </div>
        {codeError && <div className="error-box">{codeError}</div>}
        <input type="text" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="PCB-XXXXXX" style={{ marginBottom: 8 }} />
        <button className="btn btn-primary" onClick={handleLoadCode} disabled={!codeInput.trim()}>Load Build Code</button>
        {codeResult && <BuildCard build={codeResult} onCopy={handleCopy} copying={copyingId === codeResult.id} />}
      </div>

      <div className="card">
        <div className="card-title">Search Community Builds</div>
        <input className="search-bar" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Fighter name, creator, power, or style..." />
        <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>{searching ? "Searching..." : "Search"}</button>
      </div>

      {results.map((b) => <BuildCard key={b.id} build={b} onCopy={handleCopy} copying={copyingId === b.id} />)}

      <div className="card">
        <div className="card-title">My Published Builds ({myPublished.length})</div>
        {myPublished.length === 0 ? <div style={{ fontSize: 13, color: "var(--text-dim)" }}>None published yet.</div> :
          myPublished.map((b) => <div key={b.id} style={{ fontSize: 13, marginBottom: 4 }}>{b.fighter_name} — {b.build_code}</div>)}
      </div>

      <div className="card">
        <div className="card-title">My Unlisted Backups ({myUnlisted.length})</div>
        {myUnlisted.length === 0 ? <div style={{ fontSize: 13, color: "var(--text-dim)" }}>None yet — saving a fighter creates one automatically.</div> :
          myUnlisted.map((b) => <div key={b.id} style={{ fontSize: 13, marginBottom: 4 }}>{b.fighter_name} — {b.build_code}</div>)}
      </div>
    </div>
  );
}
