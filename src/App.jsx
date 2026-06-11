import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/appStore';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import DetailPanel from './components/layout/DetailPanel';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SignalFeed from './pages/SignalFeed';
import SignalDetail from './pages/SignalDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Workforce from './pages/Workforce';
import EmployeeProfile from './pages/EmployeeProfile';
import Patterns from './pages/Patterns';
import PredictionHistory from './pages/PredictionHistory';
import AccuracyReport from './pages/AccuracyReport';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';

function RequireAuth({ children }) {
  const currentUser = useAppStore((s) => s.currentUser);
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function AppShell({ withDetailPanel = false }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer on navigation
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet context={{ openDrawer: () => setDrawerOpen(true) }} />
        </main>
        {withDetailPanel && <DetailPanel drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: 7,
            border: '1px solid #DCE4EC',
            background: '#FFFFFF',
            color: '#2A3A4A',
            fontSize: 13,
            fontFamily: '"DM Sans", system-ui, sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Dashboard gets the right detail panel */}
        <Route element={<RequireAuth><AppShell withDetailPanel /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Everything else: full-width content */}
        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route path="/signals" element={<SignalFeed />} />
          <Route path="/signals/:id" element={<SignalDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/workforce" element={<Workforce />} />
          <Route path="/workforce/:employeeId" element={<EmployeeProfile />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/intelligence/history" element={<PredictionHistory />} />
          <Route path="/intelligence/accuracy" element={<AccuracyReport />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/alerts" element={<Settings />} />
          <Route path="/settings/patterns" element={<Settings />} />
          <Route path="/settings/team" element={<Settings />} />
          <Route path="/settings/integrations" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
