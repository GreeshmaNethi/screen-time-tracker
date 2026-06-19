import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../context/TrackerContext";
import { UsageBar, LimitBadge, formatMinutes } from "../components/UsageBar";

export default function Apps() {
  const { apps, getTodayUsage, limits } = useTracker();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("usage");

  const filtered = apps
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "usage") return getTodayUsage(b.id).totalMinutes - getTodayUsage(a.id).totalMinutes;
      if (sortBy === "opens") return getTodayUsage(b.id).opens - getTodayUsage(a.id).opens;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="page-enter">
      <div className="bg-accent-blob" />
      <div className="page-header">
        <h1>Apps</h1>
        <p>All your tracked social media apps and today's usage</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6" style={{ flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍  Search apps..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "10px 16px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)", background: "var(--bg-card)",
            color: "var(--text-primary)", fontSize: 14, width: 240,
            outline: "none", transition: "border 0.2s"
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <div className="flex gap-2">
          {["usage", "opens", "name"].map(s => (
            <button key={s} className={`date-tab ${sortBy === s ? "active" : ""}`} onClick={() => setSortBy(s)}>
              {s === "usage" ? "⏱ Time" : s === "opens" ? "🔄 Opens" : "🔤 Name"}
            </button>
          ))}
        </div>
      </div>

      <div className="apps-grid">
        {filtered.map(app => {
          const usage = getTodayUsage(app.id);
          const limit = limits[app.id];
          return (
            <div
              key={app.id}
              className="app-card"
              onClick={() => navigate(`/apps/${app.id}`)}
              style={{ cursor: "pointer" }}
            >
              <style>{`.app-card:hover::before { background: ${app.gradient}; }`}</style>
              <div className="app-card-header">
                <div className="app-card-icon" style={{ background: `${app.color}22` }}>
                  {app.icon}
                </div>
                <div className="app-card-meta">
                  <div className="app-card-name">{app.name}</div>
                  <div className="app-card-opens">Opened {usage.opens}× today</div>
                </div>
                <LimitBadge appId={app.id} />
              </div>

              <div className="app-card-time" style={{ color: app.color }}>
                {formatMinutes(usage.totalMinutes)}
              </div>

              <UsageBar appId={app.id} minutes={usage.totalMinutes} />

              <div className="app-card-limit-row mt-2">
                <span className="app-card-limit-text">
                  {limit?.enabled ? `Limit: ${formatMinutes(limit.minutes)}` : "No limit set"}
                </span>
                <span className="text-sm text-muted" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Tap to view →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
