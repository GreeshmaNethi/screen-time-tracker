import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTracker } from "../context/TrackerContext";

const navItems = [
  { to: "/", icon: "🏠", label: "Dashboard" },
  { to: "/apps", icon: "📱", label: "Apps" },
  { to: "/limits", icon: "⏱️", label: "Limits" },
  { to: "/reports", icon: "📊", label: "Reports" },
  { to: "/settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar() {
  const { theme, setTheme } = useTracker();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⏳</div>
        <div>
          <h2>ScreenTime</h2>
          <span>Tracker Pro</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-title">Navigation</span>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="theme-toggle-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <span className="nav-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}
