import React from 'react';
import { 
  FileEdit, 
  Send, 
  CheckSquare, 
  Key, 
  Lock, 
  Database, 
  Clock, 
  PlayCircle, 
  CheckCircle,
  FileCheck2
} from 'lucide-react';

const STEPS = [
  { id: 'DRAFT', label: '1. Paper Draft', desc: 'Setter adds questions', icon: FileEdit },
  { id: 'SUBMITTED', label: '2. Submitted', desc: 'Awaiting review', icon: Send },
  { id: 'APPROVED', label: '3. Approved', desc: 'Reviewer cleared', icon: CheckSquare },
  { id: 'LOCKED', label: '4. AES & Locked', desc: 'SHA-256 & Blockchain seal', icon: Lock },
  { id: 'SCHEDULED', label: '5. Scheduled', desc: 'Secure release timer', icon: Clock },
  { id: 'RELEASED', label: '6. Released', desc: 'Decrypted at exam time', icon: PlayCircle },
  { id: 'COMPLETED', label: '7. Post-Audit', desc: 'Ledger integrity verified', icon: FileCheck2 },
];

export default function WorkflowTimeline({ currentStatus = 'DRAFT' }) {
  const getStepIndex = (status) => {
    switch (status) {
      case 'DRAFT': return 0;
      case 'SUBMITTED': return 1;
      case 'APPROVED': return 2;
      case 'LOCKED': return 3;
      case 'RELEASED': return 5;
      case 'EXAM_STARTED': return 5;
      case 'EXAM_COMPLETED': return 6;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            Exam Paper Security Lifecycle
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Automated state transitions and cryptographic enforcement</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-400">Current Phase: </span>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
            currentStatus === 'LOCKED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
            currentStatus === 'RELEASED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
            currentStatus === 'APPROVED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
            currentStatus === 'SUBMITTED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
            'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            {currentStatus}
          </span>
        </div>
      </div>

      <div className="relative flex items-center justify-between mt-6 overflow-x-auto pb-3">
        {/* Horizontal Connector Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-5 h-0.5 bg-slate-800 -z-0"></div>
        <div 
          className="absolute left-6 top-1/2 -translate-y-5 h-0.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 -z-0 transition-all duration-700"
          style={{ width: `${Math.min(100, (currentIndex / (STEPS.length - 1)) * 100)}%` }}
        ></div>

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center min-w-[110px] px-2 text-center group">
              <div 
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-sky-500 text-white border-sky-300 shadow-lg shadow-sky-500/40 scale-110' 
                    : isDone 
                    ? 'bg-slate-800 text-sky-400 border-sky-500/40' 
                    : 'bg-slate-900 text-slate-600 border-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold mt-2 ${isCurrent ? 'text-sky-300' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
