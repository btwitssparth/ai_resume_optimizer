import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./views/Dashboard";
import Analyzer from "./views/Analyzer";
import History from "./views/History";
import Builder from "./views/Builder";
import Settings from "./views/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Route the base URL into the app */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      
      {/* Actual Pages */}
      <Route path="/app/dashboard" element={<Dashboard />} />
      <Route path="/app/resume/analyzer" element={<Analyzer />} />
      <Route path="/app/history" element={<History />} />
      <Route path="/app/resume/builder" element={<Builder />} />
      <Route path="/app/settings" element={<Settings />} />

      {/* Placeholders for unbuilt features */}
      <Route path="/app/matcher" element={<Navigate to="/app/resume/analyzer" replace />} />
      <Route path="/app/resume/versions" element={<Navigate to="/app/history" replace />} />

      {/* Catch-all for 404s */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}