import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './components/ui/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ConsultationPage from './pages/ConsultationPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import FinancePage from './pages/FinancePage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './store/auth';
import type { UserRole } from '@shared/index';

function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LayoutRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  return (
    <RequireAuth roles={roles}>
      <AppLayout>{children}</AppLayout>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LayoutRoute><DashboardPage /></LayoutRoute>} />
        <Route path="/consultation"
          element={<LayoutRoute roles={['admin', 'planner', 'customer']}><ConsultationPage /></LayoutRoute>} />
        <Route path="/projects"
          element={<LayoutRoute roles={['admin', 'planner', 'customer']}><ProjectsPage /></LayoutRoute>} />
        <Route path="/projects/:id"
          element={<LayoutRoute roles={['admin', 'planner', 'customer']}><ProjectDetailPage /></LayoutRoute>} />
        <Route path="/vendor"
          element={<LayoutRoute roles={['admin', 'planner', 'vendor']}><VendorDashboardPage /></LayoutRoute>} />
        <Route path="/finance"
          element={<LayoutRoute roles={['admin', 'planner', 'customer']}><FinancePage /></LayoutRoute>} />
        <Route path="/settings"
          element={<LayoutRoute roles={['admin']}><SettingsPage /></LayoutRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
