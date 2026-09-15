import React, { useState, useEffect } from 'react';
import { auditService, blockchainService, paperService } from '../services/api';
import SecurityAlertBanner from '../components/SecurityAlertBanner';
import {
  Database, Shield, ShieldCheck, ShieldAlert, Link2, AlertTriangle,
  CheckCircle2, XCircle, RefreshCw, Search, FileText, Hash, Clock,
  ChevronDown, ChevronRight, Zap
} from 'lucide-react';

export default function AuditorDashboard() {
  const [activeTab, setActiveTab] = useState('blockchain');
  const [blocks, setBlocks] = useState([]);
  const [chainValid, setChainValid] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState('');
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab === 'blockchain') loadBlockchain();
    else loadAuditLogs();
  }, [activeTab]);

  const loadBlockchain = async () => {
    setLoading(true);
    try {
      const [blocksRes, verifyRes] = await Promise.all([
        blockchainService.getBlocks(),
        blockchainService.verifyBlockchain(),
      ]);
      setBlocks(blocksRes.data || []);
      setChainValid(verifyRes.data?.valid ?? verifyRes.data?.chainValid ?? null);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to load blockchain data.' });
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.getLogs({});
      setAuditLogs(res.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to load audit logs.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTamperDemo = async () => {
    setActionLoading('tamper');
    try {
      await blockchainService.tamperBlock(1, 'TAMPERED_PAYLOAD_DEMO');
      setMessage({ type: 'error', text: '⚠ Block #1 has been tampered! The blockchain is now INVALID. Run "Verify Chain" to confirm.' });
      loadBlockchain();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Tamper demo failed.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleRestoreDemo = async () => {
    setActionLoading('restore');
    try {
      await blockchainService.restoreBlockchain();
      setMessage({ type: 'success', text: 'Blockchain restored to a valid state.' });
      loadBlockchain();
    } catch (e) {
      setMessage({ type: 'error', text: 'Restore failed.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleVerifyChain = async () => {
    setActionLoading('verify');
    try {
      const res = await blockchainService.verifyBlockchain();
      const valid = res.data?.valid ?? res.data?.chainValid;
      setChainValid(valid);
      setMessage({
        type: valid ? 'success' : 'error',
        text: valid
          ? '✓ Blockchain integrity verified — all blocks are valid and linked correctly.'
          : '✗ Blockchain verification FAILED — tampering detected!'
      });
    } catch (e) {
      setMessage({ type: 'error', text: 'Verification request failed.' });
    } finally {
      setActionLoading('');
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(term) ||
      (log.username || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term) ||
      (log.entityType || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SecurityAlertBanner />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Database className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Blockchain & Audit Dashboard</h1>
            <p className="text-sm text-slate-400">Tamper-evident ledger & comprehensive audit trail</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('blockchain')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'blockchain'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
          }`}
        >
          <Link2 className="w-4 h-4" />
          Blockchain Ledger
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'audit'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          Audit Logs
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

      {/* BLOCKCHAIN TAB */}
      {activeTab === 'blockchain' && (
        <>
          {/* Chain Status & Actions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {chainValid === true && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">Chain Valid</span>
                  </div>
                )}
                {chainValid === false && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 animate-pulse">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-bold text-red-400">Chain INVALID — Tampering Detected</span>
                  </div>
                )}
                <span className="text-xs text-slate-400">{blocks.length} blocks in chain</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleVerifyChain}
                  disabled={actionLoading === 'verify'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {actionLoading === 'verify' ? 'Verifying...' : 'Verify Chain'}
                </button>
                <button
                  onClick={handleTamperDemo}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Tamper Demo
                </button>
                <button
                  onClick={handleRestoreDemo}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:border-slate-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore
                </button>
              </div>
            </div>
          </div>

          {/* Blocks */}
          {loading ? (
            <div className="text-center py-16 text-slate-400">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" />
              <p className="text-sm">Loading blockchain...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blocks.map((block, index) => (
                <div
                  key={index}
                  className={`bg-slate-900/80 border rounded-2xl transition-colors ${
                    block.valid === false ? 'border-red-500/50' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedBlock(expandedBlock === index ? null : index)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : block.valid === false
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {index === 0 ? 'G' : `#${index}`}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {index === 0 ? 'Genesis Block' : `Block #${index}`}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                          {block.hash ? block.hash.substring(0, 24) + '...' : '—'}
                        </p>
                      </div>
                    </div>
                    {expandedBlock === index ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  {expandedBlock === index && (
                    <div className="px-4 pb-4 space-y-2 text-xs">
                      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-1.5">
                        <div><span className="text-slate-500">Hash:</span> <span className="font-mono text-cyan-400 break-all">{block.hash || '—'}</span></div>
                        <div><span className="text-slate-500">Prev Hash:</span> <span className="font-mono text-slate-400 break-all">{block.previousHash || '0'}</span></div>
                        <div><span className="text-slate-500">Timestamp:</span> <span className="text-slate-300">{block.timestamp || '—'}</span></div>
                        <div><span className="text-slate-500">Data:</span> <span className="text-slate-300 break-all">{block.data || block.payload || '—'}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <>
          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search audit logs by action, user, entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" />
              <p className="text-sm">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-semibold">No audit logs found</p>
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-800/60">
                    <tr className="text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                      <th className="px-4 py-3 text-left font-semibold">User</th>
                      <th className="px-4 py-3 text-left font-semibold">Action</th>
                      <th className="px-4 py-3 text-left font-semibold">Entity</th>
                      <th className="px-4 py-3 text-left font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLogs.map((log, i) => (
                      <tr key={log.id || i} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-mono whitespace-nowrap">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-white font-semibold">{log.username || log.performedBy || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-semibold">
                            {log.action || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{log.entityType || '—'} {log.entityId ? `#${log.entityId}` : ''}</td>
                        <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{log.details || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
