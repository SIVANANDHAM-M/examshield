import React, { useState, useEffect } from 'react';
import { paperService, examService } from '../services/api';
import WorkflowTimeline from '../components/WorkflowTimeline';
import SecurityAlertBanner from '../components/SecurityAlertBanner';
import { 
  CheckSquare, 
  XSquare, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Calendar, 
  Clock, 
  Award,
  MessageSquare
} from 'lucide-react';

export default function ReviewerDashboard() {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isApproveAction, setIsApproveAction] = useState(true);
  const [reviewComments, setReviewComments] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadPapers = async () => {
    try {
      const res = await paperService.getAllPapers();
      setPapers(res.data);
      if (res.data.length > 0 && !selectedPaper) {
        selectPaper(res.data[0]);
      } else if (selectedPaper) {
        const updated = res.data.find(p => p.id === selectedPaper.id);
        if (updated) selectPaper(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPapers();
  }, []);

  const selectPaper = async (paper) => {
    setSelectedPaper(paper);
    if (paper.examId) {
      try {
        const res = await examService.getExamById(paper.examId);
        setSelectedExam(res.data);
      } catch (err) {
        setSelectedExam(null);
      }
    }
  };

  const openReviewModal = (approve) => {
    setIsApproveAction(approve);
    setReviewComments(approve 
      ? "Syllabus mapping verified. Question difficulty and formatting conform to examination guidelines." 
      : "Modification requested: Questions require better Bloom's taxonomy distribution.");
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPaper) return;
    try {
      setLoading(true);
      if (isApproveAction) {
        await paperService.approvePaper(selectedPaper.id, reviewComments);
        setStatusMessage(`Question Paper for ${selectedExam?.examName} APPROVED successfully!`);
      } else {
        await paperService.rejectPaper(selectedPaper.id, reviewComments);
        setStatusMessage(`Question Paper for ${selectedExam?.examName} REJECTED with feedback.`);
      }
      setReviewModalOpen(false);
      await loadPapers();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Review action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SecurityAlertBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Role: REVIEWER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Question Paper Review Board
          </h1>
          <p className="text-sm text-slate-400">
            Inspect author submissions, audit syllabus compliance, and authorize or reject papers.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="underline text-[11px]">Dismiss</button>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="underline text-[11px]">Dismiss</button>
        </div>
      )}

      {/* Workflow Tracker */}
      <WorkflowTimeline currentStatus={selectedPaper?.status || 'SUBMITTED'} />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Queue List */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-white">
            Submissions Queue ({papers.length})
          </h2>

          <div className="space-y-3">
            {papers.map((p) => {
              const isSelected = selectedPaper?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => selectPaper(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-purple-500/50 ring-1 ring-purple-500/30 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {p.examName || `Examination #${p.examId}`}
                    </h3>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                      p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      p.status === 'SUBMITTED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' :
                      p.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-400">
                    <p>Submitted by: <span className="text-slate-300 font-medium">{p.submittedBy?.fullName || 'Question Setter'}</span></p>
                    {p.submittedAt && (
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {new Date(p.submittedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Inspection & Actions */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPaper && selectedExam ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* Exam Summary & Review Action buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedExam.examName}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span>{selectedExam.subject}</span>
                    <span>&bull;</span>
                    <span>{selectedExam.durationMinutes} mins</span>
                    <span>&bull;</span>
                    <span>{selectedExam.maxMarks} marks</span>
                  </div>
                </div>

                {selectedPaper.status === 'SUBMITTED' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openReviewModal(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <XSquare className="w-4 h-4" />
                      Reject Paper
                    </button>
                    <button
                      onClick={() => openReviewModal(true)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Approve Paper
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                    Review Status: <span className="font-bold text-white">{selectedPaper.status}</span>
                  </div>
                )}
              </div>

              {/* Review Comments History */}
              {selectedPaper.reviewerComments && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-purple-300">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Reviewer Comments:
                  </div>
                  <p>{selectedPaper.reviewerComments}</p>
                </div>
              )}

              {/* Questions Audit List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Questions Inspection ({selectedExam.questions?.length || 0})
                </h3>

                {selectedExam.questions?.map((q) => {
                  let options = [];
                  if (q.optionsJson) {
                    try { options = JSON.parse(q.optionsJson); } catch (e) {}
                  }

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          Q{q.questionNumber}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-slate-100 font-medium leading-relaxed">
                            {q.questionText}
                          </p>

                          {q.questionType === 'MCQ' && options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                              {options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`px-2.5 py-1.5 rounded-lg border text-xs ${
                                    opt === q.correctOption
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <span className="font-mono font-bold mr-1.5">
                                    {String.fromCharCode(65 + oIdx)}.
                                  </span>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
                            <span className="font-mono text-purple-400 font-semibold">{q.marks} Marks</span>
                            <span>&bull;</span>
                            <span className="font-mono uppercase">{q.questionType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl">
              Select a question paper from the queue to inspect.
            </div>
          )}
        </div>

      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {isApproveAction ? 'Approve Question Paper' : 'Reject Question Paper'}
            </h3>
            <p className="text-xs text-slate-400">
              {isApproveAction 
                ? 'Authorizing will allow the Examination Controller to finalize, AES-encrypt, and lock this paper.'
                : 'Rejecting will return the question paper to the Question Setter with your notes.'}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Review Comments / Justification
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl text-white font-semibold ${
                    isApproveAction ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {isApproveAction ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
