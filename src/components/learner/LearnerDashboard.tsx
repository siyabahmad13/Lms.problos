import React from 'react';
import { User, Course, Task, TaskSubmission, Certificate, Announcement, LearnerProgress } from '../../types';
import { BookOpen, CheckCircle, Clock, Award, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';

interface LearnerDashboardProps {
  currentUser: User;
  courses: Course[];
  tasks: Task[];
  submissions: TaskSubmission[];
  certificates: Certificate[];
  announcements: Announcement[];
  allProgress: LearnerProgress[];
  onOpenCourse: (courseId: string) => void;
  onNavigateToSubmissions: () => void;
  onNavigateToCertificates: () => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  currentUser,
  courses,
  tasks,
  submissions,
  certificates,
  announcements,
  allProgress,
  onOpenCourse,
  onNavigateToSubmissions,
  onNavigateToCertificates,
}) => {
  // Filter courses accessible to this learner
  const enrolledCourses = courses.filter(c => currentUser.enrolledCourseIds.includes(c.id));

  // Compute total lessons & completed lessons
  let totalLessonsAcrossCourses = 0;
  let totalCompletedLessons = 0;

  enrolledCourses.forEach(c => {
    const p = allProgress.find(pr => pr.userId === currentUser.id && pr.courseId === c.id);
    const completedCount = p?.completedLessonIds.length || 0;
    totalCompletedLessons += completedCount;

    c.weeks.forEach(w => {
      totalLessonsAcrossCourses += w.lessons.length;
    });
  });

  const overallPercent = totalLessonsAcrossCourses > 0
    ? Math.round((totalCompletedLessons / totalLessonsAcrossCourses) * 100)
    : 0;

  // Pending tasks for enrolled courses
  const enrolledCourseIds = enrolledCourses.map(c => c.id);
  const relevantTasks = tasks.filter(t => enrolledCourseIds.includes(t.courseId));
  const pendingTasks = relevantTasks.filter(t => {
    const sub = submissions.find(s => s.taskId === t.id && s.learnerId === currentUser.id);
    return !sub || sub.currentStatus === 'revision_requested';
  });

  // Filter announcements targeted to all or learner's tracks
  const relevantAnnouncements = announcements.filter(a => {
    if (a.targetType === 'all') return true;
    if (a.targetType === 'track' && a.targetTrackId && currentUser.assignedTrackIds.includes(a.targetTrackId)) return true;
    if (a.targetType === 'learners' && a.targetLearnerIds?.includes(currentUser.id)) return true;
    return false;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e6f5f0] text-[#009166]">
              Problos Engineering Cohort
            </span>
            {currentUser.accessExpiresAt && (
              <span className="text-xs text-gray-500">
                Access valid until {new Date(currentUser.accessExpiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {currentUser.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1 max-w-2xl">
            Continue your structured learning journey. Watch course lessons, complete hands-on tasks, and earn industry-verified certificates.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
          <div className="text-center px-3">
            <div className="text-2xl font-bold text-[#009166]">{overallPercent}%</div>
            <div className="text-xs font-medium text-gray-500">Cohort Progress</div>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="text-center px-3">
            <div className="text-2xl font-bold text-gray-900">{certificates.length}</div>
            <div className="text-xs font-medium text-gray-500">Certificates</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#e6f5f0] text-[#009166] flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</div>
            <div className="text-xs text-gray-500 font-medium">Assigned Courses</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalCompletedLessons}</div>
            <div className="text-xs text-gray-500 font-medium">Completed Lessons</div>
          </div>
        </div>

        <div
          onClick={onNavigateToSubmissions}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-4 cursor-pointer hover:border-amber-300 transition"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{pendingTasks.length}</div>
            <div className="text-xs text-gray-500 font-medium">Tasks Requiring Action</div>
          </div>
        </div>

        <div
          onClick={onNavigateToCertificates}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-4 cursor-pointer hover:border-[#009166]/40 transition"
        >
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{certificates.length}</div>
            <div className="text-xs text-gray-500 font-medium">Verified Credentials</div>
          </div>
        </div>
      </div>

      {/* Main Split: Current Courses & Pending Tasks/Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: In-Progress Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Current In-Progress Courses</h2>
            <span className="text-xs text-gray-500">{enrolledCourses.length} active courses</span>
          </div>

          <div className="space-y-4">
            {enrolledCourses.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                <p>No active courses assigned yet. Contact your track instructor.</p>
              </div>
            ) : (
              enrolledCourses.map(course => {
                const prog = allProgress.find(p => p.userId === currentUser.id && p.courseId === course.id);
                const totalCourseLessons = course.weeks.reduce((acc, w) => acc + w.lessons.length, 0);
                const completedCount = prog?.completedLessonIds.length || 0;
                const percent = totalCourseLessons > 0 ? Math.round((completedCount / totalCourseLessons) * 100) : 0;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                  >
                    <div className="flex gap-4 items-center">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="green" size="sm">
                            {course.weeks.length} Weeks
                          </Badge>
                          <span className="text-xs text-gray-500">Instructor: {course.instructorName}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg hover:text-[#009166] transition">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-56 flex-shrink-0 flex flex-col items-end gap-2.5">
                      <div className="w-full">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-gray-500">{completedCount} of {totalCourseLessons} lessons</span>
                          <span className="text-[#009166]">{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#009166] rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenCourse(course.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                      >
                        <span>{percent === 0 ? 'Start Course' : 'Continue Learning'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Pending Tasks & Announcements */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Pending Tasks</span>
              </h2>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {pendingTasks.length} Due
              </span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500">
                <CheckCircle className="w-8 h-8 text-[#009166] mx-auto mb-2 opacity-70" />
                All caught up! No pending tasks require action.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.slice(0, 3).map(task => {
                  const sub = submissions.find(s => s.taskId === task.id && s.learnerId === currentUser.id);
                  const isRevision = sub?.currentStatus === 'revision_requested';

                  return (
                    <div
                      key={task.id}
                      onClick={onNavigateToSubmissions}
                      className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/40 hover:border-[#009166]/30 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm text-gray-900">{task.title}</div>
                        {isRevision ? (
                          <Badge variant="amber" size="sm">Revision Req.</Badge>
                        ) : (
                          <Badge variant="blue" size="sm">Not Submitted</Badge>
                        )}
                      </div>

                      {task.deadline && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={onNavigateToSubmissions}
                  className="w-full text-center text-xs font-semibold text-[#009166] hover:underline pt-2 cursor-pointer"
                >
                  View All Submissions & Tasks →
                </button>
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#009166]" />
                <span>Cohort Announcements</span>
              </h2>
            </div>

            {relevantAnnouncements.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-500">
                No recent announcements.
              </div>
            ) : (
              <div className="space-y-3">
                {relevantAnnouncements.slice(0, 2).map(ann => (
                  <div key={ann.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{ann.title}</span>
                      {ann.priority === 'urgent' && <Badge variant="red" size="sm">Urgent</Badge>}
                    </div>
                    <p className="text-gray-600 line-clamp-2">{ann.content}</p>
                    <div className="text-[10px] text-gray-500 mt-2">
                      Posted by {ann.authorName} • {new Date(ann.createdAt).toLocaleDateString()}
                    </div>
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
