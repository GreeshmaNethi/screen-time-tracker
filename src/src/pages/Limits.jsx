import React, { useState } from "react";
import { useTracker } from "../context/TrackerContext";
import { formatMinutes, UsageBar } from "../components/UsageBar";
import { useNavigate } from "react-router-dom";

export default function Limits() {
  const { apps, limits, setLimit, getTodayUsage, isOverLimit, isNearLimit } = useTracker();
  const navigate = useNavigate();
  const [editValues, setEditValues] = useState(() => {
    const v = {};
    apps.forEach(a => { v[a.id] = limits[a.id]?.minutes || 60; });
    return v;
  });

  const handleToggle = (appId, enabled) => {
    setLimit(appId, editValues[appId], enabled);
  };

  const handleChange = (appId, val) => {
    const minutes = Math.max(5, Math.min(480, Number(val)));
    setEditValues(prev => ({ ...prev, [appId]: minutes }));
    setLimit(appId, minutes, limits[appId]?.enabled ?? true);
  };

  const overLimitApps = apps.filter(a => isOverLimit(a.id));
  const nearLimitApps = apps.filter(a => isNearLimit(a.id));

  return (
    <div className="page-enter">
      <div className="bg-accent-blob" />
      <div className="page-header">
        <h1>Time Limits</h1>
        <p>Set and manage daily usage limits for each app</p>
      </div>

      {/* Alert Banners */}
      {overLimitApps.length > 0 && (
        <div className="warning-banner red mb-4">
          🚨 Over limit: {overLimitApps.map(a => `${a.icon} ${a.name}`).join(", ")}
        </div>
      )}
      {nearLimitApps.length > 0 && (
        <div className="warning-banner yellow mb-4">
          ⚡ Near limit: {nearLimitApps.map(a => `${a.icon} ${a.name}`).join(", ")}
        </div>
      )}

      {/* Summary */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(124,58,237,0.15)" }}>⚙️</div>
          <div className="stat-info">
            <div className="stat-label">Active Limits</div>
            <div className="stat-value">{apps.filter(a => limits[a.id]?.enabled).length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(239,68,68,0.15)" }}>🚨</div>
          <div className="stat-info">
            <div className="stat-label">Over Limit</div>
            <div className="stat-value" style={{ color: overLimitApps.length > 0 ? "var(--red)" : "var(--green)" }}>{overLimitApps.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(245,158,11,0.15)" }}>⚡</div>
          <div className="stat-info">
            <div className="stat-label">Near Limit</div>
            <div className="stat-value" style={{ color: nearLimitApps.length > 0 ? "var(--yellow)" : "var(--green)" }}>{nearLimitApps.length}</div>
          </div>
        </div>
      </div>

      {/* Limit Rows */}
      <div className="card-solid">
        <div className="section-title mb-4">All Apps</div>
        {apps.map(app => {
          const limit = limits[app.id] || { minutes: 60, enabled: true };
          const usage = getTodayUsage(app.id);
          const over = isOverLimit(app.id);
          const near = isNearLimit(app.id) && !over;
          const pct = limit.enabled ? Math.min((usage.totalMinutes / editValues[app.id]) * 100, 100) : 0;
          const statusColor = !limit.enabled ? "var(--text-muted)" : over ? "var(--red)" : near ? "var(--yellow)" : "var(--green)";

          return (
            <div key={app.id} className="limit-row" style={{ borderColor: over ? "rgba(239,68,68,0.3)" : near ? "rgba(245,158,11,0.3)" : "var(--border)" }}>
              {/* App Info */}
              <div className="limit-app-info" style={{ cursor: "pointer" }} onClick={() => navigate(`/apps/${app.id}`)}>
                <div className="limit-icon" style={{ background: `${app.color}22` }}>{app.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{app.name}</div>
                  <div style={{ fontSize: 12, color: statusColor }}>
                    {formatMinutes(usage.totalMinutes)} used
                    {limit.enabled ? ` / ${formatMinutes(editValues[app.id])}` : " (no limit)"}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ flex: 1, minWidth: 80 }}>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{
                    width: `${pct}%`,
                    background: over ? "var(--red)" : near ? "var(--yellow)" : "var(--green)"
                  }} />
                </div>
              </div>

              {/* Input + Slider */}
              {limit.enabled && (
                <>
                  <input
                    type="number"
                    className="limit-input"
                    value={editValues[app.id]}
                    min={5} max={480}
                    onChange={e => handleChange(app.id, e.target.value)}
                  />
                  <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>min / day</span>
                  <input
                    type="range"
                    className="limit-slider"
                    min={5} max={240} step={5}
                    value={editValues[app.id]}
                    onChange={e => handleChange(app.id, e.target.value)}
                    style={{ width: 100 }}
                  />
                </>
              )}

              {/* Toggle */}
              <label className="toggle-switch">
                <input type="checkbox" checked={limit.enabled} onChange={e => handleToggle(app.id, e.target.checked)} />
                <span className="toggle-knob" />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
