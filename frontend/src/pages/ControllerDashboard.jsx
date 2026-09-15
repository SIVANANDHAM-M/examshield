import React, { useState, useEffect } from 'react';
import { paperService, blockchainService } from '../services/api';
import SecurityAlertBanner from '../components/SecurityAlertBanner';
import {
  Lock, Unlock, Shield, ShieldCheck, ShieldAlert, Clock, Send,
  CheckCircle2, XCircle, FileText, Eye, AlertTriangle, RefreshCw
} from 'lucide-react';

export default function ControllerDashboard() {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [decryptedContent, setDecryptedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const res = await paperService.getAllPapers();
      setPapers(res.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to load papers.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (paperId) => {
    setActionLoading(`finalize-${paperId}`);
    try {
      await paperService.finalizePaper(paperId);
      setMessage({ type: 'success', text: 'Paper finalized & encrypted with AES-256 successfully!' });
      loadPapers();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Finalization failed.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleRelease = async (paperId) => {
    setActionLoading(`release-${paperId}`);
    try {
      await paperService.releasePaper(paperId);
      setMessage({ type: 'success', text: 'Paper released for examination!' });
      loadPapers();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Release failed.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleViewDecrypted = async (paperId) => {
    setActionLoading(`decrypt-${paperId}`);
    try {
      const res = await paperService.getDecryptedContent(paperId);
      setDecryptedContent(res.data);
      setSelectedPaper(paperId);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to decrypt paper content.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleVerifyIntegrity = async (paperId) => {
    setActionLoading(`verify-${paperId}`);
    try {
      const res = await paperService.verifyIntegrity(paperId);
      const data = res.data;
      if (data.integrityValid || data.valid) {
        setMessage({ type: 'success', text: `Integrity check PASSED ✓ — SHA-256 hash matches.` });
      } else {
        setMessage({ type: 'error', text: `Integrity check FAILED ✗ — Paper may have been tampered with!` });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Integrity verification failed.' });
    } finally {
      setActionLoading('');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      SUBMITTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      UNDER_REVIEW: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
      FINALIZED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      RELEASED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${styles[status] || styles.DRAFT}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SecurityAlertBanner />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Exam Controller Dashboard</h1>
              <p className="text-sm text-slate-400">AES-256 encryption, integrity verification & secure release</p>
            </div>
          </div>
        </div>
        <button
          onClick={loadPapers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:border-slate-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
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

      {/* Papers Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" />
          <p className="text-sm">Loading papers...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-semibold">No papers found</p>
          <p className="text-sm mt-1">Papers will appear here once question setters submit them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{paper.examTitle || paper.title || `Paper #${paper.id}`}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Paper ID: {paper.id}</p>
                </div>
                {getStatusBadge(paper.status)}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                  <span className="text-slate-500">Questions</span>
                  <p className="text-white font-semibold">{paper.totalQuestions || '—'}</p>
                </div>
                <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                  <span className="text-slate-500">Encrypted</span>
                  <p className={`font-semibold ${paper.encrypted ? 'text-amber-400' : 'text-slate-500'}`}>
                    {paper.encrypted ? 'Yes ✓' : 'No'}
                  </p>
                </div>
              </div>

              {/* SHA-256 Hash */}
              {paper.sha256Hash && (
                <div className="mb-4 bg-slate-950 rounded-lg p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">SHA-256 Integrity Hash</span>
                  <p className="text-[11px] font-mono text-cyan-400 break-all mt-1">{paper.sha256Hash}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {paper.status === 'APPROVED' && (
                  <button
                    onClick={() => handleFinalize(paper.id)}
                    disabled={actionLoading === `finalize-${paper.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {actionLoading === `finalize-${paper.id}` ? 'Encrypting...' : 'Finalize & Encrypt'}
                  </button>
                )}

                {paper.status === 'FINALIZED' && (
                  <button
                    onClick={() => handleRelease(paper.id)}
                    disabled={actionLoading === `release-${paper.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {actionLoading === `release-${paper.id}` ? 'Releasing...' : 'Release Paper'}
                  </button>
                )}

                {(paper.status === 'FINALIZED' || paper.status === 'RELEASED') && (
                  <>
                    <button
                      onClick={() => handleViewDecrypted(paper.id)}
                      disabled={actionLoading === `decrypt-${paper.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold hover:bg-sky-500/20 transition-colors disabled:opacity-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Decrypt & View
                    </button>
                    <button
                      onClick={() => handleVerifyIntegrity(paper.id)}
                      disabled={actionLoading === `verify-${paper.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify Integrity
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decrypted Content Modal */}
      {decryptedContent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Unlock className="w-5 h-5 text-amber-400" />
                Decrypted Paper Content
              </h3>
              <button
                onClick={() => { setDecryptedContent(null); setSelectedPaper(null); }}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            <pre className="bg-slate-950 rounded-xl p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap border border-slate-800 overflow-x-auto">
              {typeof decryptedContent === 'string' ? decryptedContent : JSON.stringify(decryptedContent, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
