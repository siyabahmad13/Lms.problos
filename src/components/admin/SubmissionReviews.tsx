import React, { useState } from 'react';
import { TaskSubmission, Task, Course, User } from '../../types';
import { storage } from '../../services/storage';
import {
  FileCheck2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  History,
  Unlock,
  MessageSquare,
  Award,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface SubmissionReviewsProps {
  currentAdmin: User;
  submissions: TaskSubmission[];
  tasks: Task[];
  courses: Course[];
  users: User[];
  onRefreshData: () => void;
}

export const SubmissionReviews: React.FC<SubmissionReviewsProps> = ({
  currentAdmin,
  submissions,
  tasks,
  courses,
  users,
  onRefreshData,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [selectedSub, setSelectedSub] = useState<TaskSubmission | null>(null);

  // Review Form state
  const [reviewAction, setReviewAction] = useState<'approved' | 'revision_requested'>('approved');
  const [marks, setMarks] = useState<number>(95);
  const [feedback, setFeedback] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const filteredSubmissions = submissions.filter(s => {
    if (filterStatus === 'all') return true;
    return s.currentStatus === filterStatus;
  });

  const handleOpenReview = (sub: TaskSubmission) => {
    setSelectedSub(sub);
    const task = tasks.find(t => t.id === sub.taskId);
    setMarks(sub.latestMarks || task?.maxMarks || 90);
    setFeedback(sub.latestFeedback || '');
    setReviewAction(sub.currentStatus === 'revision_requested' ? 'revision_requested' : 'approved');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setSaving(true);

    const task = tasks.find(t => t.id === selectedSub.taskId);

    // Update the latest attempt
    const updatedAttempts = [...selectedSub.attempts];
    const latestIndex = updatedAttempts.length - 1;
    if (latestIndex >= 0) {
      updatedAttempts[latestIndex] = {
        ...updatedAttempts[latestIndex],
        status: reviewAction,
        marksAwarded: marks,
        feedback: feedback.trim(),
        reviewedBy: currentAdmin.name,
        reviewedAt: new Date().toISOString(),
      };
    }

    const updatedSub: TaskSubmission = {
      ...selectedSub,
      currentStatus: reviewAction,
      latestMarks: marks,
      latestFeedback: feedback.trim(),
      attempts: updatedAttempts,
      updatedAt: new Date().toISOString(),
    };

    storage.saveSubmission(updatedSub);

    // Audit log
    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: reviewAction === 'approved' ? 'Approved Submission' : 'Requested Revision',
      details: `${reviewAction === 'approved' ? 'Approved' : 'Requested revisions for'} ${selectedSub.learnerName}'s submission on "${task?.title || 'Task'}". Marks awarded: ${marks}.`,
      targetType: 'submission',
      targetId: selectedSub.id,
    });

    setSaving(false);
    setSelectedSub(null);
    setSuccessNotice(`Review saved. Status set to ${reviewAction === 'approved' ? 'Approved (Next week unlocked)' : 'Revision Requested (Next week remains locked)'}.`);
    setTimeout(() => setSuccessNotice(null), 4000);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Submission Review Desk</h1>
          <p className="text-sm text-gray-600 mt-1">
            Evaluate code repositories, live demo deployments, award rubric marks, and control module gating unlock.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-lg p-1 bg-white border border-gray-200 text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
              filterStatus === 'pending'
                ? 'bg-[#009166] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Review ({submissions.filter(s => s.currentStatus === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('revision_requested')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
              filterStatus === 'revision_requested'
                ? 'bg-amber-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Revision Req. ({submissions.filter(s => s.currentStatus === 'revision_requested').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
              filterStatus === 'approved'
                ? 'bg-[#009166] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approved ({submissions.filter(s => s.currentStatus === 'approved').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
              filterStatus === 'all'
                ? 'bg-gray-800 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({submissions.length})
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-3.5 bg-emerald-50 border border-[#009166]/30 text-[#009166] text-xs font-bold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Submissions List */}
      <div className="grid grid-cols-1 gap-5">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
            No submissions in this queue.
          </div>
        ) : (
          filteredSubmissions.map(sub => {
            const task = tasks.find(t => t.id === sub.taskId);
            const course = courses.find(c => c.id === sub.courseId);
            const latestAttempt = sub.attempts[sub.attempts.length - 1];

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:border-gray-300 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-base">{sub.learnerName}</span>
                      <span className="text-xs text-gray-400">({sub.learnerEmail})</span>
                      <Badge
                        variant={
                          sub.currentStatus === 'approved'
                            ? 'green'
                            : sub.currentStatus === 'revision_requested'
                            ? 'amber'
                            : 'blue'
                        }
                      >
                        {sub.currentStatus === 'approved'
                          ? 'Approved ✓'
                          : sub.currentStatus === 'revision_requested'
                          ? 'Revision Req.'
                          : 'Pending Review'}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-600">
                      Deliverable for <strong className="text-gray-900">{task?.title || 'Assignment'}</strong> in {course?.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {sub.latestMarks !== undefined && (
                      <span className="text-sm font-bold text-[#009166] bg-[#e6f5f0] px-2.5 py-1 rounded">
                        Score: {sub.latestMarks} / {task?.maxMarks || 100}
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenReview(sub)}
                      className="px-4 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      Evaluate & Grade
                    </button>
                  </div>
                </div>

                {/* Latest Submission Links & Notes */}
                {latestAttempt && (
                  <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700">Attempt #{latestAttempt.attemptNumber}</span>
                      <span className="text-gray-400">{new Date(latestAttempt.submittedAt).toLocaleString()}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                      {latestAttempt.githubUrl && (
                        <a
                          href={latestAttempt.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[#009166] hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Inspect GitHub Repo</span>
                        </a>
                      )}
                      {latestAttempt.liveDemoUrl && (
                        <a
                          href={latestAttempt.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Test Live Deployment</span>
                        </a>
                      )}
                      {latestAttempt.documentationUrl && (
                        <a
                          href={latestAttempt.documentationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-purple-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Documentation</span>
                        </a>
                      )}
                    </div>

                    {latestAttempt.notes && (
                      <p className="text-gray-600 pt-1 italic">
                        &quot;{latestAttempt.notes}&quot;
                      </p>
                    )}
                  </div>
                )}

                {/* History list toggle if multiple attempts */}
                {sub.attempts.length > 1 && (
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                    <History className="w-3.5 h-3.5" />
                    <span>This intern has {sub.attempts.length} historical submission attempts.</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Review Evaluation Desk */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Evaluate Deliverable</h3>
                <p className="text-xs text-gray-500">
                  {selectedSub.learnerName} • {selectedSub.learnerEmail}
                </p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Review Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      reviewAction === 'approved'
                        ? 'border-[#009166] bg-emerald-50 text-[#009166] font-bold'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewAction"
                      value="approved"
                      checked={reviewAction === 'approved'}
                      onChange={() => setReviewAction('approved')}
                      className="text-[#009166]"
                    />
                    <div>
                      <div className="text-xs">Approve Deliverable</div>
                      <div className="text-[10px] font-normal text-gray-500">Unlocks following week module</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      reviewAction === 'revision_requested'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewAction"
                      value="revision_requested"
                      checked={reviewAction === 'revision_requested'}
                      onChange={() => setReviewAction('revision_requested')}
                      className="text-amber-600"
                    />
                    <div>
                      <div className="text-xs">Request Revision</div>
                      <div className="text-[10px] font-normal text-amber-700">Subsequent week remains locked</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Marks Awarded (out of 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={marks}
                  onChange={e => setMarks(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Constructive Instructor Feedback *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Highlight technical strengths, edge cases, or code improvements..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save & Publish Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
