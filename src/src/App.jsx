import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TrackerProvider } from "./context/TrackerContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Apps from "./pages/Apps";
import AppDetail from "./pages/AppDetail";
import Limits from "./pages/Limits";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <TrackerProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/apps" element={<Apps />} />
              <Route path="/apps/:appId" element={<AppDetail />} />
              <Route path="/limits" element={<Limits />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TrackerProvider>
  );
}
