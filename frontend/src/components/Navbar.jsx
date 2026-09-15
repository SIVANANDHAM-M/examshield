import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alertService } from '../services/api';
import { 
  Shield, 
  Lock, 
  FileCheck, 
  Database, 
  Eye, 
  Users, 
  LogOut, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Radio,
  ChevronDown
} from 'lucide-react';

const DEMO_USERS = [
  { username: 'setter', label: 'Question Setter (Turing)', role: 'ROLE_QUESTION_SETTER', pass: 'Setter@123', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { username: 'reviewer', label: 'Reviewer (Hopper)', role: 'ROLE_REVIEWER', pass: 'Reviewer@123', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { username: 'controller', label: 'Exam Controller (von Neumann)', role: 'ROLE_EXAM_CONTROLLER', pass: 'Controller@123', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { username: 'auditor', label: 'Auditor (Lovelace)', role: 'ROLE_AUDITOR', pass: 'Auditor@123', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { username: 'admin', label: 'Admin (System)', role: 'ROLE_ADMIN', pass: 'Admin@123', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
];

export default function Navbar() {
  const { user, logout, login, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      alertService.getActiveAlerts()
        .then(res => setActiveAlerts(res.data))
        .catch(() => {});
      const interval = setInterval(() => {
        alertService.getActiveAlerts()
          .then(res => setActiveAlerts(res.data))
          .catch(() => {});
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSwitchUser = async (demo) => {
    try {
      await login(demo.username, demo.pass);
      setDemoMenuOpen(false);
      // Redirect to relevant dashboard
      if (demo.role === 'ROLE_QUESTION_SETTER') navigate('/setter');
      else if (demo.role === 'ROLE_REVIEWER') navigate('/reviewer');
      else if (demo.role === 'ROLE_EXAM_CONTROLLER') navigate('/controller');
      else if (demo.role === 'ROLE_AUDITOR') navigate('/auditor');
      else if (demo.role === 'ROLE_ADMIN') navigate('/admin');
    } catch (e) {
      console.error(e);
    }
  };

  const primaryRole = user?.roles?.[0]?.replace('ROLE_', '') || 'GUEST';

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">ExamShield</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-semibold border border-sky-500/30">PROTOTYPE</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Secure Question Paper Leakage Prevention</p>
            </div>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {/* Question Setter link */}
              {(hasRole('QUESTION_SETTER') || hasRole('ADMIN')) && (
                <Link
                  to="/setter"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/setter')
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Setter Hub
                </Link>
              )}

              {/* Reviewer link */}
              {(hasRole('REVIEWER') || hasRole('ADMIN')) && (
                <Link
                  to="/reviewer"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/reviewer')
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  Review Queue
                </Link>
              )}

              {/* Controller link */}
              {(hasRole('EXAM_CONTROLLER') || hasRole('ADMIN')) && (
                <Link
                  to="/controller"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/controller')
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Exam Controller
                </Link>
              )}

              {/* Auditor link */}
              {(hasRole('AUDITOR') || hasRole('ADMIN') || hasRole('EXAM_CONTROLLER')) && (
                <Link
                  to="/auditor"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/auditor')
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  Blockchain & Audit
                </Link>
              )}

              {/* Admin link */}
              {hasRole('ADMIN') && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Active Alerts Pill */}
                {activeAlerts.length > 0 && (
                  <Link
                    to="/auditor"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold animate-pulse"
                    title={`${activeAlerts.length} active security alerts detected`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{activeAlerts.length} Alerts</span>
                  </Link>
                )}

                {/* Quick Role Switcher Dropdown for Viva / Demo */}
                <div className="relative">
                  <button
                    onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 hover:border-slate-600 transition-colors"
                    title="Switch Demo Role"
                  >
                    <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
                    <span className="font-mono text-slate-300">{user.username}</span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-bold">
                      {primaryRole}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {demoMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Demo Account
                      </div>
                      {DEMO_USERS.map((demo) => (
                        <button
                          key={demo.username}
                          onClick={() => handleSwitchUser(demo)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/70 transition-colors ${
                            user.username === demo.username ? 'bg-slate-800 font-bold' : ''
                          }`}
                        >
                          <span className="text-slate-200">{demo.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${demo.color}`}>
                            {demo.username}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-sky-600/20"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
