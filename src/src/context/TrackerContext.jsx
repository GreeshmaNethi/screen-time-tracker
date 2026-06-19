import React, { createContext, useContext, useState, useEffect } from "react";
import { generateMockUsage, generateDefaultLimits, APPS, generateTodayData } from "../data/mockData";
import { format } from "date-fns";

const TrackerContext = createContext();

export function TrackerProvider({ children }) {
  const today = format(new Date(), "yyyy-MM-dd");

  const [apps] = useState(APPS);
  const [usageData, setUsageData] = useState(() => {
    const stored = localStorage.getItem("stt_usage");
    const parsed = stored ? JSON.parse(stored) : generateMockUsage();

    // ✅ Fix: If today's date is missing for any app, generate fresh data for today
    let needsUpdate = false;
    APPS.forEach(app => {
      if (!parsed[app.id]) parsed[app.id] = {};
      if (!parsed[app.id][today]) {
        parsed[app.id][today] = generateTodayData();
        needsUpdate = true;
      }
    });
    if (needsUpdate) {
      localStorage.setItem("stt_usage", JSON.stringify(parsed));
    }
    return parsed;
  });
  const [limits, setLimits] = useState(() => {
    const stored = localStorage.getItem("stt_limits");
    return stored ? JSON.parse(stored) : generateDefaultLimits();
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("stt_theme") || "dark");

  useEffect(() => {
    localStorage.setItem("stt_usage", JSON.stringify(usageData));
  }, [usageData]);

  useEffect(() => {
    localStorage.setItem("stt_limits", JSON.stringify(limits));
  }, [limits]);

  useEffect(() => {
    localStorage.setItem("stt_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const getTodayUsage = (appId) => usageData[appId]?.[today] || { totalMinutes: 0, opens: 0, hourly: new Array(24).fill(0) };

  const getWeekUsage = (appId) => {
    const days = [];
    for (let d = 6; d >= 0; d--) {
      const date = format(new Date(Date.now() - d * 86400000), "yyyy-MM-dd");
      const label = format(new Date(Date.now() - d * 86400000), "EEE");
      const data = usageData[appId]?.[date] || { totalMinutes: 0, opens: 0 };
      days.push({ date, label, ...data });
    }
    return days;
  };

  const setLimit = (appId, minutes, enabled) => {
    setLimits(prev => ({ ...prev, [appId]: { minutes, enabled } }));
  };

  const isOverLimit = (appId) => {
    const limit = limits[appId];
    if (!limit || !limit.enabled) return false;
    return getTodayUsage(appId).totalMinutes >= limit.minutes;
  };

  const isNearLimit = (appId) => {
    const limit = limits[appId];
    if (!limit || !limit.enabled) return false;
    const usage = getTodayUsage(appId).totalMinutes;
    return usage >= limit.minutes * 0.8 && usage < limit.minutes;
  };

  const resetData = () => {
    const fresh = generateMockUsage();
    setUsageData(fresh);
  };

  const getTotalTodayMinutes = () =>
    apps.reduce((sum, app) => sum + getTodayUsage(app.id).totalMinutes, 0);

  const getMostUsedApp = () => {
    let max = -1, maxApp = null;
    apps.forEach(app => {
      const m = getTodayUsage(app.id).totalMinutes;
      if (m > max) { max = m; maxApp = app; }
    });
    return maxApp;
  };

  const getAppsOverLimit = () => apps.filter(a => isOverLimit(a.id));

  return (
    <TrackerContext.Provider value={{
      apps, usageData, limits, theme, setTheme, today,
      getTodayUsage, getWeekUsage, setLimit,
      isOverLimit, isNearLimit, resetData,
      getTotalTodayMinutes, getMostUsedApp, getAppsOverLimit,
    }}>
      {children}
    </TrackerContext.Provider>
  );
}

export const useTracker = () => useContext(TrackerContext);
