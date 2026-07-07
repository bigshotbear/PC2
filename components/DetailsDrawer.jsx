import React from "react";

export default function DetailsDrawer({ title, children, onClose }) {
  if (!title) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(9,11,16,0.85)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div
        className="card card-glow"
        style={{ width: "100%", maxWidth: 480, maxHeight: "75vh", overflowY: "auto", marginBottom: 0, borderRadius: "16px 16px 0 0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="card-title" style={{ fontSize: 15 }}>{title}</div>
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>{children}</div>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onClose}>Close Details</button>
      </div>
    </div>
  );
}
