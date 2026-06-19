import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTracker } from "../context/TrackerContext";
import { formatMinutes, LimitBadge, UsageBar } from "../components/UsageBar";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";

export default function AppDetail() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { apps, getTodayUsage, getWeekUsage, limits, setLimit, isOverLimit, isNearLimit } = useTracker();

  const app = apps.find(a => a.id === appId);
  if (!app) return <div style={{ padding: 32, color: "var(--text-primary)" }}>App not found.</div>;

  const usage = getTodayUsage(app.id);
  const weekData = getWeekUsage(app.id);
  const limit = limits[app.id] || { minutes: 60, enabled: true };

  const [limitMinutes, setLimitMinutes] = useState(limit.minutes);
  const [limitEnabled, setLimitEnabled] = useState(limit.enabled);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLimit(app.id, limitMinutes, limitEnabled);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Hourly chart data
  const hourlyData = usage.hourly.map((min, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    minutes: min,
  })).filter((_, i) => i >= 6 && i <= 23);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-card-solid)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "10px 14px", fontSize: 13
      }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</p>
        <p style={{ color: app.color, fontWeight: 700 }}>{payload[0].value}m</p>
      </div>
    );
  };

  return (
    <div className="page-enter">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {/* App Header */}
      <div className="card mb-6" style={{ borderColor: `${app.color}44` }}>
        <div className="flex items-center gap-4 mb-4">
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: `${app.color}22`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32
          }}>{app.icon}</div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>{app.name}</h1>
            <div className="flex gap-2 mt-1 items-center">
              <LimitBadge appId={app.id} />
              <span className="text-sm text-muted">{format(new Date(), "EEEE, MMM d")}</span>
            </div>
          </div>
        </div>

        {isOverLimit(app.id) && (
          <div className="warning-banner red">⚠️ You've exceeded your daily limit for {app.name}!</div>
        )}
        {isNearLimit(app.id) && !isOverLimit(app.id) && (
          <div className="warning-banner yellow">⚡ You're approaching your daily limit for {app.name}.</div>
        )}

        <div className="stats-grid" style={{ marginBottom: 0 }}>
          <div className="stat-card" style={{ padding: "16px 20px" }}>
            <div className="stat-icon" style={{ background: `${app.color}22`, fontSize: 20, width: 40, height: 40 }}>⏱</div>
            <div className="stat-info">
              <div className="stat-label">Time Today</div>
              <div className="stat-value" style={{ fontSize: 22, color: app.color }}>{formatMinutes(usage.totalMinutes)}</div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: "16px 20px" }}>
            <div className="stat-icon" style={{ background: "rgba(6,182,212,0.15)", fontSize: 20, width: 40, height: 40 }}>🔄</div>
            <div className="stat-info">
              <div className="stat-label">Times Opened</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{usage.opens}×</div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: "16px 20px" }}>
            <div className="stat-icon" style={{ background: "rgba(16,185,129,0.15)", fontSize: 20, width: 40, height: 40 }}>📅</div>
            <div className="stat-info">
              <div className="stat-label">This Week</div>
              <div className="stat-value" style={{ fontSize: 22 }}>
                {formatMinutes(weekData.reduce((s, d) => s + d.totalMinutes, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Hourly Usage */}
      <div className="card mb-6">
        <div className="section-title">Today's Hourly Breakdown</div>
        <div className="section-subtitle mb-4">Minutes used per hour (6am – 11pm)</div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${app.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={app.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={app.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}m`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="minutes" stroke={app.color} strokeWidth={2} fill={`url(#grad-${app.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day History */}
      <div className="card mb-6">
        <div className="section-title">7-Day History</div>
        <div className="section-subtitle mb-4">Daily usage for the past week</div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}m`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalMinutes" fill={app.color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <table className="data-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Day</th><th>Date</th><th>Time Used</th><th>Opens</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {weekData.map(d => {
              const pct = limit.enabled ? (d.totalMinutes / limit.minutes) * 100 : -1;
              const status = !limit.enabled ? "—" : pct >= 100 ? "🔴 Over" : pct >= 80 ? "🟡 Near" : "🟢 OK";
              return (
                <tr key={d.date}>
                  <td style={{ fontWeight: 600 }}>{d.label}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{d.date}</td>
                  <td style={{ color: app.color, fontWeight: 700 }}>{formatMinutes(d.totalMinutes)}</td>
                  <td>{d.opens}×</td>
                  <td>{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Set Limit */}
      <div className="card">
        <div className="section-title">⏱️ Set Daily Time Limit</div>
        <div className="section-subtitle mb-6">Get an alert when you exceed the limit</div>

        <div className="flex items-center gap-4 mb-4" style={{ flexWrap: "wrap" }}>
          <label className="toggle-switch">
            <input type="checkbox" checked={limitEnabled} onChange={e => setLimitEnabled(e.target.checked)} />
            <span className="toggle-knob" />
          </label>
          <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            {limitEnabled ? "Limit enabled" : "Limit disabled"}
          </span>
        </div>

        {limitEnabled && (
          <>
            <div className="flex items-center gap-4 mb-6" style={{ flexWrap: "wrap" }}>
              <input
                type="number"
                className="limit-input"
                value={limitMinutes}
                min={5} max={480}
                onChange={e => setLimitMinutes(Number(e.target.value))}
              />
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>minutes per day</span>
              <input
                type="range"
                className="limit-slider"
                min={5} max={240} step={5}
                value={limitMinutes}
                onChange={e => setLimitMinutes(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontWeight: 700, color: app.color, minWidth: 40 }}>{formatMinutes(limitMinutes)}</span>
            </div>

            <div className="mb-6">
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                Today's usage vs limit:
              </div>
              <UsageBar appId={app.id} minutes={usage.totalMinutes} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
                <span>{formatMinutes(usage.totalMinutes)} used</span>
                <span>{formatMinutes(limitMinutes)} limit</span>
              </div>
            </div>
          </>
        )}

        <button className={`btn ${saved ? "btn-ghost" : "btn-primary"}`} onClick={handleSave}>
          {saved ? "✓ Saved!" : "Save Limit"}
        </button>
      </div>
    </div>
  );
}
