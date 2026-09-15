import React, { useState, useEffect } from 'react';
import { examService, paperService } from '../services/api';
import WorkflowTimeline from '../components/WorkflowTimeline';
import SecurityAlertBanner from '../components/SecurityAlertBanner';
import { 
  Plus, 
  FileText, 
  Send, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle, 
  HelpCircle, 
  AlertCircle,
  Calendar,
  Clock,
  Award,
  Layers,
  Edit3
} from 'lucide-react';

export default function QuestionSetterDashboard() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Exam creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExam, setNewExam] = useState({
    examName: '',
    subject: 'Computer Networks',
    course: 'B.Tech CSE',
    examDate: '2026-09-20',
    startTime: '10:00:00',
    durationMinutes: 180,
    maxMarks: 100,
  });

  // Question form state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [qForm, setQForm] = useState({
    questionNumber: 1,
    questionText: '',
    marks: 10,
    questionType: 'DESCRIPTIVE',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: '',
  });

  const loadExams = async () => {
    try {
      const res = await examService.getAllExams();
      setExams(res.data);
      if (res.data.length > 0 && !selectedExam) {
        selectExam(res.data[0]);
      } else if (selectedExam) {
        const updated = res.data.find(e => e.id === selectedExam.id);
        if (updated) selectExam(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const selectExam = async (exam) => {
    setSelectedExam(exam);
    try {
      const res = await paperService.getPaperByExamId(exam.id);
      setPaper(res.data);
    } catch (err) {
      setPaper(null);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await examService.createExam(newExam);
      setShowCreateModal(false);
      setStatusMessage('Examination created successfully!');
      await loadExams();
      selectExam(res.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let optionsJson = null;
      if (qForm.questionType === 'MCQ') {
        optionsJson = JSON.stringify([qForm.optionA, qForm.optionB, qForm.optionC, qForm.optionD]);
      }

      const payload = {
        questionNumber: qForm.questionNumber,
        questionText: qForm.questionText,
        marks: parseInt(qForm.marks),
        questionType: qForm.questionType,
        optionsJson: optionsJson,
        correctOption: qForm.correctOption,
      };

      if (editingQuestionId) {
        await examService.updateQuestion(editingQuestionId, payload);
        setStatusMessage('Question updated successfully!');
      } else {
        await examService.addQuestion(selectedExam.id, payload);
        setStatusMessage('Question added successfully!');
      }

      setShowQuestionModal(false);
      setEditingQuestionId(null);
      resetQuestionForm();
      await loadExams();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await examService.deleteQuestion(qId);
      setStatusMessage('Question deleted');
      await loadExams();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleReorder = async (direction, index) => {
    const questions = [...selectedExam.questions];
    if (direction === 'up' && index > 0) {
      const temp = questions[index];
      questions[index] = questions[index - 1];
      questions[index - 1] = temp;
    } else if (direction === 'down' && index < questions.length - 1) {
      const temp = questions[index];
      questions[index] = questions[index + 1];
      questions[index + 1] = temp;
    } else {
      return;
    }

    const orderedIds = questions.map(q => q.id);
    try {
      await examService.reorderQuestions(selectedExam.id, orderedIds);
      await loadExams();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to reorder');
    }
  };

  const handleSubmitForReview = async () => {
    if (!paper) return;
    try {
      setLoading(true);
      await paperService.submitPaper(paper.id);
      setStatusMessage('Question paper submitted for Reviewer approval!');
      await loadExams();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit paper');
    } finally {
      setLoading(false);
    }
  };

  const openAddQuestion = () => {
    resetQuestionForm();
    setQForm(prev => ({ ...prev, questionNumber: (selectedExam?.questions?.length || 0) + 1 }));
    setEditingQuestionId(null);
    setShowQuestionModal(true);
  };

  const openEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    let optA = '', optB = '', optC = '', optD = '';
    if (q.optionsJson) {
      try {
        const arr = JSON.parse(q.optionsJson);
        optA = arr[0] || '';
        optB = arr[1] || '';
        optC = arr[2] || '';
        optD = arr[3] || '';
      } catch (e) {}
    }

    setQForm({
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      marks: q.marks,
      questionType: q.questionType,
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctOption: q.correctOption || '',
    });
    setShowQuestionModal(true);
  };

  const resetQuestionForm = () => {
    setQForm({
      questionNumber: 1,
      questionText: '',
      marks: 10,
      questionType: 'DESCRIPTIVE',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: '',
    });
  };

  const isEditingLocked = paper && (paper.status === 'LOCKED' || paper.status === 'RELEASED' || paper.status === 'SUBMITTED');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SecurityAlertBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Role: QUESTION_SETTER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Question Setter Management Hub
          </h1>
          <p className="text-sm text-slate-400">
            Author examination question papers, configure questions, and submit for peer review.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/30 flex items-center gap-2 self-start transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Examination
        </button>
      </div>

      {/* Notifications */}
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
      <WorkflowTimeline currentStatus={paper?.status || 'DRAFT'} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Examinations List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Examinations ({exams.length})
            </h2>
          </div>

          <div className="space-y-3">
            {exams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => selectExam(exam)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedExam?.id === exam.id
                    ? 'bg-slate-800/90 border-sky-500/50 ring-1 ring-sky-500/30 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {exam.examName}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">{exam.subject} &bull; {exam.course}</p>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-400" />
                    {exam.examDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    {exam.durationMinutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-sky-400" />
                    {exam.maxMarks} marks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Selected Exam Questions Editor */}
        <div className="lg:col-span-8 space-y-6">
          {selectedExam ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* Exam Details & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedExam.examName}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedExam.subject} &bull; Total Marks: {selectedExam.maxMarks} &bull; Questions: {selectedExam.questions?.length || 0}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditingLocked ? (
                    <>
                      <button
                        onClick={openAddQuestion}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Question
                      </button>
                      <button
                        onClick={handleSubmitForReview}
                        disabled={loading || !selectedExam.questions?.length}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors disabled:opacity-40"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Submit for Review
                      </button>
                    </>
                  ) : (
                    <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5">
                      <span>Editing Disabled (Status: {paper?.status})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {selectedExam.questions && selectedExam.questions.length > 0 ? (
                  selectedExam.questions.map((q, idx) => {
                    let options = [];
                    if (q.optionsJson) {
                      try { options = JSON.parse(q.optionsJson); } catch (e) {}
                    }

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                              Q{q.questionNumber}
                            </span>
                            <div>
                              <p className="text-sm text-slate-100 font-medium leading-relaxed">
                                {q.questionText}
                              </p>

                              {/* MCQ Options Display */}
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
                                <span className="font-mono text-sky-400 font-semibold">{q.marks} Marks</span>
                                <span>&bull;</span>
                                <span className="font-mono uppercase">{q.questionType}</span>
                              </div>
                            </div>
                          </div>

                          {/* Reorder and Action buttons */}
                          {!isEditingLocked && (
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={() => handleReorder('up', idx)}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleReorder('down', idx)}
                                disabled={idx === selectedExam.questions.length - 1}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditQuestion(q)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-400"
                                title="Edit Question"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                    <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No questions added yet to this examination.</p>
                    <button
                      onClick={openAddQuestion}
                      className="mt-3 text-xs font-semibold text-sky-400 hover:text-sky-300"
                    >
                      + Add the first question
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl">
              Select or create an examination to author questions.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Create Examination */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Examination</h3>
            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Examination Name</label>
                <input
                  type="text"
                  required
                  value={newExam.examName}
                  onChange={(e) => setNewExam({ ...newExam, examName: e.target.value })}
                  placeholder="e.g. CS803: Operating Systems Final"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={newExam.subject}
                    onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Course / Branch</label>
                  <input
                    type="text"
                    required
                    value={newExam.course}
                    onChange={(e) => setNewExam({ ...newExam, course: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={newExam.examDate}
                    onChange={(e) => setNewExam({ ...newExam, examDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newExam.startTime}
                    onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={newExam.durationMinutes}
                    onChange={(e) => setNewExam({ ...newExam, durationMinutes: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    required
                    value={newExam.maxMarks}
                    onChange={(e) => setNewExam({ ...newExam, maxMarks: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Question */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingQuestionId ? 'Edit Question' : 'Add Question'}
            </h3>
            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Question Type</label>
                  <select
                    value={qForm.questionType}
                    onChange={(e) => setQForm({ ...qForm, questionType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="DESCRIPTIVE">Descriptive Question</option>
                    <option value="MCQ">Multiple Choice Question (MCQ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Marks</label>
                  <input
                    type="number"
                    required
                    value={qForm.marks}
                    onChange={(e) => setQForm({ ...qForm, marks: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Question Text</label>
                <textarea
                  rows={3}
                  required
                  value={qForm.questionText}
                  onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                  placeholder="e.g. What is the purpose of TCP congestion control?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {qForm.questionType === 'MCQ' && (
                <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block font-semibold text-slate-300">MCQ Options</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Option A"
                      required
                      value={qForm.optionA}
                      onChange={(e) => setQForm({ ...qForm, optionA: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Option B"
                      required
                      value={qForm.optionB}
                      onChange={(e) => setQForm({ ...qForm, optionB: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Option C"
                      required
                      value={qForm.optionC}
                      onChange={(e) => setQForm({ ...qForm, optionC: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Option D"
                      required
                      value={qForm.optionD}
                      onChange={(e) => setQForm({ ...qForm, optionD: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mt-2 mb-1">Correct Option Text</label>
                    <input
                      type="text"
                      placeholder="Exact text of correct option"
                      required
                      value={qForm.correctOption}
                      onChange={(e) => setQForm({ ...qForm, correctOption: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
