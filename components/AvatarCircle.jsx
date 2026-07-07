import React from "react";

const COLORS = ["#e6b84a", "#38d6f0", "#a06bff", "#3fe0a0", "#ff5468", "#4a8fe6"];

function hash(str) {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function AvatarCircle({ name, size = 40 }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const color = COLORS[hash(name) % COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(160deg, ${color}55, ${color}15)`, border: `2px solid ${color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, color
    }}>
      {initials}
    </div>
  );
}
