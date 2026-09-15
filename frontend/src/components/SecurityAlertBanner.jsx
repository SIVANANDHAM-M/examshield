import React, { useState, useEffect } from 'react';
import { alertService } from '../services/api';
import { AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';

export default function SecurityAlertBanner() {
  const [alerts, setAlerts] = useState([]);

  const loadAlerts = () => {
    alertService.getActiveAlerts()
      .then(res => setAlerts(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadAlerts();
    const timer = setInterval(loadAlerts, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleResolve = async (id) => {
    try {
      await alertService.resolveAlert(id);
      loadAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
            alert.severity === 'CRITICAL'
              ? 'bg-rose-950/80 border-rose-600/50 text-rose-200 shadow-rose-900/20'
              : alert.severity === 'HIGH'
              ? 'bg-amber-950/80 border-amber-600/50 text-amber-200 shadow-amber-900/20'
              : 'bg-sky-950/80 border-sky-600/50 text-sky-200 shadow-sky-900/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              alert.severity === 'CRITICAL' ? 'bg-rose-900/50 text-rose-300' : 'bg-amber-900/50 text-amber-300'
            }`}>
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40">
                  {alert.alertType}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs font-medium mt-0.5">{alert.description}</p>
            </div>
          </div>

          <button
            onClick={() => handleResolve(alert.id)}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Dismiss / Resolve
          </button>
        </div>
      ))}
    </div>
  );
}
