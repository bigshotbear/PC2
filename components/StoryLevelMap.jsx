import React from "react";
import { STORY_BOSSES } from "../lib/storyBosses";

export default function StoryLevelMap({ progress }) {
  const current = progress.current_level;
  const highest = progress.highest_level;
  const isCheckpoint = progress.run_status !== "active" && progress.run_status !== "pending_training" && current > 1;
  const isFailed = progress.run_status === "pending_training";

  return (
    <div className="card card-panel purple" style={{ overflowX: "auto" }}>
      <div className="card-title">Story Path</div>
      <div style={{ display: "flex", alignItems: "center", paddingBottom: 4 }}>
        {STORY_BOSSES.map((boss, i) => {
          const isBossFinale = boss.level === STORY_BOSSES.length;
          const completed = boss.level < current || (boss.level <= highest && boss.level !== current);
          const isCurrent = boss.level === current;
          const locked = boss.level > highest + 1;

          let nodeClass = "pc-node-locked";
          let label = null;
          if (isCurrent && (isFailed || isCheckpoint)) { nodeClass = "pc-node-failed"; label = "RETRY"; }
          else if (isCurrent) { nodeClass = "pc-node-current"; }
          else if (completed) { nodeClass = "pc-node-done"; label = "✓"; }

          return (
            <React.Fragment key={boss.key}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 62, flexShrink: 0 }}>
                <div className={`pc-story-node ${nodeClass} ${isBossFinale ? "pc-node-boss" : ""}`}>
                  {label || boss.level}
                </div>
                <div style={{ fontSize: 9.5, color: "var(--text-dim)", marginTop: 4, textAlign: "center", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {boss.name}
                </div>
              </div>
              {i < STORY_BOSSES.length - 1 && <div style={{ width: 18, height: 2, background: locked ? "var(--line)" : "var(--gold-dim)", flexShrink: 0 }} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
