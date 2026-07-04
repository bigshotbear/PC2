import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  CHARACTER_TYPES,
  FIGHTING_STYLES,
  POWER_SOURCES,
  POWERS,
  SPECIAL_SKILLS,
  WEAKNESSES,
  ULTIMATES,
  POWER_LEVELS,
  ULTIMATE_LEVELS,
  POWER_POINT_CAPS,
  STAT_KEYS,
  calcStatTotal,
  calcPowerPointCost,
  validateFighter
} from "../lib/fighterOptions";
import {
  CHARACTER_TYPE_INFO,
  FIGHTING_STYLE_INFO,
  POWER_SOURCE_INFO,
  computeBadges,
  getMainPowerNote,
  getSecondaryPowerNote,
  getSpecialSkillNote,
  nextStatBadgeHint
} from "../lib/fighterMeta";
import { calculateFighterBadges, getBadgeProgress, TEAM_BADGE_INFO, MATCHUP_BADGE_INFO } from "../lib/badgeEngine";
import AIBuildCoach from "../components/AIBuildCoach.jsx";
import FighterVisual from "../components/FighterVisual.jsx";
import { reviewMatchesFighter } from "../lib/synergyReview";
import { publishCommunityBuild } from "../lib/communityBuildService";

const STAT_LABELS = {
  strength: "Strength",
  speed: "Speed",
  durability: "Durability",
  battle_iq: "Battle IQ",
  stamina: "Stamina"
};

const emptyFighter = {
  fighter_name: "",
  character_type: CHARACTER_TYPES[0],
  fighting_style: FIGHTING_STYLES[0],
  power_source: POWER_SOURCES[0],
  main_power: POWERS[0],
  main_power_level: 1,
  secondary_power: POWERS[1],
  secondary_power_level: 1,
  special_skill: SPECIAL_SKILLS[0],
  weakness: WEAKNESSES[0],
  ultimate_move: ULTIMATES[0],
  ultimate_level: 1,
  strength: 20,
  speed: 20,
  durability: 20,
  battle_iq: 20,
  stamina: 20,
  power_point_cap: POWER_POINT_CAPS["1v1"]
};

function InfoNote({ children }) {
  return (
    <div style={{
      fontSize: 12.5,
      color: "var(--text-dim)",
      background: "rgba(230,184,74,0.06)",
      border: "1px solid var(--line)",
      borderRadius: 8,
      padding: "8px 10px",
      marginTop: -8,
      marginBottom: 14,
      lineHeight: 1.5
    }}>
      {children}
    </div>
  );
}

export default function FighterBuilder({ user, profile, fighterId, duplicateFrom, onNavigate }) {
  const [fighter, setFighter] = useState(emptyFighter);
  const [loading, setLoading] = useState(!!(fighterId || duplicateFrom));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [facing, setFacing] = useState("right");
  const [showAura, setShowAura] = useState(true);
  const [explanation, setExplanation] = useState("");
  const [review, setReview] = useState(null);

  const isEditing = !!fighterId;

  useEffect(() => {
    const idToLoad = fighterId || duplicateFrom;
    if (!idToLoad) return;

    (async () => {
      setLoading(true);
      const { data, error: loadError } = await supabase
        .from("fighters")
        .select("*")
        .eq("id", idToLoad)
        .single();

      setLoading(false);

      if (loadError) {
        setError("Could not load fighter: " + loadError.message);
        return;
      }

      if (data) {
        const { id, created_at, updated_at, owner_id, is_valid_build, stat_total, power_point_cost, synergy_explanation, ai_synergy_review, ...rest } = data;
        setFighter({ ...emptyFighter, ...rest, fighter_name: duplicateFrom ? `${rest.fighter_name} (Copy)` : rest.fighter_name });
        setExplanation(synergy_explanation || "");
        if (ai_synergy_review && ai_synergy_review.status) setReview(ai_synergy_review);
      }
    })();
  }, [fighterId, duplicateFrom]);

  const update = (key, value) => setFighter((f) => ({ ...f, [key]: value }));

  const statTotal = calcStatTotal(fighter);
  const powerPointCost = calcPowerPointCost(fighter);
  const cap = fighter.power_point_cap;
  const overCap = powerPointCost > cap;

  const statBannerClass = statTotal === 100 ? "valid" : statTotal > 100 ? "over" : "under";
  const statBannerText =
    statTotal === 100 ? "Valid stat build." : statTotal > 100 ? "Too many stat points." : "You still have stat points left.";

  const specialCost = fighter.special_skill && fighter.special_skill !== "None" ? 1 : 0;

  const badges = useMemo(() => calculateFighterBadges(fighter, powerPointCost, cap), [fighter, powerPointCost, cap]);
  const badgeProgressList = useMemo(() => getBadgeProgress(fighter, powerPointCost, cap), [fighter, powerPointCost, cap]);
  const almostBadges = useMemo(
    () => badgeProgressList.filter((b) => !b.level && b.matchCount >= 1).sort((a, b) => b.matchCount - a.matchCount).slice(0, 5),
    [badgeProgressList]
  );
  const statGoals = useMemo(() => computeBadges(fighter, powerPointCost, cap), [fighter, powerPointCost, cap]);
  const earnedBadges = statGoals.filter((b) => b.progress >= 1);
  const closeBadges = statGoals.filter((b) => b.progress < 1 && b.progress >= 0.5).slice(0, 3);

  const typeInfo = CHARACTER_TYPE_INFO[fighter.character_type];
  const styleInfo = FIGHTING_STYLE_INFO[fighter.fighting_style];
  const sourceInfo = POWER_SOURCE_INFO[fighter.power_source];
  const mainPowerNote = useMemo(() => getMainPowerNote(fighter), [fighter]);
  const secondaryPowerNote = useMemo(() => getSecondaryPowerNote(fighter), [fighter]);
  const specialSkillNote = useMemo(() => getSpecialSkillNote(fighter), [fighter]);

  const handleStatChange = (key, raw) => {
    const value = Math.max(0, Math.min(100, Number(raw) || 0));
    update(key, value);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const { isValid, errors } = validateFighter(fighter);
    if (!isValid) {
      setError(errors.join(" "));
      return;
    }

    setSaving(true);

    const reviewValid = review && reviewMatchesFighter(review, fighter) && ["approved", "partially_approved"].includes(review.status);

    const payload = {
      owner_id: user.id,
      fighter_name: fighter.fighter_name.trim(),
      character_type: fighter.character_type,
      fighting_style: fighter.fighting_style,
      power_source: fighter.power_source,
      main_power: fighter.main_power,
      main_power_level: Number(fighter.main_power_level),
      secondary_power: fighter.secondary_power,
      secondary_power_level: Number(fighter.secondary_power_level),
      special_skill: fighter.special_skill,
      weakness: fighter.weakness,
      ultimate_move: fighter.ultimate_move,
      ultimate_level: Number(fighter.ultimate_level),
      strength: Number(fighter.strength),
      speed: Number(fighter.speed),
      durability: Number(fighter.durability),
      battle_iq: Number(fighter.battle_iq),
      stamina: Number(fighter.stamina),
      stat_total: statTotal,
      power_point_cap: Number(cap),
      power_point_cost: powerPointCost,
      is_valid_build: true,
      synergy_explanation: explanation,
      ai_synergy_review: reviewValid ? review : {},
      ai_synergy_modifier: reviewValid ? Math.min(4, review.modifierPercent || 0) : 0,
      ai_synergy_updated_at: reviewValid ? new Date().toISOString() : null,
      visual_config: {
        characterType: fighter.character_type, fightingStyle: fighter.fighting_style,
        powerSource: fighter.power_source, mainPower: fighter.main_power,
        secondaryPower: fighter.secondary_power, specialSkill: fighter.special_skill,
        ultimateMove: fighter.ultimate_move
      },
      visual_version: 1,
      updated_at: new Date().toISOString()
    };

    let saveError, savedRow;
    if (isEditing) {
      ({ error: saveError } = await supabase.from("fighters").update(payload).eq("id", fighterId));
      savedRow = { id: fighterId, owner_id: user.id, ...payload };
    } else {
      const insertResult = await supabase.from("fighters").insert(payload).select().single();
      saveError = insertResult.error;
      savedRow = insertResult.data;
    }

    setSaving(false);

    if (saveError) {
      setError("Save failed: " + saveError.message);
      return;
    }

    if (savedRow) {
      publishCommunityBuild(savedRow, profile?.display_name).catch(() => {});
    }

    setSuccess(isEditing ? "Fighter updated." : "Fighter saved.");
    setTimeout(() => onNavigate("savedFighters"), 600);
  };

  if (loading) {
    return (
      <div className="page center" style={{ minHeight: "60vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => onNavigate("dashboard")}>← Back</button>
      </div>

      <h2 style={{ marginBottom: 16, color: "var(--gold-bright)", textTransform: "uppercase" }}>
        {isEditing ? "Edit Fighter" : "Fighter Builder"}
      </h2>

      <div className="preview-stack" style={{ height: 240 }}>
        <FighterVisual fighter={fighter} size={210} facing={facing} animated showAura={showAura} />
        <div className="preview-badge">
          <span className="chip">{fighter.character_type}</span>
          <span className="chip">{fighter.power_source}</span>
          <span className="chip">{fighter.fighting_style}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className="btn btn-ghost" style={{ marginBottom: 0, width: "auto", padding: "10px 14px" }} onClick={() => setFacing((f) => (f === "right" ? "left" : "right"))}>↔ Flip</button>
        <button className="btn btn-ghost" style={{ marginBottom: 0, width: "auto", padding: "10px 14px" }} onClick={() => setShowAura((a) => !a)}>{showAura ? "Hide Aura" : "Show Aura"}</button>
      </div>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      <div className="card card-glow">
        <div className="card-title">Badge Tracker</div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>Badges Earned</div>
        {badges.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>No badges unlocked yet.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {badges.map((b) => (
              <span key={b.name} className="chip" title={`${b.description} (${b.reasons.join(", ")})`}
                style={{ borderColor: b.level === "Gold" ? "var(--gold-bright)" : b.level === "Silver" ? "#b7bfc9" : "#c17a4a", color: b.level === "Gold" ? "var(--gold-bright)" : b.level === "Silver" ? "#b7bfc9" : "#c17a4a" }}>
                {b.level === "Gold" ? "🥇" : b.level === "Silver" ? "🥈" : "🥉"} {b.name}
              </span>
            ))}
          </div>
        )}

        {almostBadges.length > 0 && (
          <>
            <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>Badges Almost Unlocked</div>
            {almostBadges.map((b) => (
              <div key={b.name} style={{ fontSize: 12.5, marginBottom: 6 }}>
                <strong>{b.name}</strong> <span style={{ color: "var(--text-dim)" }}>({b.category})</span>
                <div style={{ color: "var(--gold)" }}>→ {b.nextStep}</div>
              </div>
            ))}
          </>
        )}

        <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", margin: "10px 0 6px" }}>Potential Team / Matchup Badges</div>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.6 }}>
          {TEAM_BADGE_INFO.slice(0, 3).map((b) => <div key={b.name}>• <strong>{b.name}</strong> (Team): {b.requirement}</div>)}
          {MATCHUP_BADGE_INFO.map((b) => <div key={b.name}>• <strong>{b.name}</strong> (Matchup): {b.requirement}</div>)}
        </div>

        <button className="btn" style={{ marginTop: 12, marginBottom: 0 }} onClick={() => onNavigate("badgeGuide", { fighterId: fighterId || null })}>
          View Full Badge Guide
        </button>
      </div>

      {(earnedBadges.length > 0 || closeBadges.length > 0) && (
        <div className="card card-glow">
          <div className="card-title">Stat Goals</div>
          {earnedBadges.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: closeBadges.length ? 12 : 0 }}>
              {earnedBadges.map((b) => (
                <span key={b.name} className="chip" title={b.requirement} style={{ background: "rgba(230,184,74,0.18)" }}>
                  ★ {b.name}
                </span>
              ))}
            </div>
          )}
          {closeBadges.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>Close to earning</div>
              {closeBadges.map((b) => (
                <div key={b.name} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-dim)" }}>{b.name}</span>
                    <span style={{ color: "var(--text-dim)" }}>{b.requirement}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 4, background: "#262b38", marginTop: 3 }}>
                    <div style={{ height: "100%", width: `${b.progress * 100}%`, borderRadius: 4, background: "var(--gold-dim)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="field">
          <label>Fighter Name</label>
          <input
            type="text"
            value={fighter.fighter_name}
            onChange={(e) => update("fighter_name", e.target.value)}
            placeholder="e.g. Aqua Knight"
          />
        </div>

        <div className="field">
          <label>Character Type</label>
          <select value={fighter.character_type} onChange={(e) => update("character_type", e.target.value)}>
            {CHARACTER_TYPES.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {typeInfo && <InfoNote><strong>{typeInfo.blurb}</strong> {typeInfo.perk}</InfoNote>}

        <div className="field">
          <label>Fighting Style</label>
          <select value={fighter.fighting_style} onChange={(e) => update("fighting_style", e.target.value)}>
            {FIGHTING_STYLES.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {styleInfo && (
          <InfoNote>
            <strong>Pro:</strong> {styleInfo.pro}<br />
            <strong>Con:</strong> {styleInfo.con}<br />
            <strong>Pairs well with:</strong> {styleInfo.pairsWith}
          </InfoNote>
        )}

        <div className="field">
          <label>Power Source</label>
          <select value={fighter.power_source} onChange={(e) => update("power_source", e.target.value)}>
            {POWER_SOURCES.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {sourceInfo && <InfoNote>{sourceInfo}</InfoNote>}
      </div>

      <div className="card">
        <div className="card-title">Planned Mode / Power Cap</div>
        <div className="field" style={{ marginBottom: 8 }}>
          <select value={cap} onChange={(e) => update("power_point_cap", Number(e.target.value))}>
            <option value={POWER_POINT_CAPS["1v1"]}>1v1 — cap 10</option>
            <option value={POWER_POINT_CAPS["2v2"]}>2v2 — cap 9</option>
            <option value={POWER_POINT_CAPS["3v3"]}>3v3 — cap 8</option>
            <option value={POWER_POINT_CAPS["5v5"]}>5v5 — cap 7</option>
          </select>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
          Main {fighter.main_power_level} + Secondary {fighter.secondary_power_level} + Ultimate {fighter.ultimate_level} + Special Skill {specialCost}
          {" "}= <strong style={{ color: overCap ? "var(--loss)" : "var(--gold-bright)" }}>{powerPointCost}</strong> / {cap}
        </div>
        {overCap && (
          <div className="error-box" style={{ marginTop: 10, marginBottom: 0 }}>
            Over the cap by {powerPointCost - cap}. Lower a level before you can save.
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Powers &amp; Abilities</div>

        <div className="field">
          <label>Main Power</label>
          <select value={fighter.main_power} onChange={(e) => update("main_power", e.target.value)}>
            {POWERS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {mainPowerNote && <InfoNote>{mainPowerNote}</InfoNote>}
        <div className="field">
          <label>Main Power Level</label>
          <select value={fighter.main_power_level} onChange={(e) => update("main_power_level", Number(e.target.value))}>
            {POWER_LEVELS.map((lvl) => <option key={lvl.value} value={lvl.value}>{lvl.label} (cost {lvl.cost})</option>)}
          </select>
        </div>

        <div className="field">
          <label>Secondary Power</label>
          <select value={fighter.secondary_power} onChange={(e) => update("secondary_power", e.target.value)}>
            {POWERS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {secondaryPowerNote && <InfoNote>{secondaryPowerNote}</InfoNote>}
        <div className="field">
          <label>Secondary Power Level</label>
          <select value={fighter.secondary_power_level} onChange={(e) => update("secondary_power_level", Number(e.target.value))}>
            {POWER_LEVELS.map((lvl) => <option key={lvl.value} value={lvl.value}>{lvl.label} (cost {lvl.cost})</option>)}
          </select>
        </div>

        <div className="field">
          <label>Special Skill {specialCost > 0 ? "(costs 1)" : "(free — None costs 0)"}</label>
          <select value={fighter.special_skill} onChange={(e) => update("special_skill", e.target.value)}>
            {SPECIAL_SKILLS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {specialSkillNote && <InfoNote>{specialSkillNote}</InfoNote>}

        <div className="field">
          <label>Ultimate Move</label>
          <select value={fighter.ultimate_move} onChange={(e) => update("ultimate_move", e.target.value)}>
            {ULTIMATES.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {fighter.ultimate_move === "One Huge Attack" && (
          <InfoNote>
            High risk, high reward: this Ultimate swings hard but is inconsistent round to round —
            it won't reliably carry a fight the way a sustained Ultimate does.
          </InfoNote>
        )}
        <div className="field">
          <label>Ultimate Level</label>
          <select value={fighter.ultimate_level} onChange={(e) => update("ultimate_level", Number(e.target.value))}>
            {ULTIMATE_LEVELS.map((lvl) => <option key={lvl.value} value={lvl.value}>{lvl.label} (cost {lvl.cost})</option>)}
          </select>
        </div>

        <div className="field">
          <label>Weakness</label>
          <select value={fighter.weakness} onChange={(e) => update("weakness", e.target.value)}>
            {WEAKNESSES.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Stats — must total exactly 100</div>
        {STAT_KEYS.map((key) => {
          const hint = nextStatBadgeHint(fighter, key);
          return (
            <div className="field" key={key}>
              <label>{STAT_LABELS[key]}</label>
              <input
                type="number"
                min={0}
                max={100}
                value={fighter[key]}
                onChange={(e) => handleStatChange(key, e.target.value)}
              />
              {hint && (
                <div style={{ fontSize: 12, color: hint.earned ? "var(--win)" : "var(--gold)", marginTop: 4 }}>
                  {hint.earned ? "✓ " : "→ "}{hint.text}
                </div>
              )}
            </div>
          );
        })}

        <div className={`stat-banner ${statBannerClass}`}>
          {statTotal} / 100 — {statBannerText}
        </div>
      </div>

      <AIBuildCoach
        fighter={fighter}
        explanation={explanation}
        setExplanation={setExplanation}
        review={review}
        setReview={setReview}
      />

      <button className="btn btn-primary" onClick={handleSave} disabled={saving || overCap || statTotal !== 100}>
        {saving ? "Saving..." : isEditing ? "Update Fighter" : "Save Fighter"}
      </button>
    </div>
  );
}
