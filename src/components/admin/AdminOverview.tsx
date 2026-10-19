import React from 'react';
import {
  User,
  Course,
  LearningTrack,
  Task,
  TaskSubmission,
  Certificate,
  ActivityLog,
} from '../../types';
import {
  Users,
  CheckCircle2,
  FileCheck2,
  Award,
  Layers,
  ArrowRight,
  Clock,
  AlertTriangle,
  History,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface AdminOverviewProps {
  currentUser: User;
  users: User[];
  tracks: LearningTrack[];
  courses: Course[];
  tasks: Task[];
  submissions: TaskSubmission[];
  certificates: Certificate[];
  activityLogs: ActivityLog[];
  onNavigateTab: (tab: string) => void;
  onSelectReviewSubmission?: (subId: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  currentUser,
  users,
  tracks,
  courses,
  tasks,
  submissions,
  certificates,
  activityLogs,
  onNavigateTab,
  onSelectReviewSubmission,
}) => {
  const interns = users.filter(u => u.role === 'learner');
  const activeInterns = interns.filter(u => u.accountActive);

  // Submissions breakdown
  const pendingReviews = submissions.filter(s => s.currentStatus === 'pending');
  const revisionRequests = submissions.filter(s => s.currentStatus === 'revision_requested');
  const approvedSubmissions = submissions.filter(s => s.currentStatus === 'approved');

  // Courses breakdown
  const publishedCourses = courses.filter(c => c.isPublished && !c.isArchived);
  const draftCourses = courses.filter(c => !c.isPublished && !c.isArchived);
  const archivedCourses = courses.filter(c => c.isArchived);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Admin Console • {currentUser.email}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Administrative Control Center
          </h1>
          <p className="text-gray-600 mt-1 max-w-2xl">
            Manage cohort interns, curriculum paths, review deliverables, configure progression gates, and issue authentic credentials.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTab('reviews')}
            className="px-4 py-2.5 bg-[#009166] hover:bg-[#007a56] text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Review Queue ({pendingReviews.length})</span>
          </button>
          <button
            onClick={() => onNavigateTab('interns')}
            className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Manage Interns</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigateTab('interns')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-[#009166] transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Interns</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#009166] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{interns.length}</div>
          <div className="text-xs text-[#009166] font-medium mt-1">
            {activeInterns.length} active • {interns.length - activeInterns.length} inactive
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('reviews')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-amber-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Reviews</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{pendingReviews.length}</div>
          <div className="text-xs text-amber-700 font-medium mt-1">
            {revisionRequests.length} currently in revision
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('tracks-courses')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-blue-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracks & Courses</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{courses.length}</div>
          <div className="text-xs text-blue-700 font-medium mt-1">
            {publishedCourses.length} published across {tracks.length} tracks
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('certificates')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-purple-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Issued Credentials</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{certificates.length}</div>
          <div className="text-xs text-purple-700 font-medium mt-1">
            {certificates.filter(c => !c.isRevoked).length} valid • {certificates.filter(c => c.isRevoked).length} revoked
          </div>
        </div>
      </div>

      {/* Split: Review Queue & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Immediate Review Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#009166]" />
              <span>Deliverables Awaiting Review ({pendingReviews.length})</span>
            </h2>
            <button
              onClick={() => onNavigateTab('reviews')}
              className="text-xs font-bold text-[#009166] hover:underline cursor-pointer"
            >
              Open Full Review Desk →
            </button>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
              <CheckCircle2 className="w-8 h-8 text-[#009166] mx-auto mb-2 opacity-80" />
              All task submissions are up to date!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.slice(0, 5).map(sub => {
                const task = tasks.find(t => t.id === sub.taskId);
                const latestAttempt = sub.attempts[sub.attempts.length - 1];

                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-300 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-sm">{sub.learnerName}</span>
                        <span className="text-xs text-gray-400">• {sub.learnerEmail}</span>
                        <Badge variant="blue" size="sm">Attempt #{latestAttempt?.attemptNumber || 1}</Badge>
                      </div>

                      <div className="text-xs font-medium text-gray-700">
                        Task: <strong className="text-gray-900">{task?.title || 'Assignment'}</strong>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs mt-2">
                        {latestAttempt?.githubUrl && (
                          <a
                            href={latestAttempt.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#009166] font-semibold flex items-center gap-1 hover:underline"
                          >
                            GitHub ↗
                          </a>
                        )}
                        {latestAttempt?.liveDemoUrl && (
                          <a
                            href={latestAttempt.liveDemoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 font-semibold flex items-center gap-1 hover:underline"
                          >
                            Live Demo ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('reviews')}
                      className="px-4 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold transition cursor-pointer flex-shrink-0"
                    >
                      Review & Grade
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Audit Activity Log Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              <span>Recent Activity Feed</span>
            </h2>
            <button
              onClick={() => onNavigateTab('activity-logs')}
              className="text-xs font-bold text-[#009166] hover:underline cursor-pointer"
            >
              Full Log →
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            {activityLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No activity logged yet.</div>
            ) : (
              <div className="space-y-3.5">
                {activityLogs.slice(0, 6).map(log => (
                  <div key={log.id} className="text-xs space-y-1 pb-3 border-b border-gray-100 last:border-none last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{log.action}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] leading-relaxed">{log.details}</p>
                    <div className="text-[10px] text-gray-400">By {log.adminName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
