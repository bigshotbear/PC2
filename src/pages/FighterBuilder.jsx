import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  CHARACTER_TYPES, FIGHTING_STYLES, POWER_SOURCES, POWERS, SPECIAL_SKILLS,
  WEAKNESSES, ULTIMATES, POWER_LEVELS, ULTIMATE_LEVELS, POWER_POINT_CAPS, STAT_KEYS,
  calcStatTotal, calcPowerPointCost, validateFighter
} from "../lib/fighterOptions";
import {
  CHARACTER_TYPE_INFO, FIGHTING_STYLE_INFO, POWER_SOURCE_INFO,
  getMainPowerNote, getSecondaryPowerNote, getSpecialSkillNote, nextStatBadgeHint
} from "../lib/fighterMeta";
import { calculateFighterBadges } from "../lib/badgeEngine";
import { reviewMatchesFighter } from "../lib/synergyReview";
import { publishCommunityBuild } from "../lib/communityBuildService";

import BuilderProgress from "../components/BuilderProgress.jsx";
import ChoiceCard from "../components/ChoiceCard.jsx";
import DetailsDrawer from "../components/DetailsDrawer.jsx";
import FighterPreview from "../components/FighterPreview.jsx";
import BuildSummary from "../components/BuildSummary.jsx";
import PowerBudgetMeter from "../components/PowerBudgetMeter.jsx";
import BadgeProgress from "../components/BadgeProgress.jsx";
import LiveClashCoach from "../components/LiveClashCoach.jsx";
import StatDonutChart from "../components/StatDonutChart.jsx";
import HelpGuideModal from "../components/HelpGuideModal.jsx";
import FighterReviewCard from "../components/FighterReviewCard.jsx";
import AIBuildCoach from "../components/AIBuildCoach.jsx";

const STAT_LABELS = { strength: "Strength", speed: "Speed", durability: "Durability", battle_iq: "Battle IQ", stamina: "Stamina" };
const AURA_SWATCHES = ["#e6b84a", "#ff6a3d", "#3da9ff", "#8b5cf6", "#4ade80", "#f472b6", "#38bdf8", "#ff5468"];

const STYLE_BEST = {
  Brawler: "Strength, Durability, Stamina", Assassin: "Speed, Battle IQ", Tank: "Durability, Stamina",
  Defender: "Durability, Stamina", Speedster: "Speed", Mage: "Battle IQ, Power levels", Sniper: "Battle IQ, Speed",
  Summoner: "Battle IQ, Stamina", Strategist: "Battle IQ", Tactician: "Battle IQ",
  "Weapon Master": "Strength, Battle IQ", "Support/Healer": "Stamina, Battle IQ", Balanced: "Even spread"
};
const STYLE_WATCH = {
  Brawler: "Fast or long-range fighters", Assassin: "High-Durability tanks", Tank: "Low initiative vs Speedsters",
  Defender: "Low initiative vs Speedsters", Speedster: "Fades in longer fights", Mage: "Needs Battle IQ to land reliably",
  Sniper: "Rushed down early", Summoner: "Needs Stamina to sustain", Strategist: "Lower raw physical output",
  Tactician: "Lower raw physical output", "Weapon Master": "Needs both Strength and IQ invested",
  "Support/Healer": "Lowest solo damage", Balanced: "No standout strength"
};

const emptyFighter = {
  fighter_name: "", character_type: CHARACTER_TYPES[0], fighting_style: FIGHTING_STYLES[0], power_source: POWER_SOURCES[0],
  main_power: POWERS[0], main_power_level: 1, secondary_power: POWERS[1], secondary_power_level: 1,
  special_skill: SPECIAL_SKILLS[0], weakness: WEAKNESSES[0], ultimate_move: ULTIMATES[0], ultimate_level: 1,
  strength: 20, speed: 20, durability: 20, battle_iq: 20, stamina: 20,
  power_point_cap: POWER_POINT_CAPS["1v1"], visual_config: {}
};

export default function FighterBuilder({ user, profile, fighterId, duplicateFrom, onNavigate }) {
  const [fighter, setFighter] = useState(emptyFighter);
  const [loading, setLoading] = useState(!!(fighterId || duplicateFrom));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [step, setStep] = useState(0);
  const [builderMode, setBuilderMode] = useState(() => localStorage.getItem("pc_builder_mode") || null);
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem("pc_builder_seen_intro"));
  const [details, setDetails] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showSummaryMobile, setShowSummaryMobile] = useState(false);

  const [explanation, setExplanation] = useState("");
  const [review, setReview] = useState(null);

  const isEditing = !!fighterId;

  useEffect(() => {
    const idToLoad = fighterId || duplicateFrom;
    if (!idToLoad) return;
    (async () => {
      setLoading(true);
      const { data, error: loadError } = await supabase.from("fighters").select("*").eq("id", idToLoad).single();
      setLoading(false);
      if (loadError) { setError("Could not load fighter: " + loadError.message); return; }
      if (data) {
        const { id, created_at, updated_at, owner_id, is_valid_build, stat_total, power_point_cost, synergy_explanation, ai_synergy_review, ...rest } = data;
        setFighter({ ...emptyFighter, ...rest, fighter_name: duplicateFrom ? `${rest.fighter_name} (Copy)` : rest.fighter_name });
        setExplanation(synergy_explanation || "");
        if (ai_synergy_review && ai_synergy_review.status) setReview(ai_synergy_review);
      }
    })();
  }, [fighterId, duplicateFrom]);

  const update = (key, value) => setFighter((f) => ({ ...f, [key]: value }));
  const updateVisual = (key, value) => setFighter((f) => ({ ...f, visual_config: { ...f.visual_config, [key]: value } }));

  const statTotal = calcStatTotal(fighter);
  const powerPointCost = calcPowerPointCost(fighter);
  const cap = fighter.power_point_cap;
  const overCap = powerPointCost > cap;

  const badges = useMemo(() => calculateFighterBadges(fighter, powerPointCost, cap), [fighter, powerPointCost, cap]);
  const almostBadges = useMemo(() => {
    const boosted = { ...fighter, strength: fighter.strength + 5, speed: fighter.speed + 5, durability: fighter.durability + 5, battle_iq: fighter.battle_iq + 5, stamina: fighter.stamina + 5 };
    const all = calculateFighterBadges(boosted, powerPointCost, cap);
    return all.filter((b) => !badges.some((e) => e.name === b.name));
  }, [fighter, powerPointCost, cap, badges]);

  const mainPowerNote = useMemo(() => getMainPowerNote(fighter), [fighter]);
  const secondaryPowerNote = useMemo(() => getSecondaryPowerNote(fighter), [fighter]);
  const specialSkillNote = useMemo(() => getSpecialSkillNote(fighter), [fighter]);

  const handleChooseMode = (mode) => {
    setBuilderMode(mode);
    localStorage.setItem("pc_builder_mode", mode);
    localStorage.setItem("pc_builder_seen_intro", "1");
    setShowIntro(false);
  };

  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSave = async (andFight = false) => {
    setError("");
    setSuccess("");
    const { isValid, errors } = validateFighter(fighter);
    if (!isValid) { setError(errors.join(" ")); setStep(2); return; }

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
      strength: Number(fighter.strength), speed: Number(fighter.speed), durability: Number(fighter.durability),
      battle_iq: Number(fighter.battle_iq), stamina: Number(fighter.stamina),
      stat_total: statTotal, power_point_cap: Number(cap), power_point_cost: powerPointCost,
      is_valid_build: true,
      synergy_explanation: explanation,
      ai_synergy_review: reviewValid ? review : {},
      ai_synergy_modifier: reviewValid ? Math.min(4, review.modifierPercent || 0) : 0,
      ai_synergy_updated_at: reviewValid ? new Date().toISOString() : null,
      visual_config: fighter.visual_config || {},
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
    if (saveError) { setError("Save failed: " + saveError.message); return; }
    if (savedRow) publishCommunityBuild(savedRow, profile?.display_name).catch(() => {});

    if (andFight) {
      onNavigate("battleFlow", { mode: "computer", singlePlayerMode: "ai", preselectedFighterId: savedRow.id });
      return;
    }
    setSuccess(isEditing ? "Fighter updated." : "Fighter saved.");
    setTimeout(() => onNavigate("savedFighters"), 500);
  };

  if (loading) {
    return <div className="page center" style={{ minHeight: "60vh" }}><div className="spinner" /></div>;
  }

  if (showIntro) {
    return (
      <div className="page">
        <div className="card card-glow">
          <h2 style={{ color: "var(--gold-bright)", textTransform: "uppercase", marginBottom: 10 }}>Build Your Fighter</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>
            Build your fighter in five easy steps.<br /><br />
            You will choose:<br />
            • Who they are<br />
            • How they fight<br />
            • What powers they use<br />
            • Their strengths and weaknesses<br />
            • How they look<br /><br />
            You can change anything before saving.
          </p>
        </div>
        <button className="card mode-card" onClick={() => handleChooseMode("guided")} style={{ width: "100%", border: "1px solid var(--gold)" }}>
          <div className="mode-icon">🎓</div>
          <div><div className="mode-card-title">Guided Build</div><div className="mode-card-sub">Recommended for new players — explanations and recommendations included.</div></div>
        </button>
        <button className="card mode-card" onClick={() => handleChooseMode("quick")} style={{ width: "100%" }}>
          <div className="mode-icon">⚡</div>
          <div><div className="mode-card-title">Quick Build</div><div className="mode-card-sub">For experienced players — a more compact interface.</div></div>
        </button>
      </div>
    );
  }

  const guided = builderMode !== "quick";

  return (
    <div className="page">
      <div className="topbar" style={{ position: "static", background: "none", border: "none", padding: 0, marginBottom: 12 }}>
        <button className="back-btn" onClick={() => onNavigate("dashboard")}>← Back</button>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="chip" style={{ cursor: "pointer" }} onClick={() => setBuilderMode(guided ? "quick" : "guided")}>
            {guided ? "Guided" : "Quick"} Build
          </button>
          <button className="chip" style={{ cursor: "pointer", borderColor: "#c084fc", color: "#c084fc" }} onClick={() => setShowHelp(true)}>Help</button>
        </div>
      </div>

      <BuilderProgress currentStep={step} onJump={setStep} />

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      <FighterPreview fighter={fighter} />

      <button className="btn btn-ghost" onClick={() => setShowSummaryMobile((s) => !s)}>
        {showSummaryMobile ? "Hide" : "View"} Build Summary
      </button>
      {showSummaryMobile && (
        <BuildSummary fighter={fighter} statTotal={statTotal} powerPointCost={powerPointCost} cap={cap} badges={badges} almostBadges={almostBadges} />
      )}

      {step === 0 && (
        <>
          <div className="card">
            <div className="field">
              <label>Fighter Name</label>
              <input type="text" value={fighter.fighter_name} onChange={(e) => update("fighter_name", e.target.value)} placeholder="e.g. Aqua Knight" />
            </div>
          </div>

          <div className="card-title" style={{ marginBottom: 6 }}>Character Type</div>
          {CHARACTER_TYPES.map((t) => {
            const info = CHARACTER_TYPE_INFO[t];
            return (
              <ChoiceCard
                key={t} title={t} tagline={info?.blurb} best={info?.perk}
                selected={fighter.character_type === t}
                onSelect={() => update("character_type", t)}
                onDetails={() => setDetails({ title: t, body: <div>{info?.blurb} {info?.perk}</div> })}
              />
            );
          })}

          <div className="card-title" style={{ marginBottom: 6, marginTop: 12 }}>Fighting Style</div>
          {FIGHTING_STYLES.map((s) => {
            const info = FIGHTING_STYLE_INFO[s];
            return (
              <ChoiceCard
                key={s} title={s} tagline={info?.pro} best={STYLE_BEST[s]} watch={STYLE_WATCH[s]}
                selected={fighter.fighting_style === s}
                onSelect={() => update("fighting_style", s)}
                onDetails={() => setDetails({ title: s, body: <div><strong>Pro:</strong> {info?.pro}<br /><strong>Con:</strong> {info?.con}<br /><strong>Pairs well with:</strong> {info?.pairsWith}</div> })}
              />
            );
          })}
        </>
      )}

      {step === 1 && (
        <>
          <PowerBudgetMeter cost={powerPointCost} cap={cap} />

          <div className="card">
            <div className="field">
              <label>Planned Mode / Power Cap</label>
              <select value={cap} onChange={(e) => update("power_point_cap", Number(e.target.value))}>
                <option value={POWER_POINT_CAPS["1v1"]}>1v1 — cap 10</option>
                <option value={POWER_POINT_CAPS["2v2"]}>2v2 — cap 9</option>
                <option value={POWER_POINT_CAPS["3v3"]}>3v3 — cap 8</option>
                <option value={POWER_POINT_CAPS["5v5"]}>5v5 — cap 7</option>
              </select>
            </div>

            <div className="field">
              <label>Power Source</label>
              <select value={fighter.power_source} onChange={(e) => update("power_source", e.target.value)}>
                {POWER_SOURCES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {guided && <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>{POWER_SOURCE_INFO[fighter.power_source]}</div>}

            <div className="field">
              <label>Main Power</label>
              <select value={fighter.main_power} onChange={(e) => update("main_power", e.target.value)}>
                {POWERS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Main Power Level</label>
              <select value={fighter.main_power_level} onChange={(e) => update("main_power_level", Number(e.target.value))}>
                {POWER_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label} — Cost: {l.cost}</option>)}
              </select>
            </div>
            {guided && mainPowerNote && <div style={{ fontSize: 12, color: "var(--gold)", marginBottom: 10 }}>{mainPowerNote}</div>}

            <div className="field">
              <label>Secondary Power</label>
              <select value={fighter.secondary_power} onChange={(e) => update("secondary_power", e.target.value)}>
                {POWERS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Secondary Power Level</label>
              <select value={fighter.secondary_power_level} onChange={(e) => update("secondary_power_level", Number(e.target.value))}>
                {POWER_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label} — Cost: {l.cost}</option>)}
              </select>
            </div>
            {guided && secondaryPowerNote && <div style={{ fontSize: 12, color: "var(--gold)", marginBottom: 10 }}>{secondaryPowerNote}</div>}

            <div className="field">
              <label>Special Skill {fighter.special_skill !== "None" ? "(costs 1)" : "(free)"}</label>
              <select value={fighter.special_skill} onChange={(e) => update("special_skill", e.target.value)}>
                {SPECIAL_SKILLS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {guided && specialSkillNote && <div style={{ fontSize: 12, color: "var(--gold)", marginBottom: 10 }}>{specialSkillNote}</div>}

            <div className="field">
              <label>Ultimate Move</label>
              <select value={fighter.ultimate_move} onChange={(e) => update("ultimate_move", e.target.value)}>
                {ULTIMATES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Ultimate Level</label>
              <select value={fighter.ultimate_level} onChange={(e) => update("ultimate_level", Number(e.target.value))}>
                {ULTIMATE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label} — Cost: {l.cost}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Weakness</label>
              <select value={fighter.weakness} onChange={(e) => update("weakness", e.target.value)}>
                {WEAKNESSES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <BadgeProgress title="Badge Opportunities" items={badges.slice(0, 3).map((b) => `${b.name} (${b.level})`)} />

          {guided && <LiveClashCoach fighter={fighter} statTotal={statTotal} powerPointCost={powerPointCost} cap={cap} />}
          <AIBuildCoach fighter={fighter} explanation={explanation} setExplanation={setExplanation} review={review} setReview={setReview} />
        </>
      )}

      {step === 2 && (
        <>
          <StatDonutChart stats={{ strength: fighter.strength, speed: fighter.speed, durability: fighter.durability, battle_iq: fighter.battle_iq, stamina: fighter.stamina }} />

          <div className="card">
            <div className="card-title">Stats — must total exactly 100</div>
            {STAT_KEYS.map((key) => {
              const hint = nextStatBadgeHint(fighter, key);
              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>{STAT_LABELS[key]}</label>
                    <span style={{ color: "var(--gold-bright)", fontWeight: 700 }}>{fighter[key]}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button className="icon-btn" onClick={() => update(key, Math.max(0, fighter[key] - 1))}>−</button>
                    <input type="range" min={0} max={100} value={fighter[key]} onChange={(e) => update(key, Number(e.target.value))} style={{ flex: 1 }} />
                    <button className="icon-btn" onClick={() => update(key, Math.min(100, fighter[key] + 1))}>+</button>
                  </div>
                  {hint && <div style={{ fontSize: 11.5, color: hint.earned ? "var(--win)" : "var(--gold)", marginTop: 3 }}>{hint.earned ? "✓ " : "→ "}{hint.text}</div>}
                </div>
              );
            })}
            <div className={`stat-banner ${statTotal === 100 ? "valid" : statTotal > 100 ? "over" : "under"}`}>
              {statTotal} / 100 — {statTotal === 100 ? "Valid stat build." : statTotal > 100 ? "Too many stat points." : "You still have stat points left."}
            </div>
          </div>
        </>
      )}

      {step === 3 && (
        <div className="card">
          <div className="card-title">Aura Color</div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 10 }}>
            Overrides the default color tied to your Power Source. Purely visual — no gameplay effect.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {AURA_SWATCHES.map((c) => (
              <button
                key={c} onClick={() => updateVisual("auraColor", c)}
                style={{
                  width: 34, height: 34, borderRadius: "50%", background: c, cursor: "pointer",
                  border: fighter.visual_config?.auraColor === c ? "3px solid white" : "1px solid var(--line)"
                }}
              />
            ))}
            <button className="btn btn-ghost" style={{ width: "auto", padding: "6px 12px", marginBottom: 0 }} onClick={() => updateVisual("auraColor", null)}>Use Default</button>
          </div>

          <div className="card-title">Portrait</div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
            Custom portrait uploads are available from the Saved Fighters card after saving.
          </div>
        </div>
      )}

      {step === 4 && (
        <FighterReviewCard fighter={fighter} statTotal={statTotal} powerPointCost={powerPointCost} cap={cap} badgeCount={badges.length} />
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {step > 0 && <button className="btn" style={{ marginBottom: 0 }} onClick={goBack}>Back</button>}
        {step < 4 && <button className="btn btn-primary" style={{ marginBottom: 0 }} onClick={goNext}>Continue</button>}
      </div>

      {step === 4 && (
        <>
          <button className="btn btn-ghost" onClick={() => setStep(0)}>Edit Build</button>
          <button className="btn btn-primary" onClick={() => handleSave(false)} disabled={saving || overCap || statTotal !== 100}>
            {saving ? "Saving..." : "Save Fighter"}
          </button>
          <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving || overCap || statTotal !== 100}>
            Save and Fight
          </button>
        </>
      )}

      {details && <DetailsDrawer title={details.title} onClose={() => setDetails(null)}>{details.body}</DetailsDrawer>}
      {showHelp && <HelpGuideModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
