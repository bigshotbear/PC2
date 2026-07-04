import React from "react";
import { AURA_COLORS, TYPE_SHAPES, POWER_FX, ULT_FX } from "../lib/visualLayerMap";

// Pose archetypes — each fighting style gets a genuinely different
// silhouette (arm/leg angles, torso width/lean), not just a color
// change on the same rounded-rect blob.
const POSES = {
  power:   { armL: -145, armR: -35,  legL: 10,  legR: -10, torsoW: 1.18, lean: 0 },
  guard:   { armL: 95,   armR: 85,   legL: 18,  legR: -18, torsoW: 1.28, lean: 0 },
  sprint:  { armL: -55,  armR: 115,  legL: -32, legR: 42,  torsoW: 0.88, lean: -14 },
  crouch:  { armL: 25,   armR: -25,  legL: 42,  legR: 58,  torsoW: 0.85, lean: 10, crouch: true },
  cast:    { armL: -165, armR: -165, legL: 6,   legR: -6,  torsoW: 1.0,  lean: 0, robe: true },
  aim:     { armL: 92,   armR: -105, legL: 22,  legR: -12, torsoW: 0.95, lean: 0 },
  stand:   { armL: 15,   armR: -15,  legL: 6,   legR: -6,  torsoW: 1.0,  lean: 0 },
  blade:   { armL: 12,   armR: -135, legL: 12,  legR: -22, torsoW: 1.0,  lean: -5, weapon: true },
  channel: { armL: -100, armR: -60,  legL: 6,   legR: -6,  torsoW: 0.95, lean: 0 }
};

const POSE_BY_STYLE = {
  Brawler: "power", Tank: "guard", Defender: "guard", Speedster: "sprint",
  Assassin: "crouch", Mage: "cast", Summoner: "cast", Sniper: "aim",
  Strategist: "stand", Tactician: "stand", "Weapon Master": "blade",
  "Support/Healer": "channel", Balanced: "stand"
};

function resolvePose(fighter) {
  let poseKey = POSE_BY_STYLE[fighter.fighting_style] || "stand";
  if (fighter.special_skill === "Swordsmanship") poseKey = "blade";
  return { key: poseKey, ...POSES[poseKey] };
}

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
  const pose = resolvePose(fighter);
  const mainFx = POWER_FX[fighter.main_power];
  const secFx = POWER_FX[fighter.secondary_power];
  const ultFx = ULT_FX[fighter.ultimate_move];
  const hasWings = fighter.main_power === "Flight" || fighter.secondary_power === "Flight" || fighter.special_skill === "Flight Skill";
  const showWeapon = pose.weapon || fighter.main_power === "Weapon Mastery" || fighter.secondary_power === "Weapon Mastery";

  const scale = size / 200;
  const flip = facing === "left" ? -1 : 1;

  const stateOffset = { idle: 0, attack: 18, hit: 0, ultimate: 0, defeat: 0 }[state] || 0;
  const bodyOpacity = state === "defeat" ? 0.3 : state === "hit" ? 0.55 : 1;
  const bodyFilter = state === "hit" ? "brightness(1.9)" : "none";

  const limbW = 13 * scale;
  const armLen = 62 * scale;
  const legLen = 68 * scale;
  const torsoW = 46 * scale * pose.torsoW;
  const torsoH = 70 * scale * (pose.crouch ? 0.82 : 1);
  const headR = 19 * scale;

  return (
    <div
      style={{
        position: "relative", width: 200 * scale, height: 200 * scale,
        transform: `scaleX(${flip})`, transition: "transform 0.15s ease",
        opacity: bodyOpacity, filter: bodyFilter,
        animation: animated && state === "idle" ? "pcFloat 3s ease-in-out infinite" : "none"
      }}
    >
      <style>{`
        @keyframes pcFloat { 0%,100%{transform:scaleX(${flip}) translateY(0)} 50%{transform:scaleX(${flip}) translateY(-5px)} }
        @keyframes pcPulse { 0%,100%{opacity:.45} 50%{opacity:.75} }
        @keyframes pcSpin { to { transform: rotate(360deg) } }
      `}</style>

      {showAura && (
        <div style={{
          position: "absolute", inset: 10 * scale, borderRadius: "50%",
          background: aura, filter: `blur(${(state === "ultimate" ? 14 : 22) * scale}px)`,
          opacity: state === "ultimate" ? 0.85 : 0.5,
          transform: state === "ultimate" ? "scale(1.25)" : "scale(1)",
          transition: "all .25s ease", animation: "pcPulse 2.5s ease-in-out infinite"
        }} />
      )}

      {fighter.portrait_url ? (
        <img
          src={fighter.portrait_url}
          alt={fighter.fighter_name || "Fighter portrait"}
          style={{
            position: "absolute", left: "50%", bottom: 14 * scale,
            width: 110 * scale, height: 140 * scale, marginLeft: -55 * scale,
            objectFit: "cover", borderRadius: 14, border: "1px solid #3a4256",
            transform: `translateX(${stateOffset * flip}px)`, transition: "transform .18s ease"
          }}
        />
      ) : (
        <div style={{
          position: "absolute", left: "50%", bottom: 14 * scale,
          width: 110 * scale, height: 150 * scale, marginLeft: -55 * scale,
          transform: `rotate(${pose.lean}deg) translateX(${stateOffset * flip}px)`,
          transition: "transform .18s ease", transformOrigin: "50% 100%"
        }}>
          {ultFx === "field" && (
            <div style={{ position: "absolute", bottom: -4 * scale, left: "10%", width: "80%", height: 14 * scale, borderRadius: "50%", background: aura, opacity: 0.35, filter: "blur(4px)" }} />
          )}
          {ultFx === "summon" && (
            <div style={{ position: "absolute", bottom: 0, right: -30 * scale, width: 40 * scale, height: 66 * scale, borderRadius: "40% 40% 12% 12%", background: "#11141c", border: `1px solid ${aura}`, opacity: 0.55 }} />
          )}

          {hasWings && (
            <>
              <div style={{ position: "absolute", top: torsoH * 0.15, left: -34 * scale, width: 38 * scale, height: 60 * scale, borderRadius: "70% 10% 60% 20%", background: aura, opacity: 0.32, filter: "blur(1px)", transform: "rotate(-14deg)" }} />
              <div style={{ position: "absolute", top: torsoH * 0.15, right: -34 * scale, width: 38 * scale, height: 60 * scale, borderRadius: "10% 70% 20% 60%", background: aura, opacity: 0.32, filter: "blur(1px)", transform: "rotate(14deg)" }} />
            </>
          )}

          <div style={{
            position: "absolute", top: headR * 2 + torsoH * 0.92, left: "50%", width: limbW, height: legLen,
            marginLeft: -limbW - 2, background: type.tint, borderRadius: limbW / 2,
            border: "1px solid #3a4256", transformOrigin: "top center", transform: `rotate(${pose.legL}deg)`
          }} />
          <div style={{
            position: "absolute", top: headR * 2 + torsoH * 0.92, left: "50%", width: limbW, height: legLen,
            marginLeft: 2, background: type.tint, borderRadius: limbW / 2,
            border: "1px solid #3a4256", transformOrigin: "top center", transform: `rotate(${pose.legR}deg)`
          }} />

          {pose.robe && (
            <div style={{
              position: "absolute", top: headR * 2 + torsoH * 0.55, left: "50%", width: torsoW * 1.5,
              height: legLen * 0.9, marginLeft: -(torsoW * 1.5) / 2,
              background: type.tint, opacity: 0.94, borderRadius: "8px 8px 40% 40%",
              border: "1px solid #3a4256", clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)"
            }} />
          )}

          <div style={{
            position: "absolute", top: headR * 2 + torsoH * 0.08, left: "50%", width: limbW, height: armLen,
            marginLeft: -(torsoW / 2) - limbW * 0.3, background: type.tint, borderRadius: limbW / 2,
            border: "1px solid #3a4256", transformOrigin: "top center", transform: `rotate(${pose.armL}deg)`, zIndex: 2
          }}>
            {(mainFx === "handflame" || secFx === "handflame") && (
              <div style={{ position: "absolute", bottom: -10 * scale, left: -3 * scale, width: limbW + 6, height: 18 * scale, borderRadius: "50%", background: "#ff6a3d", filter: "blur(2px)", opacity: 0.85 }} />
            )}
            {(mainFx === "sphere" || secFx === "sphere" || mainFx === "cosmicsphere" || secFx === "cosmicsphere" || mainFx === "chakra" || secFx === "chakra") && (
              <div style={{ position: "absolute", bottom: -12 * scale, left: -4 * scale, width: limbW + 8, height: limbW + 8, borderRadius: "50%", background: aura, boxShadow: `0 0 12px ${aura}`, opacity: 0.9 }} />
            )}
          </div>
          <div style={{
            position: "absolute", top: headR * 2 + torsoH * 0.08, left: "50%", width: limbW, height: armLen,
            marginLeft: (torsoW / 2) - limbW * 0.7, background: type.tint, borderRadius: limbW / 2,
            border: "1px solid #3a4256", transformOrigin: "top center", transform: `rotate(${pose.armR}deg)`, zIndex: 2
          }}>
            {(mainFx === "handflame" || secFx === "handflame") && (
              <div style={{ position: "absolute", bottom: -10 * scale, left: -3 * scale, width: limbW + 6, height: 18 * scale, borderRadius: "50%", background: "#ff8a3d", filter: "blur(2px)", opacity: 0.85 }} />
            )}
            {showWeapon && (
              <div style={{ position: "absolute", bottom: -70 * scale, left: limbW / 2 - 2 * scale, width: 4 * scale, height: 78 * scale, background: "var(--gold-bright)", borderRadius: 2, boxShadow: "0 0 10px var(--gold-bright)" }} />
            )}
            {(mainFx === "arcs" || secFx === "arcs") && (
              <svg style={{ position: "absolute", bottom: -20 * scale, left: -8 * scale, overflow: "visible" }} width={limbW + 16} height={30 * scale}>
                <polyline points={`0,${8 * scale} ${8 * scale},${16 * scale} ${2 * scale},${24 * scale}`} stroke="#f5e14a" strokeWidth="2" fill="none" opacity="0.9" />
              </svg>
            )}
          </div>

          <div style={{
            position: "absolute", top: headR * 2 - 4 * scale, left: "50%", width: torsoW, height: torsoH,
            marginLeft: -torsoW / 2, background: type.tint, borderRadius: "30% 30% 22% 22%",
            border: "1px solid #3a4256", zIndex: 1
          }}>
            {(mainFx === "bubble" || secFx === "bubble") && (
              <div style={{ position: "absolute", inset: -8 * scale, borderRadius: "50%", border: `1.5px solid ${aura}`, opacity: 0.55 }} />
            )}
            {type.extra === "cloak" && (
              <div style={{ position: "absolute", top: "20%", left: "-15%", right: "-15%", bottom: "-60%", background: "#161922", borderRadius: "0 0 40% 40%", opacity: 0.85, zIndex: -1 }} />
            )}
          </div>

          <div style={{
            position: "absolute", top: 0, left: "50%", width: headR * 2, height: headR * 2,
            marginLeft: -headR, background: type.tint, borderRadius: "50%",
            border: "1px solid #3a4256", zIndex: 3
          }}>
            {type.extra === "mask" && <div style={{ position: "absolute", top: "38%", left: "8%", right: "8%", height: headR * 0.4, background: "#0a0c12", borderRadius: 4 }} />}
            {type.extra === "horns" && <>
              <div style={{ position: "absolute", top: -headR * 0.6, left: "5%", width: headR * 0.5, height: headR * 0.8, background: "#4a3b52", borderRadius: "50% 50% 0 0", transform: "rotate(-18deg)" }} />
              <div style={{ position: "absolute", top: -headR * 0.6, right: "5%", width: headR * 0.5, height: headR * 0.8, background: "#4a3b52", borderRadius: "50% 50% 0 0", transform: "rotate(18deg)" }} />
            </>}
            {type.extra === "halo" && <div style={{ position: "absolute", top: -headR * 0.9, left: "50%", width: headR * 2, height: headR * 0.4, marginLeft: -headR, borderRadius: "50%", border: `2px solid ${aura}`, opacity: 0.7 }} />}
            {type.extra === "tech" && <>
              <div style={{ position: "absolute", top: "35%", left: "4%", width: 5 * scale, height: 5 * scale, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
              <div style={{ position: "absolute", top: "35%", right: "4%", width: 5 * scale, height: 5 * scale, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
            </>}
            <div style={{ position: "absolute", top: "38%", left: "22%", width: 5 * scale, height: 3 * scale, background: fighter.special_skill === "Monster Instincts" ? "#ff5468" : aura, borderRadius: 2, boxShadow: `0 0 6px ${aura}` }} />
            <div style={{ position: "absolute", top: "38%", right: "22%", width: 5 * scale, height: 3 * scale, background: fighter.special_skill === "Monster Instincts" ? "#ff5468" : aura, borderRadius: 2, boxShadow: `0 0 6px ${aura}` }} />
          </div>

          {(mainFx === "rings" || secFx === "rings" || mainFx === "spellcircle" || secFx === "spellcircle") && (
            <div style={{ position: "absolute", bottom: -6 * scale, left: "5%", width: "90%", height: 22 * scale, borderRadius: "50%", border: `1.5px dashed ${aura}`, opacity: 0.6, animation: "pcSpin 7s linear infinite" }} />
          )}
          {(mainFx === "mist" || secFx === "mist") && (
            <div style={{ position: "absolute", bottom: -10 * scale, left: "10%", width: "80%", height: 26 * scale, borderRadius: "50%", background: "#7ee081", opacity: 0.3, filter: "blur(8px)" }} />
          )}
          {(mainFx === "portal" || secFx === "portal") && (
            <div style={{ position: "absolute", top: "20%", right: -20 * scale, width: 26 * scale, height: 54 * scale, borderRadius: "50%", border: `2px solid ${aura}`, opacity: 0.6, transform: "rotate(10deg)" }} />
          )}
          {(mainFx === "trails" || secFx === "trails") && <>
            <div style={{ position: "absolute", top: "40%", left: -30 * scale, width: 28 * scale, height: 3 * scale, background: aura, opacity: 0.55, borderRadius: 2 }} />
            <div style={{ position: "absolute", top: "50%", left: -38 * scale, width: 36 * scale, height: 3 * scale, background: aura, opacity: 0.4, borderRadius: 2 }} />
          </>}
        </div>
      )}

      {(ultFx === "surge" || ultFx === "explode" || ultFx === "charge" || state === "ultimate") && (
        <div style={{ position: "absolute", inset: 12 * scale, borderRadius: "50%", border: `2px solid ${aura}`, opacity: state === "ultimate" ? 0.9 : 0.35, boxShadow: `0 0 18px ${aura}`, transition: "opacity .2s" }} />
      )}
      {ultFx === "healring" && (
        <div style={{ position: "absolute", bottom: 4 * scale, left: "10%", width: "80%", height: 22 * scale, borderRadius: "50%", border: "2px solid #3fe0a0", opacity: 0.6 }} />
      )}
    </div>
  );
}
