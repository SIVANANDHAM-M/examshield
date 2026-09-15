import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  WifiOff, 
  Radio, 
  AlertOctagon, 
  FileText, 
  Clock, 
  CheckCircle2,
  HardDriveDownload
} from 'lucide-react';

export default function ControlledIsolationCard({ paper, onScheduleRelease, onRelease }) {
  if (!paper) return null;

  const isLocked = paper.status === 'LOCKED';
  const isReleased = paper.status === 'RELEASED';
  const hash = paper.originalSha256Hash || '';
  const partialHash = hash.length > 16 
    ? `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}` 
    : hash || 'PENDING_FINALIZATION';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
        isLocked ? 'bg-amber-500/10' : isReleased ? 'bg-emerald-500/10' : 'bg-slate-800/20'
      }`}></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
            isLocked ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
            isReleased ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
            'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {isLocked ? <Lock className="w-6 h-6 animate-pulse" /> :
             isReleased ? <CheckCircle2 className="w-6 h-6" /> :
             <FileText className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Controlled Security Isolation Period
              </h3>
              {paper.securityPeriodActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  SECURITY PERIOD ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict cryptographic lockdown minimizing exposure window prior to examination commencement
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Paper Status: </span>
            <span className={`font-mono font-bold ${
              isLocked ? 'text-amber-400' : isReleased ? 'text-emerald-400' : 'text-slate-300'
            }`}>
              {paper.status}
            </span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Encryption: </span>
            <span className="font-mono font-bold text-sky-400">
              {paper.encryptedContent ? 'AES-256-GCM' : 'UNENCRYPTED'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Security Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        
        {/* Integrity Hash */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Integrity SHA-256</span>
            <Key className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="font-mono text-xs text-slate-200 font-medium break-all" title={hash}>
            {partialHash}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {hash ? 'Cryptographic footprint sealed' : 'Awaiting finalization'}
          </span>
        </div>

        {/* Access Authorization */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Access Policy</span>
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-amber-300">
            {isLocked ? 'STRICTLY RESTRICTED' : isReleased ? 'EXAM SESSION ACTIVE' : 'EDITOR / REVIEW ACCESS'}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isLocked ? 'Setters & Reviewers barred' : 'Controlled distribution'}
          </span>
        </div>

        {/* Communication / Export Policy */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Isolation Policy</span>
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-xs font-semibold text-rose-300">
            {isLocked ? 'EXPORT & COPY BLOCKED' : isReleased ? 'WATERMARKED DISPLAY' : 'COLLABORATION OPEN'}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Application-level tamper guards
          </span>
        </div>

        {/* Audit Monitor */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Audit Monitoring</span>
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs font-semibold text-emerald-300">
            CONTINUOUS LOGGING
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Every read & mutation audited
          </span>
        </div>
      </div>

      {/* Release Control Actions for Exam Controller */}
      {isLocked && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-white">Scheduled Release Control</p>
              <p className="text-[11px] text-slate-400">
                {paper.scheduledReleaseTime 
                  ? `Scheduled for: ${new Date(paper.scheduledReleaseTime).toLocaleString()}`
                  : 'No scheduled release timer configured yet'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onScheduleRelease && (
              <button
                onClick={onScheduleRelease}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              >
                Set Release Schedule
              </button>
            )}
            {onRelease && (
              <button
                onClick={onRelease}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
              >
                <HardDriveDownload className="w-3.5 h-3.5" />
                Authorize Immediate Release
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
