import React, { useState } from "react";
import { analyzeBuildSynergy, reviewMatchesFighter } from "../lib/synergyReview";

const STATUS_COLORS = { approved: "var(--win)", partially_approved: "var(--gold-bright)", rejected: "var(--loss)" };
const STATUS_LABELS = { approved: "APPROVED", partially_approved: "PARTIALLY APPROVED", rejected: "REJECTED" };

/**
 * Embedded (not a separate page/route) coach panel. Lives inside Fighter
 * Builder between the power selections and Save. Parent owns explanation +
 * review state so they save with the fighter.
 */
export default function AIBuildCoach({ fighter, explanation, setExplanation, review, setReview }) {
  const [open, setOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const stale = review && !reviewMatchesFighter(review, fighter);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeBuildSynergy(fighter, explanation);
    setReview(result);
    setAnalyzing(false);
  };

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", background: "none", border: "none", color: "var(--gold-bright)", textAlign: "left", padding: 0, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.08em" }}
      >
        <span>⚡ CLASH COACH — EXPLAIN YOUR STRATEGY</span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 10 }}>
            Explain how your powers, style, and stats work together. I'll analyze the strategy,
            strengths, weaknesses, counters, and whether the combination deserves a creative
            synergy bonus (max 4%, situational only).
          </div>

          <div className="field" style={{ marginBottom: 10 }}>
            <label>Explain how your build works</label>
            <textarea
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder='e.g. "I use Wind Control to create a tailwind and reduce drag while moving at Super Speed..."'
            />
          </div>

          <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing || !explanation.trim()}>
            {analyzing ? "Analyzing..." : "Analyze My Build"}
          </button>

          {stale && (
            <div className="error-box" style={{ marginTop: 10 }}>
              Your build changed. Re-analyze this synergy — the old bonus won't apply until you do.
            </div>
          )}

          {review && !stale && (
            <div style={{ marginTop: 12, border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <strong style={{ color: "var(--gold-bright)" }}>{review.title}</strong>
                <span style={{ fontSize: 12, color: STATUS_COLORS[review.status] }}>{STATUS_LABELS[review.status]}</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>{review.summary}</div>

              {review.modifierPercent > 0 && (
                <div style={{ fontSize: 13, color: "var(--win)", marginBottom: 8 }}>
                  Battle bonus: +{review.modifierPercent}% ({review.modifierType}) — situational, capped at 4%.
                </div>
              )}

              {review.pros?.length > 0 && (
                <div style={{ fontSize: 12.5, marginBottom: 6 }}>
                  <span style={{ color: "var(--win)" }}>Pros:</span> {review.pros.join(" · ")}
                </div>
              )}
              {review.cons?.length > 0 && (
                <div style={{ fontSize: 12.5, marginBottom: 6 }}>
                  <span style={{ color: "var(--loss)" }}>Cons:</span> {review.cons.join(" · ")}
                </div>
              )}
              {review.conditions?.length > 0 && (
                <div style={{ fontSize: 12.5, marginBottom: 6, color: "var(--text-dim)" }}>
                  Conditions: {review.conditions.join(" · ")}
                </div>
              )}
              {review.counters?.length > 0 && (
                <div style={{ fontSize: 12.5, marginBottom: 6, color: "var(--text-dim)" }}>
                  Countered by: {review.counters.join(" · ")}
                </div>
              )}
              {review.badgeSuggestions?.length > 0 && (
                <div style={{ fontSize: 12.5, color: "var(--gold)" }}>
                  Badge opportunities: {review.badgeSuggestions.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
