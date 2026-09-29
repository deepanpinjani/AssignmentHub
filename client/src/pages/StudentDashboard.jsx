import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
  GraduationCap,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  FileCheck,
  History,
  X,
  BookOpen
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Active submission modal state
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Fetch all assignments with user's submission status
  const fetchStudentAssignments = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const data = await apiService.getAssignments();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (err) {
      setFetchError(err.message || 'Failed to retrieve course assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentAssignments();
  }, []);

  // Open submission form modal
  const handleOpenSubmit = (assignment) => {
    setActiveAssignment(assignment);
    setSubmissionLink(assignment.mySubmission?.submissionLink || '');
    setResponseText(assignment.mySubmission?.response || '');
    setSubmitError('');
    setSubmitSuccess('');
  };

  // Close submission modal
  const handleCloseSubmit = () => {
    setActiveAssignment(null);
    setSubmissionLink('');
    setResponseText('');
    setSubmitError('');
    setSubmitSuccess('');
  };

  // Submit work
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    const trimmedLink = submissionLink.trim();
    const trimmedText = responseText.trim();

    // Section 11 requirement: Reject if submission link is empty AND text response is empty
    if (!trimmedLink && !trimmedText) {
      setSubmitError('Please provide at least a submission link or a text response.');
      return;
    }

    try {
      setSubmitting(true);
      const data = await apiService.createSubmission({
        assignmentId: activeAssignment._id,
        submissionLink: trimmedLink,
        response: trimmedText,
      });

      if (data.success) {
        setSubmitSuccess(data.message || 'Assignment submitted successfully!');
        // Refresh assignments to update submission status
        await fetchStudentAssignments();
        // Wait 1.5s then close modal
        setTimeout(() => {
          handleCloseSubmit();
        }, 1500);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
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
        {/* Welcome Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-fit mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Student Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome, {user?.name || 'Student'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Submit coursework, read professor feedback, and track each version of your work.
            </p>
          </div>
          <button
            onClick={fetchStudentAssignments}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            Refresh Assignments
          </button>
        </div>

        {/* Assignments List */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Available Assignments</h2>
            <span className="text-xs text-gray-500">
              Showing {assignments.length} total assignment{assignments.length === 1 ? '' : 's'}
            </span>
          </div>

          {fetchError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 mb-6">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{fetchError}</span>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center bg-white border border-gray-200 rounded-2xl">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600">Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-16 text-center bg-white border border-gray-200 rounded-2xl shadow-sm">
              <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No active assignments</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Your professors have not published any assignments at this time. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {assignments.map((assignment) => {
                const isDeadlinePassed = new Date(assignment.deadline) < new Date();
                const isSubmitted = assignment.isSubmitted;
                const submission = assignment.mySubmission;
                const reviewStatus = submission?.reviewStatus || 'Pending';
                const canResubmit = reviewStatus === 'Needs Changes';

                return (
                  <div
                    key={assignment._id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-medium text-gray-500">
                          Instructor: {assignment.createdBy?.name || 'Faculty Member'}
                        </span>
                        {isSubmitted ? (
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              submission?.status === 'On Time'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {submission?.status}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              reviewStatus === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : canResubmit
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                            }`}>
                              {reviewStatus === 'Pending' ? 'Pending Review' : reviewStatus}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isDeadlinePassed
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {isDeadlinePassed ? 'Past Deadline' : 'Active'}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">
                        {assignment.description}
                      </p>

                      {/* Deadline Box */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1 mb-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span>Deadline:</span>
                          <span className="font-semibold text-gray-900">{formatDateTime(assignment.deadline)}</span>
                        </div>
                      </div>

                      {/* If Submitted: Show submission details */}
                      {isSubmitted && submission && (
                        <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2 mb-4">
                          <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <span>Latest Submission · Version {1 + (submission.history?.length || 0)}</span>
                          </div>

                          {submission.submissionLink && (
                            <div className="text-[11px]">
                              <span className="font-medium text-gray-600 block">Submitted Link:</span>
                              <a
                                href={submission.submissionLink.startsWith('http') ? submission.submissionLink : `https://${submission.submissionLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline break-all inline-flex items-center gap-1"
                              >
                                {submission.submissionLink}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          )}

                          {submission.response && (
                            <div className="text-[11px]">
                              <span className="font-medium text-gray-600 block">Submitted Text:</span>
                              <p className="p-2 bg-white rounded border border-emerald-100 font-mono text-gray-700 whitespace-pre-wrap">
                                {submission.response}
                              </p>
                            </div>
                          )}

                          <div className="pt-1 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between gap-2">
                            <span>Timestamp: {formatDateTime(submission.submittedAt)}</span>
                            {submission.marks !== null && submission.marks !== undefined && (
                              <span className="font-bold text-gray-800">Marks: {submission.marks}/100</span>
                            )}
                          </div>

                          {submission.feedback && (
                            <div className="p-2.5 bg-white border border-blue-200 rounded-lg">
                              <span className="font-semibold text-gray-700 block mb-1">Professor Feedback</span>
                              <p className="text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
                            </div>
                          )}

                          {(submission.history || []).length > 0 && (
                            <details className="pt-2 border-t border-gray-200">
                              <summary className="cursor-pointer list-none flex items-center gap-1.5 font-semibold text-gray-700">
                                <History className="w-3.5 h-3.5" />
                                Previous versions ({submission.history.length})
                              </summary>
                              <ol className="mt-3 space-y-3">
                                {submission.history.map((version, index) => (
                                  <li key={`${version.submittedAt}-${index}`} className="border-l-2 border-gray-300 pl-3 space-y-1.5">
                                    <div className="flex flex-wrap justify-between gap-2 text-[10px] text-gray-500">
                                      <span className="font-semibold text-gray-700">Version {index + 1} · {version.reviewStatus || 'Pending Review'}</span>
                                      <time dateTime={version.submittedAt}>{formatDateTime(version.submittedAt)}</time>
                                    </div>
                                    {version.marks !== null && version.marks !== undefined && (
                                      <p className="text-gray-700">Marks: {version.marks}/100</p>
                                    )}
                                    {version.feedback && <p className="text-gray-600 whitespace-pre-wrap">Feedback: {version.feedback}</p>}
                                    {version.submissionLink && <p className="break-all text-blue-700">Link: {version.submissionLink}</p>}
                                    {version.response && <p className="whitespace-pre-wrap text-gray-600">{version.response}</p>}
                                  </li>
                                ))}
                              </ol>
                            </details>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-100">
                      {!isSubmitted ? (
                        <button
                          onClick={() => handleOpenSubmit(assignment)}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Work</span>
                        </button>
                      ) : canResubmit ? (
                        <button
                          onClick={() => handleOpenSubmit(assignment)}
                          className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Revised Work</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          {reviewStatus === 'Accepted'
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            : <Clock className="w-4 h-4 text-gray-500" />}
                          <span>{reviewStatus === 'Accepted' ? 'Accepted · Resubmission Closed' : 'Awaiting Professor Review'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {activeAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {activeAssignment.isSubmitted ? 'Submit Revised Work' : 'Submit Assignment'}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{activeAssignment.title}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Deadline: <span className="font-semibold text-gray-700">{formatDateTime(activeAssignment.deadline)}</span>
                </p>
              </div>
              <button
                onClick={handleCloseSubmit}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitWork} className="p-6 space-y-4">
              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <p className="text-xs text-gray-500 leading-relaxed">
                Provide either a project URL (e.g. GitHub repo, hosted demo) <strong>OR</strong> a text response. At least one field is required.
              </p>

              {/* Submission Link */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Submission Link (Optional if text is provided)
                </label>
                <input
                  type="text"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Text Response */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Text Response (Optional if link is provided)
                </label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your assignment answer, writeup, or solution notes here..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-800">
                <strong>{activeAssignment.isSubmitted ? 'Revision:' : 'Review:'}</strong>{' '}
                {activeAssignment.isSubmitted
                  ? 'Your previous version will remain in submission history when you submit this revision.'
                  : 'You can submit another version only if your professor requests changes.'}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseSubmit}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Work...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{activeAssignment.isSubmitted ? 'Submit Revision' : 'Submit Work'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
