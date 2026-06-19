import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../context/TrackerContext";
import { formatMinutes, UsageBar, LimitBadge } from "../components/UsageBar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { format, subDays } from "date-fns";

const PALETTE = ["#7C3AED","#06B6D4","#E1306C","#FF4500","#1DA1F2","#10B981","#F59E0B"];

export default function Dashboard() {
  const {
    apps, usageData, getTodayUsage, getWeekUsage,
    getTotalTodayMinutes, getMostUsedApp, getAppsOverLimit
  } = useTracker();
  const navigate = useNavigate();

  const totalToday    = getTotalTodayMinutes();
  const mostUsed      = getMostUsedApp();
  const overLimit     = getAppsOverLimit();

  // Weekly stacked chart data
  const weeklyChartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d    = 6 - i;
      const date = format(subDays(new Date(), d), "yyyy-MM-dd");
      const label = format(subDays(new Date(), d), "EEE");
      const row  = { label };
      apps.forEach(app => {
        row[app.name] = usageData[app.id]?.[date]?.totalMinutes || 0;
      });
      return row;
    });
  }, [apps, usageData]);

  // Today's apps sorted by usage
  const sortedApps = useMemo(() =>
    [...apps]
      .map(app => ({ ...app, usage: getTodayUsage(app.id) }))
      .sort((a, b) => b.usage.totalMinutes - a.usage.totalMinutes),
    [apps, usageData]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-card-solid)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "12px 16px", boxShadow: "var(--shadow)"
      }}>
        <p style={{ fontWeight: 700, marginBottom: 8, color: "var(--text-primary)", fontSize: 13 }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.fill, fontSize: 12, marginBottom: 2 }}>
            {p.name}: {formatMinutes(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="page-enter">
      <div className="bg-accent-blob" />

      {/* Header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your screen time overview for today — {format(new Date(), "EEEE, MMMM d")}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(124,58,237,0.15)" }}>⏱️</div>
          <div className="stat-info">
            <div className="stat-label">Total Today</div>
            <div className="stat-value">{formatMinutes(totalToday)}</div>
            <div className="stat-sub">Across all apps</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: mostUsed ? "rgba(225,48,108,0.15)" : "rgba(124,58,237,0.15)" }}>
            {mostUsed?.icon || "📱"}
          </div>
          <div className="stat-info">
            <div className="stat-label">Most Used</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{mostUsed?.name || "—"}</div>
            <div className="stat-sub">
              {mostUsed ? `${formatMinutes(getTodayUsage(mostUsed.id).totalMinutes)} today` : "No data"}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: overLimit.length > 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)" }}>
            {overLimit.length > 0 ? "🚨" : "✅"}
          </div>
          <div className="stat-info">
            <div className="stat-label">Over Limit</div>
            <div className="stat-value" style={{ color: overLimit.length > 0 ? "var(--red)" : "var(--green)" }}>
              {overLimit.length} app{overLimit.length !== 1 ? "s" : ""}
            </div>
            <div className="stat-sub">
              {overLimit.length === 0 ? "All within limits 🎉" : overLimit.map(a => a.name).join(", ")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(6,182,212,0.15)" }}>📈</div>
          <div className="stat-info">
            <div className="stat-label">Apps Tracked</div>
            <div className="stat-value">{apps.length}</div>
            <div className="stat-sub">Social media apps</div>
          </div>
        </div>
      </div>

      {/* Weekly Stacked Bar Chart */}
      <div className="card mb-6">
        <div className="section-title">Weekly Usage</div>
        <div className="section-subtitle mb-4">Total minutes per day, stacked by app</div>
        <div className="chart-container-tall">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${v}m`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
              {apps.map((app, i) => (
                <Bar
                  key={app.id}
                  dataKey={app.name}
                  stackId="a"
                  fill={PALETTE[i % PALETTE.length]}
                  radius={i === apps.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's App Breakdown */}
      <div className="section-title mb-4">Today's App Breakdown</div>
      <div className="apps-grid">
        {sortedApps.map(app => (
          <div
            key={app.id}
            className="app-card"
            onClick={() => navigate(`/apps/${app.id}`)}
          >
            <div className="app-card-header">
              <div className="app-card-icon" style={{ background: `${app.color}22` }}>
                {app.icon}
              </div>
              <div className="app-card-meta">
                <div className="app-card-name">{app.name}</div>
                <div className="app-card-opens">Opened {app.usage.opens}× today</div>
              </div>
              <LimitBadge appId={app.id} />
            </div>
            <div className="app-card-time" style={{ color: app.color }}>
              {formatMinutes(app.usage.totalMinutes)}
            </div>
            <UsageBar appId={app.id} minutes={app.usage.totalMinutes} />
            <div className="app-card-limit-row mt-2">
              <span className="app-card-limit-text" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Tap to view detail →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
