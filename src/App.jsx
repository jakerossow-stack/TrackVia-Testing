import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/appStore';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SignalFeed } from './pages/SignalFeed';
import { SignalDetail } from './pages/SignalDetail';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Workforce } from './pages/Workforce';
import { EmployeeProfile } from './pages/EmployeeProfile';
import { Compliance } from './pages/Compliance';
import { Settings } from './pages/Settings';
import { PatternLibrary } from './pages/PatternLibrary';
import { PredictionHistory } from './pages/PredictionHistory';
import { AccuracyReport } from './pages/AccuracyReport';

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const currentUser = useAppStore(s => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function Protected({ children }) {
  return (
    <RequireAuth>
      <AppLayout>{children}</AppLayout>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: 13, fontFamily: 'DM Sans', borderRadius: 8 } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/signals" element={<Protected><SignalFeed /></Protected>} />
        <Route path="/signals/:id" element={<Protected><SignalDetail /></Protected>} />
        <Route path="/projects" element={<Protected><Projects /></Protected>} />
        <Route path="/projects/:id" element={<Protected><ProjectDetail /></Protected>} />
        <Route path="/workforce" element={<Protected><Workforce /></Protected>} />
        <Route path="/workforce/:employeeId" element={<Protected><EmployeeProfile /></Protected>} />
        <Route path="/compliance" element={<Protected><Compliance /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/patterns" element={<Protected><PatternLibrary /></Protected>} />
        <Route path="/intelligence/history" element={<Protected><PredictionHistory /></Protected>} />
        <Route path="/intelligence/accuracy" element={<Protected><AccuracyReport /></Protected>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
