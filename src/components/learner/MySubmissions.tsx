import React, { useState } from 'react';
import { User, Task, TaskSubmission, Course } from '../../types';
import { storage } from '../../services/storage';
import { FileCheck2, ExternalLink, History, Clock, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface MySubmissionsProps {
  currentUser: User;
  courses: Course[];
  tasks: Task[];
  submissions: TaskSubmission[];
  onRefreshData: () => void;
  onOpenCourse: (courseId: string) => void;
}

export const MySubmissions: React.FC<MySubmissionsProps> = ({
  currentUser,
  courses,
  tasks,
  submissions,
  onRefreshData,
  onOpenCourse,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filter tasks belonging to enrolled courses
  const enrolledCourseIds = currentUser.enrolledCourseIds;
  const learnerTasks = tasks.filter(t => enrolledCourseIds.includes(t.courseId));

  // Quick submission modal state
  const [resubmittingTask, setResubmittingTask] = useState<Task | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenResubmit = (task: Task) => {
    setResubmittingTask(task);
    setGithubUrl('');
    setLiveDemoUrl('');
    setDocUrl('');
    setNotes('');
  };

  const handleSaveResubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmittingTask) return;

    if (!githubUrl && !liveDemoUrl && !docUrl) {
      alert('Please enter at least one link (GitHub, Live Demo, or Documentation).');
      return;
    }

    setSubmitting(true);
    const existing = submissions.find(s => s.taskId === resubmittingTask.id && s.learnerId === currentUser.id);
    const attemptNumber = (existing?.attempts.length || 0) + 1;

    const newAttempt = {
      id: 'att_' + Date.now(),
      attemptNumber,
      submittedAt: new Date().toISOString(),
      githubUrl: githubUrl.trim() || undefined,
      liveDemoUrl: liveDemoUrl.trim() || undefined,
      documentationUrl: docUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'pending' as const,
    };

    const updatedSub: TaskSubmission = {
      id: existing?.id || 'sub_' + Date.now(),
      taskId: resubmittingTask.id,
      courseId: resubmittingTask.courseId,
      learnerId: currentUser.id,
      learnerName: currentUser.name,
      learnerEmail: currentUser.email,
      currentStatus: 'pending',
      attempts: existing ? [...existing.attempts, newAttempt] : [newAttempt],
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveSubmission(updatedSub);
    setSubmitting(false);
    setResubmittingTask(null);
    onRefreshData();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Submissions & Deliverables</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review submission statuses, instructor feedback, awarded marks, and resubmit when revisions are requested.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {learnerTasks.map(task => {
          const course = courses.find(c => c.id === task.courseId);
          const submission = submissions.find(s => s.taskId === task.id && s.learnerId === currentUser.id);
          const hasDeadline = !!task.deadline;
          const deadlinePassed = hasDeadline && new Date(task.deadline!).getTime() < Date.now();
          const canSubmit = !deadlinePassed || task.allowLateSubmission;

          return (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:border-gray-300 transition"
            >
              {/* Task Header Bar */}
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500">{course?.title || 'Course'}</span>
                    <span>•</span>
                    <span className="text-xs font-mono text-gray-500">Max Score: {task.maxMarks} pts</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  {submission ? (
                    <Badge
                      variant={
                        submission.currentStatus === 'approved'
                          ? 'green'
                          : submission.currentStatus === 'revision_requested'
                          ? 'amber'
                          : 'blue'
                      }
                    >
                      {submission.currentStatus === 'approved'
                        ? 'Approved ✓'
                        : submission.currentStatus === 'revision_requested'
                        ? 'Revision Requested'
                        : 'Under Review'}
                    </Badge>
                  ) : (
                    <Badge variant="gray">Not Submitted</Badge>
                  )}

                  {submission?.latestMarks !== undefined && (
                    <span className="text-sm font-bold text-[#009166] bg-[#e6f5f0] px-2.5 py-1 rounded">
                      {submission.latestMarks} / {task.maxMarks} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Task Content */}
              <div className="p-5 space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>

                {hasDeadline && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Deadline: {new Date(task.deadline!).toLocaleDateString()}</span>
                    {deadlinePassed && (
                      <span className="text-rose-600 font-semibold">(Deadline passed)</span>
                    )}
                  </div>
                )}

                {/* Latest Feedback Box */}
                {submission?.latestFeedback && (
                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs">
                    <div className="font-bold text-amber-900 mb-1">Latest Instructor Feedback:</div>
                    <p className="text-amber-800 leading-relaxed">{submission.latestFeedback}</p>
                  </div>
                )}

                {/* Attempts Summary */}
                {submission && submission.attempts.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-gray-400" />
                      <span>Submission Attempts ({submission.attempts.length})</span>
                    </div>

                    <div className="space-y-2">
                      {submission.attempts.map(att => (
                        <div key={att.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-gray-800">
                              Attempt #{att.attemptNumber} • {new Date(att.submittedAt).toLocaleString()}
                            </div>
                            <div className="flex gap-3 mt-1">
                              {att.githubUrl && (
                                <a href={att.githubUrl} target="_blank" rel="noreferrer" className="text-[#009166] underline">
                                  GitHub
                                </a>
                              )}
                              {att.liveDemoUrl && (
                                <a href={att.liveDemoUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                  Live Demo
                                </a>
                              )}
                              {att.documentationUrl && (
                                <a href={att.documentationUrl} target="_blank" rel="noreferrer" className="text-purple-600 underline">
                                  Docs
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-gray-500 font-medium capitalize">{att.status.replace('_', ' ')}</span>
                            {att.marksAwarded !== undefined && (
                              <span className="font-bold text-gray-900 ml-2">Score: {att.marksAwarded}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3 bg-[#FAF9F6] border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenCourse(task.courseId)}
                  className="text-xs font-semibold text-gray-600 hover:text-[#009166] cursor-pointer"
                >
                  View in Course Player →
                </button>

                {canSubmit && (!submission || submission.currentStatus === 'revision_requested') && (
                  <button
                    onClick={() => handleOpenResubmit(task)}
                    className="px-4 py-1.5 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submission ? 'Submit Revision' : 'Submit Project'}</span>
                  </button>
                )}

                {!canSubmit && (
                  <span className="text-xs text-rose-600 font-medium">Submissions closed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resubmit Modal */}
      {resubmittingTask && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">
                Submit Deliverables: {resubmittingTask.title}
              </h3>
              <button
                onClick={() => setResubmittingTask(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  GitHub Repository URL *
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  placeholder="https://project.pages.dev"
                  value={liveDemoUrl}
                  onChange={e => setLiveDemoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Documentation URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={docUrl}
                  onChange={e => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Revision Notes / Additions
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize fixes applied..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setResubmittingTask(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
