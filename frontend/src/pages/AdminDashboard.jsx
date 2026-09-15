import React, { useState, useEffect } from 'react';
import { userService, alertService } from '../services/api';
import SecurityAlertBanner from '../components/SecurityAlertBanner';
import {
  Users, Shield, ShieldCheck, ShieldAlert, UserCheck, UserX,
  RefreshCw, AlertTriangle, CheckCircle2, Search, Settings, Bell
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    else loadAlerts();
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      setUsers(res.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertService.getAlerts();
      setAlerts(res.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to load alerts.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    setActionLoading(`toggle-${userId}`);
    try {
      await userService.toggleStatus(userId);
      setMessage({ type: 'success', text: 'User status updated.' });
      loadUsers();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to toggle user status.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleResolveAlert = async (alertId) => {
    setActionLoading(`resolve-${alertId}`);
    try {
      await alertService.resolveAlert(alertId);
      setMessage({ type: 'success', text: 'Alert resolved.' });
      loadAlerts();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to resolve alert.' });
    } finally {
      setActionLoading('');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.username || '').toLowerCase().includes(term) ||
      (u.fullName || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
  });

  const getRoleBadge = (role) => {
    const roleStr = (role || '').replace('ROLE_', '');
    const styles = {
      ADMIN: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      QUESTION_SETTER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      REVIEWER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      EXAM_CONTROLLER: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      AUDITOR: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${styles[roleStr] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
        {roleStr}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SecurityAlertBanner />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <Settings className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-400">User management & security monitoring</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'users'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'alerts'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
          }`}
        >
          <Bell className="w-4 h-4" />
          Security Alerts
        </button>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-sm">{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search users by name, username, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" />
              <p className="text-sm">Loading users...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => (
                <div key={u.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{u.fullName || u.username}</h3>
                      <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      u.active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {u.active ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>

                  {u.email && (
                    <p className="text-xs text-slate-400 mb-3">{u.email}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {/* roles come as plain strings e.g. "ROLE_ADMIN" from the backend UserDto */}
                    {(u.roles || []).map((role, i) => (
                      <span key={i}>{getRoleBadge(typeof role === 'string' ? role : role?.name)}</span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleToggleStatus(u.id)}
                    disabled={actionLoading === `toggle-${u.id}`}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                      u.active
                        ? 'bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                    }`}
                  >
                    {u.active ? (
                      <><UserX className="w-3.5 h-3.5" /> Disable User</>
                    ) : (
                      <><UserCheck className="w-3.5 h-3.5" /> Enable User</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ALERTS TAB */}
      {activeTab === 'alerts' && (
        <>
          {loading ? (
            <div className="text-center py-16 text-slate-400">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" />
              <p className="text-sm">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-semibold">No security alerts</p>
              <p className="text-sm mt-1">The system is secure. No alerts to display.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`bg-slate-900/80 border rounded-2xl p-5 ${
                    alert.resolved ? 'border-slate-800' : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {alert.resolved ? (
                        <CheckCircle2 className="w-5 h-5 text-slate-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 animate-pulse" />
                      )}
                      <div>
                        <h3 className={`text-sm font-bold ${alert.resolved ? 'text-slate-400' : 'text-white'}`}>
                          {alert.type || alert.alertType || 'Security Alert'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{alert.message || alert.description || '—'}</p>
                        <p className="text-[10px] text-slate-500 mt-1.5 font-mono">
                          {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : '—'}
                        </p>
                      </div>
                    </div>

                    {!alert.resolved && (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        disabled={actionLoading === `resolve-${alert.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-50 shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
