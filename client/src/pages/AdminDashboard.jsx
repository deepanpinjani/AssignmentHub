import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
  PlusCircle,
  Calendar,
  Clock,
  Users,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Assignment List State
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [assignmentFetchError, setAssignmentFetchError] = useState('');

  // Create Assignment Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Submissions Modal State
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewResults, setReviewResults] = useState({});
  const [savingReviewId, setSavingReviewId] = useState('');

  // Fetch created assignments
  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      setAssignmentFetchError('');
      const data = await apiService.getAssignments();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (err) {
      setAssignmentFetchError(err.message || 'Failed to load assignments.');
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Handle Create Assignment Submission
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    // Validation
    if (!title.trim()) {
      setCreateError('Assignment title cannot be empty.');
      return;
    }
    if (!description.trim()) {
      setCreateError('Assignment description cannot be empty.');
      return;
    }
    if (!deadline) {
      setCreateError('Submission deadline date and time is required.');
      return;
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      setCreateError('Please specify a valid deadline date and time.');
      return;
    }

    try {
      setCreating(true);
      const data = await apiService.createAssignment({
        title: title.trim(),
        description: description.trim(),
        deadline: parsedDeadline.toISOString(),
      });

      if (data.success) {
        setCreateSuccess('Assignment published successfully!');
        setTitle('');
        setDescription('');
        setDeadline('');
        fetchAssignments();
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create assignment.');
    } finally {
      setCreating(false);
    }
  };

  // Open Submissions Modal
  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissions([]);
    setSubmissionError('');
    setLoadingSubmissions(true);

    try {
      const data = await apiService.getSubmissionsForAssignment(assignment._id);
      if (data.success) {
        setSubmissions(data.submissions || []);
        setReviewDrafts(Object.fromEntries((data.submissions || []).map((submission) => [
          submission._id,
          {
            reviewStatus: submission.reviewStatus === 'Pending' ? '' : submission.reviewStatus || '',
            feedback: submission.feedback || '',
            marks: submission.marks ?? '',
          },
        ])));
        setReviewResults({});
      }
    } catch (err) {
      setSubmissionError(err.message || 'Failed to load student submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSaveReview = async (submission) => {
    const draft = reviewDrafts[submission._id];
    setReviewResults((current) => ({ ...current, [submission._id]: '' }));
    setSavingReviewId(submission._id);

    try {
      const data = await apiService.reviewSubmission(submission._id, draft);
      setSubmissions((current) => current.map((item) => item._id === submission._id
        ? { ...item, ...data.submission, studentId: item.studentId }
        : item));
      setReviewResults((current) => ({ ...current, [submission._id]: 'Review saved.' }));
    } catch (err) {
      setReviewResults((current) => ({ ...current, [submission._id]: err.message || 'Failed to save review.' }));
    } finally {
      setSavingReviewId('');
    }
  };

  // Close Modal
  const closeModal = () => {
    setSelectedAssignment(null);
    setSubmissions([]);
    setSubmissionError('');
    setReviewDrafts({});
    setReviewResults({});
  };

  // Format Date Helper
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md w-fit mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Faculty Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome, {user?.name || 'Professor'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage coursework, view submissions, and track student completion status.
            </p>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-xs text-gray-400 block">Total Created</span>
            <span className="text-2xl font-bold text-gray-800">{assignments.length} Assignments</span>
          </div>
        </div>

        {/* Main Grid: Create Assignment & Assignment List */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Create Assignment (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Create Assignment</h2>
            </div>

            {createSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{createSuccess}</span>
              </div>
            )}

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Lab 3: Process Scheduling"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the assignment objectives, requirements, and deliverables..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Submission Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Submissions after this exact time will be marked as Late.
                </p>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer pt-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Assignment...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Assignment</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Your Assignments (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Your Assignments</h2>
              <button
                onClick={fetchAssignments}
                disabled={loadingAssignments}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Refresh List
              </button>
            </div>

            {assignmentFetchError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{assignmentFetchError}</span>
              </div>
            )}

            {loadingAssignments ? (
              <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600">Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-sm">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-800">No assignments created yet</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Use the form on the left to publish your first assignment for students.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const isDeadlinePassed = new Date(assignment.deadline) < new Date();

                  return (
                    <div
                      key={assignment._id}
                      className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-gray-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 leading-snug">
                            {assignment.title}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                            {assignment.description}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap self-start ${
                            isDeadlinePassed
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isDeadlinePassed ? 'Deadline Passed' : 'Active'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Deadline: <strong className="text-gray-700">{formatDateTime(assignment.deadline)}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            Submissions: <strong className="text-blue-600 font-bold">{assignment.submissionCount || 0}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleViewSubmissions(assignment)}
                          className="px-3.5 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-300 hover:border-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>View Submissions ({assignment.submissionCount || 0})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submissions Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Assignment Submissions
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedAssignment.title}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Deadline: <span className="font-semibold text-gray-700">{formatDateTime(selectedAssignment.deadline)}</span>
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingSubmissions ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Retrieving student submissions...</p>
                </div>
              ) : submissionError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {submissionError}
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">No submissions recorded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Students enrolled in this course haven't submitted their work.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
                    <span>Total Submissions: <strong className="text-gray-800">{submissions.length}</strong></span>
                    <span className="text-[11px] text-gray-400">Review each latest version below</span>
                  </div>

                  {submissions.map((sub, idx) => (
                    <div
                      key={sub._id || idx}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-2.5"
                    >
                      {/* Student info and Status badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{sub.studentId?.name || 'Student'}</p>
                          <p className="text-gray-500">{sub.studentId?.email || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                              sub.status === 'On Time'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            Status: {sub.status}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                            sub.reviewStatus === 'Accepted'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : sub.reviewStatus === 'Needs Changes'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}>
                            {sub.reviewStatus || 'Pending Review'}
                          </span>
                        </div>
                      </div>

                      {/* Submitted link */}
                      {sub.submissionLink && (
                        <div>
                          <span className="font-semibold text-gray-700 block mb-0.5">Submission Link:</span>
                          <a
                            href={sub.submissionLink.startsWith('http') ? sub.submissionLink : `https://${sub.submissionLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all inline-flex items-center gap-1 font-medium"
                          >
                            {sub.submissionLink}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      )}

                      {/* Text response */}
                      {sub.response && (
                        <div>
                          <span className="font-semibold text-gray-700 block mb-0.5">Response:</span>
                          <p className="p-3 bg-white border border-gray-200 rounded-lg text-gray-800 whitespace-pre-wrap leading-relaxed font-mono text-[11px]">
                            {sub.response}
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="pt-2 border-t border-gray-200 text-gray-500 text-[11px] flex items-center justify-between">
                        <span>Submitted: <strong>{formatDateTime(sub.submittedAt)}</strong></span>
                        <span>Version {1 + (sub.history?.length || 0)}</span>
                      </div>

                      <div className="pt-3 border-t border-gray-200 space-y-3">
                        <h4 className="font-semibold text-gray-800">Professor Review</h4>
                        <label className="block">
                          <span className="font-medium text-gray-700">Feedback</span>
                          <textarea
                            rows={3}
                            value={reviewDrafts[sub._id]?.feedback ?? ''}
                            onChange={(event) => setReviewDrafts((current) => ({
                              ...current,
                              [sub._id]: { ...current[sub._id], feedback: event.target.value },
                            }))}
                            placeholder="Give the student clear, actionable feedback"
                            className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                        <div className="grid sm:grid-cols-[1fr_8rem] gap-3">
                          <label className="block">
                            <span className="font-medium text-gray-700">Decision</span>
                            <select
                              value={reviewDrafts[sub._id]?.reviewStatus || ''}
                              required
                              onChange={(event) => setReviewDrafts((current) => ({
                                ...current,
                                [sub._id]: { ...current[sub._id], reviewStatus: event.target.value },
                              }))}
                              className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900"
                            >
                              <option value="" disabled>Choose decision</option>
                              <option value="Needs Changes">Needs Changes</option>
                              <option value="Accepted">Accepted</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="font-medium text-gray-700">Marks / 100</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={reviewDrafts[sub._id]?.marks ?? ''}
                              onChange={(event) => setReviewDrafts((current) => ({
                                ...current,
                                [sub._id]: { ...current[sub._id], marks: event.target.value },
                              }))}
                              className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900"
                            />
                          </label>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-[11px] ${reviewResults[sub._id] && reviewResults[sub._id] !== 'Review saved.' ? 'text-red-700' : 'text-emerald-700'}`}>
                            {reviewResults[sub._id] || ''}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSaveReview(sub)}
                            disabled={savingReviewId === sub._id}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5"
                          >
                            {savingReviewId === sub._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Save Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
