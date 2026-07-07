// Renders a shareable battle result card to a canvas using plain Canvas 2D
// drawing — no external image library, no network calls. Produces a
// 1080x1350 (portrait, Instagram/TikTok-friendly) PNG.

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = (text || "").split(" ");
  let line = "";
  let curY = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, curY);
      line = word + " ";
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line.trim(), x, curY);
  return curY + lineHeight;
}

const POWER_SOURCE_COLORS = {
  Fire: "#ff6a3d", Ice: "#5ca8ff", Lightning: "#f0d060", Shadow: "#a06bff", Light: "#ffe27a",
  Water: "#38bdf8", Earth: "#8b6f4e", Wind: "#7de9ff", Technology: "#38d6f0", Magic: "#c39bff",
  Nature: "#4ade80", "Cosmic Energy": "#c39bff", Psychic: "#f472b6", Poison: "#4ade80",
  Sound: "#7de9ff", Gravity: "#a06bff", "Spirit Energy": "#7de9ff", Ki: "#ff6a3d"
};

/**
 * Draws a safe, purely vector "portrait" — a colored circle (by power
 * source) with the fighter's initials. Deliberately NEVER calls
 * ctx.drawImage() with any uploaded or external image: that's the actual
 * mechanism that taints a canvas and breaks toBlob()/toDataURL() on
 * cross-origin images without proper CORS headers. This guarantees
 * Download Image always works, for every fighter, every time.
 */
function drawPortraitBadge(ctx, x, y, radius, fighter) {
  const color = POWER_SOURCE_COLORS[fighter?.power_source] || "#e6b84a";
  const initials = (fighter?.fighter_name || fighter?.name || "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const grad = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
  grad.addColorStop(0, color + "cc");
  grad.addColorStop(1, color + "22");
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#0e1017";
  ctx.font = `bold ${Math.round(radius * 0.7)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, x, y + 2);
  ctx.textBaseline = "alphabetic";
}

export function renderShareCard(canvas, data) {
  const W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#12151d");
  bg.addColorStop(1, "#090b10");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial glow accents
  const glow = ctx.createRadialGradient(W * 0.2, H * 0.1, 50, W * 0.2, H * 0.1, 500);
  glow.addColorStop(0, data.won ? "rgba(63,224,160,0.18)" : "rgba(255,84,104,0.15)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Fighter portraits — safe vector badges, never a loaded image.
  const winnerFighter = data.won ? data.myFighters?.[0] : data.opponentFighters?.[0];
  const loserFighter = data.won ? data.opponentFighters?.[0] : data.myFighters?.[0];
  if (winnerFighter) drawPortraitBadge(ctx, W * 0.28, 130, 60, winnerFighter);
  if (loserFighter) drawPortraitBadge(ctx, W * 0.72, 130, 60, loserFighter);

  // Branding
  ctx.fillStyle = "#e6b84a";
  ctx.font = "bold 42px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("POWER CLASH", W / 2, 90);

  // Result banner
  ctx.fillStyle = data.won ? "#3fe0a0" : "#ff5468";
  ctx.font = "bold 84px sans-serif";
  ctx.fillText(data.won ? "VICTORY" : "DEFEAT", W / 2, 210);

  // Headline
  ctx.fillStyle = "#eae7dd";
  ctx.font = "italic 34px sans-serif";
  let y = 290;
  y = wrapText(ctx, `"${data.headline}"`, W / 2, y, W - 160, 44);

  // Winner vs Loser
  ctx.font = "bold 46px sans-serif";
  ctx.fillStyle = "#ffd873";
  ctx.fillText(data.winnerName, W / 2, y + 80);
  ctx.font = "28px sans-serif";
  ctx.fillStyle = "#8b91a3";
  ctx.fillText("defeated", W / 2, y + 125);
  ctx.font = "bold 40px sans-serif";
  ctx.fillStyle = "#c39bff";
  ctx.fillText(data.loserName, W / 2, y + 175);

  // Score
  ctx.font = "bold 52px sans-serif";
  ctx.fillStyle = "#eae7dd";
  ctx.fillText(`${Math.round(data.myScore)} — ${Math.round(data.opponentScore)}`, W / 2, y + 260);

  // Grade badge
  if (data.grade) {
    ctx.beginPath();
    ctx.arc(W / 2, y + 360, 60, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(230,184,74,0.15)";
    ctx.fill();
    ctx.strokeStyle = "#e6b84a";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = "bold 60px sans-serif";
    ctx.fillStyle = "#ffd873";
    ctx.fillText(data.grade, W / 2, y + 380);
  }

  // Finishing move
  if (data.finishingMove) {
    ctx.font = "26px sans-serif";
    ctx.fillStyle = "#8b91a3";
    ctx.fillText("Finishing Move", W / 2, y + 460);
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#7de9ff";
    wrapText(ctx, data.finishingMove, W / 2, y + 500, W - 200, 40);
  }

  // Fight/build code
  if (data.fightCode) {
    ctx.font = "24px monospace";
    ctx.fillStyle = "#8b91a3";
    ctx.fillText(data.fightCode, W / 2, H - 140);
  }

  // Footer
  ctx.font = "22px sans-serif";
  ctx.fillStyle = "#8b91a3";
  ctx.fillText("play at powerclash.app", W / 2, H - 70);

  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}
