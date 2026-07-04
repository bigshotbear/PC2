import React from "react";
import { AURA_COLORS, TYPE_SHAPES, STYLE_GEAR, POWER_FX, ULT_FX } from "../lib/visualLayerMap";

/**
 * FighterVisual — layered placeholder renderer.
 * Accepts either a `fighter` object or individual props. Every layer is
 * CSS/inline-SVG so it works today; swap layer internals for PNGs later.
 *
 * props: fighter, size (px height, default 200), facing ("right"|"left"),
 * animated (idle float), showAura (default true), state ("idle"|"attack"|"hit"|"ultimate"|"defeat")
 */
export default function FighterVisual({
  fighter = {},
  size = 200,
  facing = "right",
  animated = false,
  showAura = true,
  state = "idle"
}) {
  const type = TYPE_SHAPES[fighter.character_type] || TYPE_SHAPES["Hero"];
  const aura = AURA_COLORS[fighter.power_source] || "#e6b84a";
  const gear = STYLE_GEAR[fighter.fighting_style];
  const mainFx = POWER_FX[fighter.main_power];
  const secFx = POWER_FX[fighter.secondary_power];
  const ultFx = ULT_FX[fighter.ultimate_move];
  const scale = size / 200;
  const flip = facing === "left" ? -1 : 1;

  const stateTransform = {
    idle: "translateX(0)",
    attack: `translateX(${18 * flip}px)`,
    hit: "translateX(0)",
    ultimate: "translateX(0)",
    defeat: "translateY(14px)"
  }[state] || "translateX(0)";

  return (
    <div
      style={{
        position: "relative",
        width: 200 * scale,
        height: 200 * scale,
        transform: `scaleX(${flip})`,
        transition: "transform 0.15s ease",
        opacity: state === "defeat" ? 0.35 : state === "hit" ? 0.55 : 1,
        filter: state === "hit" ? "brightness(1.8)" : "none",
        animation: animated && state === "idle" ? "pcFloat 3s ease-in-out infinite" : "none"
      }}
    >
      <style>{`
        @keyframes pcFloat { 0%,100%{transform:scaleX(${flip}) translateY(0)} 50%{transform:scaleX(${flip}) translateY(-5px)} }
        @keyframes pcPulse { 0%,100%{opacity:.45} 50%{opacity:.75} }
        @keyframes pcSpin { to { transform: rotate(360deg) } }
      `}</style>

      {/* 1. Background aura glow */}
      {showAura && (
        <div style={{
          position: "absolute", inset: 10 * scale, borderRadius: "50%",
          background: aura, filter: `blur(${(state === "ultimate" ? 14 : 22) * scale}px)`,
          opacity: state === "ultimate" ? 0.85 : 0.5,
          transform: state === "ultimate" ? "scale(1.25)" : "scale(1)",
          transition: "all .25s ease", animation: "pcPulse 2.5s ease-in-out infinite"
        }} />
      )}

      {/* 10. Ultimate field (below body) */}
      {ultFx === "field" && (
        <div style={{ position: "absolute", bottom: 6 * scale, left: "15%", width: "70%", height: 16 * scale, borderRadius: "50%", background: aura, opacity: 0.35, filter: "blur(4px)" }} />
      )}
      {ultFx === "summon" && (
        <div style={{ position: "absolute", bottom: 4 * scale, right: 8 * scale, width: 44 * scale, height: 70 * scale, borderRadius: "40% 40% 12% 12%", background: "#11141c", border: `1px solid ${aura}`, opacity: 0.55 }} />
      )}

      {/* Custom uploaded portrait overrides the generated body, keeps aura/FX layers */}
      {fighter.portrait_url && (
        <img
          src={fighter.portrait_url}
          alt={fighter.fighter_name || "Fighter portrait"}
          style={{
            position: "absolute", left: "50%", bottom: 14 * scale,
            width: type.w * scale * 1.3, height: type.h * scale * 1.3,
            marginLeft: -(type.w * scale * 1.3) / 2,
            objectFit: "cover", borderRadius: 14, border: "1px solid #3a4256",
            transform: stateTransform, transition: "transform .18s ease"
          }}
        />
      )}

      {/* 2-3. Base body + type features (hidden when a custom portrait is set) */}
      <div style={{
        position: "absolute", left: "50%", bottom: 14 * scale,
        width: type.w * scale, height: type.h * scale,
        marginLeft: -(type.w * scale) / 2,
        borderRadius: type.r, background: type.tint,
        border: "1px solid #3a4256",
        opacity: fighter.portrait_url ? 0 : 1,
        transform: stateTransform, transition: "transform .18s ease"
      }}>
        {/* head band / mask */}
        {type.extra === "mask" && <div style={{ position: "absolute", top: "14%", left: "12%", right: "12%", height: 8 * scale, background: "#0a0c12", borderRadius: 4 }} />}
        {type.extra === "horns" && <>
          <div style={{ position: "absolute", top: -12 * scale, left: "18%", width: 10 * scale, height: 16 * scale, background: "#4a3b52", borderRadius: "50% 50% 0 0", transform: "rotate(-15deg)" }} />
          <div style={{ position: "absolute", top: -12 * scale, right: "18%", width: 10 * scale, height: 16 * scale, background: "#4a3b52", borderRadius: "50% 50% 0 0", transform: "rotate(15deg)" }} />
        </>}
        {type.extra === "halo" && <div style={{ position: "absolute", top: -16 * scale, left: "50%", width: 40 * scale, height: 8 * scale, marginLeft: -20 * scale, borderRadius: "50%", border: `2px solid ${aura}`, opacity: 0.7 }} />}
        {type.extra === "tech" && <>
          <div style={{ position: "absolute", top: "30%", left: 4 * scale, width: 5 * scale, height: 5 * scale, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
          <div style={{ position: "absolute", top: "48%", right: 4 * scale, width: 5 * scale, height: 5 * scale, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
        </>}
        {type.extra === "marks" && <div style={{ position: "absolute", top: "22%", left: "30%", right: "30%", height: 3 * scale, background: aura, opacity: 0.7, borderRadius: 2, boxShadow: `0 0 8px ${aura}` }} />}
        {type.extra === "runes" && <div style={{ position: "absolute", top: "55%", left: "20%", right: "20%", height: 3 * scale, background: "#f472b6", opacity: 0.6, borderRadius: 2 }} />}
        {type.extra === "spikes" && <div style={{ position: "absolute", top: "20%", left: -8 * scale, width: 12 * scale, height: 12 * scale, background: "#3a2430", transform: "rotate(45deg)" }} />}
        {type.extra === "cloak" && <div style={{ position: "absolute", inset: "35% -8% 0", background: "#181b24", borderRadius: "0 0 40% 40%", opacity: 0.8 }} />}

        {/* eyes */}
        <div style={{ position: "absolute", top: "17%", left: "30%", width: 6 * scale, height: 3 * scale, background: fighter.special_skill === "Monster Instincts" ? "#ff5468" : aura, borderRadius: 2, boxShadow: `0 0 6px ${aura}` }} />
        <div style={{ position: "absolute", top: "17%", right: "30%", width: 6 * scale, height: 3 * scale, background: fighter.special_skill === "Monster Instincts" ? "#ff5468" : aura, borderRadius: 2, boxShadow: `0 0 6px ${aura}` }} />
      </div>

      {/* 5. Fighting style gear */}
      {(gear === "weapon" || fighter.special_skill === "Swordsmanship" || mainFx === "weaponglow" || secFx === "weaponglow") && (
        <div style={{ position: "absolute", bottom: 30 * scale, right: 36 * scale, width: 4 * scale, height: 110 * scale, background: "var(--gold-bright)", borderRadius: 2, boxShadow: "0 0 10px var(--gold-bright)", transform: "rotate(18deg)" }} />
      )}
      {gear === "shield" && (
        <div style={{ position: "absolute", bottom: 40 * scale, left: 30 * scale, width: 34 * scale, height: 46 * scale, borderRadius: "50% 50% 45% 45%", border: `2px solid ${aura}`, background: "rgba(61,169,255,0.12)" }} />
      )}
      {gear === "fists" && <>
        <div style={{ position: "absolute", bottom: 52 * scale, left: 34 * scale, width: 16 * scale, height: 16 * scale, borderRadius: 5, background: "#3a3126" }} />
        <div style={{ position: "absolute", bottom: 52 * scale, right: 34 * scale, width: 16 * scale, height: 16 * scale, borderRadius: 5, background: "#3a3126" }} />
      </>}
      {gear === "rifle" && (
        <div style={{ position: "absolute", bottom: 68 * scale, right: 20 * scale, width: 64 * scale, height: 6 * scale, background: "#2a2f3d", border: "1px solid #4a5268", borderRadius: 3 }} />
      )}
      {(gear === "trails" || mainFx === "trails" || secFx === "trails") && <>
        <div style={{ position: "absolute", top: "45%", left: 4 * scale, width: 30 * scale, height: 3 * scale, background: aura, opacity: 0.6, borderRadius: 2 }} />
        <div style={{ position: "absolute", top: "55%", left: 0, width: 40 * scale, height: 3 * scale, background: aura, opacity: 0.4, borderRadius: 2 }} />
        <div style={{ position: "absolute", top: "65%", left: 8 * scale, width: 24 * scale, height: 3 * scale, background: aura, opacity: 0.5, borderRadius: 2 }} />
      </>}
      {(gear === "runes" || mainFx === "spellcircle" || secFx === "spellcircle") && (
        <div style={{ position: "absolute", bottom: 8 * scale, left: "20%", width: "60%", height: 20 * scale, borderRadius: "50%", border: `1px dashed ${aura}`, opacity: 0.7, animation: "pcSpin 8s linear infinite" }} />
      )}
      {gear === "circle" && (
        <div style={{ position: "absolute", bottom: 6 * scale, left: "12%", width: "76%", height: 24 * scale, borderRadius: "50%", border: `2px dotted ${aura}`, opacity: 0.6, animation: "pcSpin 10s linear infinite" }} />
      )}
      {(gear === "visor" || fighter.special_skill === "Genius IQ") && (
        <div style={{ position: "absolute", top: 46 * scale, left: "50%", width: 50 * scale, marginLeft: -25 * scale, height: 6 * scale, background: "rgba(56,189,248,0.5)", borderRadius: 3, boxShadow: "0 0 8px rgba(56,189,248,0.6)" }} />
      )}
      {gear === "staff" && (
        <div style={{ position: "absolute", bottom: 24 * scale, left: 40 * scale, width: 4 * scale, height: 120 * scale, background: "#6b5a3a", borderRadius: 2 }} />
      )}

      {/* 6-7. Power FX (hands / body) */}
      {(mainFx === "handflame" || secFx === "handflame") && <>
        <div style={{ position: "absolute", bottom: 56 * scale, left: 32 * scale, width: 14 * scale, height: 20 * scale, borderRadius: "50% 50% 30% 30%", background: "#ff6a3d", filter: "blur(2px)", opacity: 0.85 }} />
        <div style={{ position: "absolute", bottom: 56 * scale, right: 32 * scale, width: 14 * scale, height: 20 * scale, borderRadius: "50% 50% 30% 30%", background: "#ff8a3d", filter: "blur(2px)", opacity: 0.85 }} />
      </>}
      {(mainFx === "arcs" || secFx === "arcs") && (
        <svg style={{ position: "absolute", inset: 0 }} viewBox="0 0 200 200">
          <polyline points="40,90 55,100 45,115 60,125" stroke="#f5e14a" strokeWidth="2" fill="none" opacity="0.85" />
          <polyline points="160,85 145,98 158,110 142,124" stroke="#f5e14a" strokeWidth="2" fill="none" opacity="0.85" />
        </svg>
      )}
      {(mainFx === "sphere" || secFx === "sphere" || mainFx === "cosmicsphere" || secFx === "cosmicsphere") && (
        <div style={{ position: "absolute", bottom: 58 * scale, right: 22 * scale, width: 22 * scale, height: 22 * scale, borderRadius: "50%", background: aura, boxShadow: `0 0 14px ${aura}`, opacity: 0.9 }} />
      )}
      {(mainFx === "bigfists" || secFx === "bigfists") && <>
        <div style={{ position: "absolute", bottom: 46 * scale, left: 26 * scale, width: 22 * scale, height: 22 * scale, borderRadius: 7, background: "#3a3126", boxShadow: `0 0 10px ${aura}` }} />
        <div style={{ position: "absolute", bottom: 46 * scale, right: 26 * scale, width: 22 * scale, height: 22 * scale, borderRadius: 7, background: "#3a3126", boxShadow: `0 0 10px ${aura}` }} />
      </>}
      {(mainFx === "bubble" || secFx === "bubble") && (
        <div style={{ position: "absolute", inset: 22 * scale, borderRadius: "50%", border: `1.5px solid ${aura}`, opacity: 0.55 }} />
      )}
      {(mainFx === "wings" || secFx === "wings" || fighter.special_skill === "Flight Skill") && <>
        <div style={{ position: "absolute", top: "34%", left: 8 * scale, width: 30 * scale, height: 50 * scale, borderRadius: "60% 0 0 60%", background: aura, opacity: 0.3, filter: "blur(2px)" }} />
        <div style={{ position: "absolute", top: "34%", right: 8 * scale, width: 30 * scale, height: 50 * scale, borderRadius: "0 60% 60% 0", background: aura, opacity: 0.3, filter: "blur(2px)" }} />
      </>}
      {(mainFx === "portal" || secFx === "portal") && (
        <div style={{ position: "absolute", top: "22%", right: 2 * scale, width: 30 * scale, height: 56 * scale, borderRadius: "50%", border: `2px solid ${aura}`, opacity: 0.6, transform: "rotate(12deg)" }} />
      )}
      {(mainFx === "mist" || secFx === "mist") && (
        <div style={{ position: "absolute", bottom: 10 * scale, left: "18%", width: "64%", height: 26 * scale, borderRadius: "50%", background: "#7ee081", opacity: 0.3, filter: "blur(8px)" }} />
      )}
      {(mainFx === "duplicates" || secFx === "duplicates") && (
        <div style={{ position: "absolute", left: "50%", bottom: 14 * scale, width: type.w * scale, height: type.h * scale, marginLeft: -(type.w * scale) / 2 + 18 * scale, borderRadius: type.r, background: type.tint, opacity: 0.22, border: "1px solid #3a4256" }} />
      )}
      {(mainFx === "soundrings" || secFx === "soundrings") && (
        <div style={{ position: "absolute", inset: 34 * scale, borderRadius: "50%", border: "1.5px solid #fca5a5", opacity: 0.5 }} />
      )}
      {(mainFx === "rings" || secFx === "rings") && (
        <div style={{ position: "absolute", inset: 28 * scale, borderRadius: "50%", border: `1.5px dashed ${aura}`, opacity: 0.6, animation: "pcSpin 6s linear infinite" }} />
      )}

      {/* 8. Special skill accents */}
      {fighter.special_skill === "Stealth" && (
        <div style={{ position: "absolute", bottom: 8 * scale, left: "24%", width: "52%", height: 20 * scale, borderRadius: "50%", background: "#454e63", opacity: 0.4, filter: "blur(6px)" }} />
      )}
      {fighter.special_skill === "Leadership" && (
        <div style={{ position: "absolute", inset: 16 * scale, borderRadius: "50%", border: `1px solid ${aura}`, opacity: 0.35 }} />
      )}

      {/* 10. Ultimate glow ring */}
      {(ultFx === "surge" || ultFx === "explode" || ultFx === "charge" || state === "ultimate") && (
        <div style={{ position: "absolute", inset: 12 * scale, borderRadius: "50%", border: `2px solid ${aura}`, opacity: state === "ultimate" ? 0.9 : 0.35, boxShadow: `0 0 18px ${aura}`, transition: "opacity .2s" }} />
      )}
      {ultFx === "healring" && (
        <div style={{ position: "absolute", bottom: 4 * scale, left: "10%", width: "80%", height: 22 * scale, borderRadius: "50%", border: "2px solid #3fe0a0", opacity: 0.6 }} />
      )}
    </div>
  );
}
