import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import QuestionSetterDashboard from './pages/QuestionSetterDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import ControllerDashboard from './pages/ControllerDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = user.roles?.some(r => allowedRoles.includes(r));
    if (!hasAccess) return <Navigate to="/" replace />;
  }
  return children;
}

function HomePage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Auto-redirect to the user's primary dashboard
  const roles = user.roles || [];
  if (roles.includes('ROLE_QUESTION_SETTER')) return <Navigate to="/setter" replace />;
  if (roles.includes('ROLE_REVIEWER')) return <Navigate to="/reviewer" replace />;
  if (roles.includes('ROLE_EXAM_CONTROLLER')) return <Navigate to="/controller" replace />;
  if (roles.includes('ROLE_AUDITOR')) return <Navigate to="/auditor" replace />;
  if (roles.includes('ROLE_ADMIN')) return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/setter"
            element={
              <ProtectedRoute allowedRoles={['ROLE_QUESTION_SETTER', 'ROLE_ADMIN']}>
                <QuestionSetterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviewer"
            element={
              <ProtectedRoute allowedRoles={['ROLE_REVIEWER', 'ROLE_ADMIN']}>
                <ReviewerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/controller"
            element={
              <ProtectedRoute allowedRoles={['ROLE_EXAM_CONTROLLER', 'ROLE_ADMIN']}>
                <ControllerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditor"
            element={
              <ProtectedRoute allowedRoles={['ROLE_AUDITOR', 'ROLE_EXAM_CONTROLLER', 'ROLE_ADMIN']}>
                <AuditorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
