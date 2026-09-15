import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Key, ArrowRight, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { username: 'setter', role: 'QUESTION_SETTER', name: 'Dr. Alan Turing', desc: 'Create & submit question papers', pass: 'Setter@123', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400' },
  { username: 'reviewer', role: 'REVIEWER', name: 'Prof. Grace Hopper', desc: 'Inspect & approve/reject submissions', pass: 'Reviewer@123', color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400' },
  { username: 'controller', role: 'EXAM_CONTROLLER', name: 'Dr. John von Neumann', desc: 'AES encryption, lock & secure release', pass: 'Controller@123', color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400' },
  { username: 'auditor', role: 'AUDITOR', name: 'Ada Lovelace', desc: 'Verify blockchain & paper SHA-256 integrity', pass: 'Auditor@123', color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400' },
  { username: 'admin', role: 'ADMIN', name: 'System Administrator', desc: 'User management & security monitoring', pass: 'Admin@123', color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('setter');
  const [password, setPassword] = useState('Setter@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      const roles = user.roles || [];
      if (roles.includes('ROLE_QUESTION_SETTER')) navigate('/setter');
      else if (roles.includes('ROLE_REVIEWER')) navigate('/reviewer');
      else if (roles.includes('ROLE_EXAM_CONTROLLER')) navigate('/controller');
      else if (roles.includes('ROLE_AUDITOR')) navigate('/auditor');
      else if (roles.includes('ROLE_ADMIN')) navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemo = (acc) => {
    setUsername(acc.username);
    setPassword(acc.pass);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: System Info & Demo Accounts */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" />
              Secure Examination Management Prototype
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              ExamShield
            </h1>
            <p className="text-lg text-slate-300 font-medium mt-1">
              Secure Question Paper Leakage Prevention & Audit System
            </p>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Minimizing exposure time through role-segregated authorization, AES-256 question encryption, SHA-256 cryptographic integrity seals, and a tamper-evident blockchain audit ledger.
            </p>
          </div>

          {/* 1-Click Demo Accounts Selection */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-sky-400" />
              1-Click Demo Accounts (Click to Autofill)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => selectDemo(acc)}
                  type="button"
                  className={`p-3 rounded-xl border text-left bg-gradient-to-r transition-all duration-200 hover:scale-[1.02] ${acc.color} ${
                    username === acc.username ? 'ring-2 ring-sky-400' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{acc.name}</span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black/40">
                      {acc.username}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{acc.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sign In to ExamShield</h3>
                <p className="text-xs text-slate-400">Enter your credentials or choose a demo account</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="e.g. setter"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <span>Authenticate & Access Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400">
                JWT Authentication &bull; BCrypt Hashed Passwords &bull; Role-Based Access Control
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
