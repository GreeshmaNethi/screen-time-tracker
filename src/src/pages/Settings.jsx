import React, { useState } from "react";
import { useTracker } from "../context/TrackerContext";

export default function Settings() {
  const { theme, setTheme, resetData } = useTracker();
  const [notifLimits, setNotifLimits] = useState(true);
  const [notifDaily, setNotifDaily] = useState(false);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };

  const Toggle = ({ value, onChange }) => (
    <label className="toggle-switch">
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-knob" />
    </label>
  );

  return (
    <div className="page-enter">
      <div className="bg-accent-blob" />
      <div className="page-header">
        <h1>Settings</h1>
        <p>Customize your Screen Time Tracker experience</p>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">
              {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </div>
            <div className="settings-row-sub">Switch between dark and light theme</div>
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: "8px 16px", fontSize: 13 }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            Switch to {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Current Theme</div>
            <div className="settings-row-sub">Active color scheme</div>
          </div>
          <span className="badge badge-accent">{theme === "dark" ? "🌙 Dark" : "☀️ Light"}</span>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-section">
        <h3>Notifications</h3>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">⚠️ Limit Alerts</div>
            <div className="settings-row-sub">Alert when you're near or over a time limit</div>
          </div>
          <Toggle value={notifLimits} onChange={setNotifLimits} />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">📅 Daily Summary</div>
            <div className="settings-row-sub">Get a recap of your screen time each evening</div>
          </div>
          <Toggle value={notifDaily} onChange={setNotifDaily} />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">📊 Weekly Report</div>
            <div className="settings-row-sub">Receive a weekly screen time report every Sunday</div>
          </div>
          <Toggle value={notifWeekly} onChange={setNotifWeekly} />
        </div>
      </div>

      {/* Apps Tracked */}
      <div className="settings-section">
        <h3>Tracked Apps</h3>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">📱 Social Media Apps</div>
            <div className="settings-row-sub">Instagram, LinkedIn, Twitter/X, YouTube, TikTok, Reddit, Snapchat</div>
          </div>
          <span className="badge badge-accent">7 Apps</span>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section">
        <h3>Data Management</h3>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">🗄️ Storage</div>
            <div className="settings-row-sub">Usage data is stored locally in your browser</div>
          </div>
          <span className="badge badge-accent">localStorage</span>
        </div>
        <div className="settings-row" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
          <div>
            <div className="settings-row-label" style={{ color: "var(--red)" }}>🔄 Reset Usage Data</div>
            <div className="settings-row-sub">Regenerate all mock usage data (cannot be undone)</div>
          </div>
          <button className={`btn ${resetDone ? "btn-ghost" : "btn-danger"}`} onClick={handleReset} style={{ fontSize: 13, padding: "8px 16px" }}>
            {resetDone ? "✓ Reset Done!" : "Reset Data"}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <h3>About</h3>
        <div className="card" style={{ background: "var(--bg-card)" }}>
          <div className="flex items-center gap-4 mb-4">
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28
            }}>⏳</div>
            <div>
              <div style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 800 }}>ScreenTime Tracker Pro</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Version 1.0.0</div>
            </div>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
            A premium screen time tracking app for social media. Monitor your daily usage, set healthy limits,
            and gain insights into your digital habits — all in a beautiful, modern interface.
          </p>
          <div className="flex gap-2 mt-4" style={{ flexWrap: "wrap" }}>
            <span className="badge badge-accent">React JS</span>
            <span className="badge badge-accent">Recharts</span>
            <span className="badge badge-accent">React Router</span>
            <span className="badge badge-accent">localStorage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
