import React, { useState, useMemo } from "react";
import { useTracker } from "../context/TrackerContext";
import { formatMinutes } from "../components/UsageBar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { format, subDays } from "date-fns";

const PALETTE = ["#7C3AED","#06B6D4","#E1306C","#FF4500","#1DA1F2","#10B981","#F59E0B"];
const RANGES = [
  { label: "This Week", days: 7 },
  { label: "Last 2 Weeks", days: 14 },
  { label: "This Month", days: 30 },
];

export default function Reports() {
  const { apps, usageData } = useTracker();
  const [rangeIdx, setRangeIdx] = useState(0);

  const { days } = RANGES[rangeIdx];

  const dateRange = useMemo(() => (
    Array.from({ length: days }, (_, i) => {
      const d = days - 1 - i;
      return {
        date: format(subDays(new Date(), d), "yyyy-MM-dd"),
        label: format(subDays(new Date(), d), days <= 7 ? "EEE" : "MMM d"),
      };
    })
  ), [days]);

  // Daily total per app for stacked bar chart
  const stackedData = useMemo(() => (
    dateRange.map(({ date, label }) => {
      const row = { label };
      apps.forEach(app => {
        row[app.name] = usageData[app.id]?.[date]?.totalMinutes || 0;
      });
      return row;
    })
  ), [dateRange, apps, usageData]);

  // Pie chart data: total per app across range
  const pieData = useMemo(() => (
    apps.map((app, i) => ({
      name: app.name,
      icon: app.icon,
      value: dateRange.reduce((sum, { date }) => sum + (usageData[app.id]?.[date]?.totalMinutes || 0), 0),
      color: PALETTE[i % PALETTE.length],
    })).filter(a => a.value > 0).sort((a, b) => b.value - a.value)
  ), [dateRange, apps, usageData]);

  const totalMinutes = pieData.reduce((s, a) => s + a.value, 0);
  const avgDaily = Math.round(totalMinutes / days);

  // Total opens per app
  const totalOpens = useMemo(() => (
    apps.map(app => ({
      name: app.name,
      icon: app.icon,
      opens: dateRange.reduce((s, { date }) => s + (usageData[app.id]?.[date]?.opens || 0), 0),
    })).sort((a, b) => b.opens - a.opens)
  ), [dateRange, apps, usageData]);

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "var(--bg-card-solid)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px" }}>
        <p style={{ fontWeight: 700, marginBottom: 6, color: "var(--text-primary)", fontSize: 13 }}>{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.fill, fontSize: 12, marginBottom: 2 }}>{p.name}: {formatMinutes(p.value)}</p>)}
      </div>
    );
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "var(--bg-card-solid)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px", fontSize: 13 }}>
        <p style={{ color: payload[0].payload.color, fontWeight: 700 }}>{payload[0].name}</p>
        <p style={{ color: "var(--text-primary)" }}>{formatMinutes(payload[0].value)}</p>
        <p style={{ color: "var(--text-muted)" }}>{((payload[0].value / totalMinutes) * 100).toFixed(1)}%</p>
      </div>
    );
  };

  return (
    <div className="page-enter">
      <div className="bg-accent-blob" />
      <div className="page-header">
        <h1>Reports</h1>
        <p>Insights and trends across your screen time</p>
      </div>

      {/* Range Selector */}
      <div className="date-tabs mb-6">
        {RANGES.map((r, i) => (
          <button key={r.label} className={`date-tab ${rangeIdx === i ? "active" : ""}`} onClick={() => setRangeIdx(i)}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(124,58,237,0.15)" }}>📊</div>
          <div className="stat-info">
            <div className="stat-label">Total Screen Time</div>
            <div className="stat-value">{formatMinutes(totalMinutes)}</div>
            <div className="stat-sub">Over {days} days</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(6,182,212,0.15)" }}>📅</div>
          <div className="stat-info">
            <div className="stat-label">Daily Average</div>
            <div className="stat-value">{formatMinutes(avgDaily)}</div>
            <div className="stat-sub">Per day</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: `${PALETTE[0]}22` }}>{pieData[0]?.icon || "🏆"}</div>
          <div className="stat-info">
            <div className="stat-label">Top App</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{pieData[0]?.name || "—"}</div>
            <div className="stat-sub">{pieData[0] ? formatMinutes(pieData[0].value) : "No data"}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(245,158,11,0.15)" }}>🔄</div>
          <div className="stat-info">
            <div className="stat-label">Total Opens</div>
            <div className="stat-value">{totalOpens.reduce((s, a) => s + a.opens, 0)}</div>
            <div className="stat-sub">App launches</div>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="card mb-6">
        <div className="section-title">Daily Usage by App</div>
        <div className="section-subtitle mb-4">Minutes per day, stacked by app</div>
        <div className="chart-container-tall">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}m`} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
              {apps.map((app, i) => (
                <Bar key={app.id} dataKey={app.name} stackId="a" fill={PALETTE[i % PALETTE.length]}
                  radius={i === apps.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row: Pie + Opens */}
      <div className="charts-row mb-6">
        <div className="card">
          <div className="section-title">Share of Screen Time</div>
          <div className="section-subtitle mb-4">Distribution across apps</div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                  dataKey="value" nameKey="name" paddingAngle={3}
                  label={({ name, percent }) => `${name.split("/")[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, i) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Total App Opens</div>
          <div className="section-subtitle mb-4">How many times each app was launched</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {totalOpens.map((app, i) => (
              <div key={app.name}>
                <div className="flex justify-between mb-2" style={{ fontSize: 13 }}>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{app.icon} {app.name}</span>
                  <span style={{ color: PALETTE[i % PALETTE.length], fontWeight: 700 }}>{app.opens}×</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{
                    width: `${(app.opens / totalOpens[0].opens) * 100}%`,
                    background: PALETTE[i % PALETTE.length]
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-app summary table */}
      <div className="card-solid">
        <div className="section-title mb-4">App Summary Table</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>App</th>
              <th>Total Time</th>
              <th>Daily Avg</th>
              <th>Total Opens</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {pieData.map((app, i) => (
              <tr key={app.name}>
                <td style={{ fontWeight: 600 }}>
                  <span style={{ marginRight: 8 }}>{app.icon}</span>{app.name}
                </td>
                <td style={{ color: app.color, fontWeight: 700 }}>{formatMinutes(app.value)}</td>
                <td>{formatMinutes(Math.round(app.value / days))}</td>
                <td>{totalOpens.find(a => a.name === app.name)?.opens || 0}×</td>
                <td>
                  <span className="badge badge-accent">{((app.value / totalMinutes) * 100).toFixed(1)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
