import React from "react";
import { useTracker } from "../context/TrackerContext";

export function UsageBar({ appId, minutes, style }) {
  const { limits } = useTracker();
  const limit = limits[appId];
  const pct = limit && limit.enabled ? Math.min((minutes / limit.minutes) * 100, 100) : 50;
  const color = !limit || !limit.enabled
    ? "var(--accent)"
    : pct >= 100 ? "var(--red)"
    : pct >= 80  ? "var(--yellow)"
    : "var(--green)";

  return (
    <div className="progress-bar-wrap" style={style}>
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function LimitBadge({ appId }) {
  const { isOverLimit, isNearLimit, limits } = useTracker();
  const limit = limits[appId];
  if (!limit || !limit.enabled) return <span className="badge badge-accent">No Limit</span>;
  if (isOverLimit(appId)) return <span className="badge badge-red">⚠ Over Limit</span>;
  if (isNearLimit(appId)) return <span className="badge badge-yellow">⚡ Near Limit</span>;
  return <span className="badge badge-green">✓ Under Limit</span>;
}

export function formatMinutes(m) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}
