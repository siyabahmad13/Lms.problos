import React, { useState, useEffect } from 'react';
import {
  User,
  Course,
  WeekModule,
  Lesson,
  Task,
  TaskSubmission,
  LearnerProgress,
} from '../../types';
import { storage } from '../../services/storage';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  PlayCircle,
  FileText,
  Code,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Send,
  History,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CoursePlayerProps {
  currentUser: User;
  course: Course;
  tasks: Task[];
  submissions: TaskSubmission[];
  onBackToCourses: () => void;
  onRefreshData: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  currentUser,
  course,
  tasks,
  submissions,
  onBackToCourses,
  onRefreshData,
}) => {
  // Load learner progress for this course
  const [progress, setProgress] = useState<LearnerProgress>(() =>
    storage.getProgress(currentUser.id, course.id)
  );

  // Active view: either a lesson or a task
  const [activeType, setActiveType] = useState<'lesson' | 'task'>('lesson');
  const [activeWeekId, setActiveWeekId] = useState<string>(course.weeks[0]?.id || '');
  const [activeLessonId, setActiveLessonId] = useState<string>(
    course.weeks[0]?.lessons[0]?.id || ''
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Code snippet copied state
  const [copiedCode, setCopiedCode] = useState(false);

  // Submission form state
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);

  // Check if a week is locked
  const isWeekLocked = (weekIndex: number): { locked: boolean; reason?: string } => {
    if (weekIndex === 0) return { locked: false }; // First week is always open

    // Look at previous week
    const prevWeek = course.weeks[weekIndex - 1];
    if (!prevWeek) return { locked: false };

    // Check if admin has granted an unlock override for this learner
    const currentWeek = course.weeks[weekIndex];
    if (storage.hasUnlockOverride(currentUser.id, course.id, currentWeek.id)) {
      return { locked: false };
    }

    // If previous week requires task approval:
    if (prevWeek.unlockRequiresTaskApproval && prevWeek.taskId) {
      const prevTask = tasks.find(t => t.id === prevWeek.taskId);
      const sub = submissions.find(s => s.taskId === prevWeek.taskId && s.learnerId === currentUser.id);

      if (!sub) {
        return {
          locked: true,
          reason: `Week ${prevWeek.weekNumber} requires task "${prevTask?.title || 'Assignment'}" to be approved before unlocking.`,
        };
      }

      if (sub.currentStatus === 'revision_requested') {
        return {
          locked: true,
          reason: `Revisions were requested on Week ${prevWeek.weekNumber} task. Please address feedback and await instructor approval.`,
        };
      }

      if (sub.currentStatus === 'pending') {
        return {
          locked: true,
          reason: `Week ${prevWeek.weekNumber} task submission is currently under review by instructors.`,
        };
      }

      if (sub.currentStatus !== 'approved') {
        return {
          locked: true,
          reason: `Week ${prevWeek.weekNumber} task must be approved by an administrator to unlock this module.`,
        };
      }
    }

    return { locked: false };
  };

  // Find active week, lesson, and task
  const currentWeek = course.weeks.find(w => w.id === activeWeekId) || course.weeks[0];
  const currentLesson = currentWeek?.lessons.find(l => l.id === activeLessonId) || currentWeek?.lessons[0];
  const currentTask = tasks.find(t => t.id === activeTaskId);
  const currentTaskSubmission = currentTask
    ? submissions.find(s => s.taskId === currentTask.id && s.learnerId === currentUser.id)
    : undefined;

  // Sync current lesson into progress state
  useEffect(() => {
    if (currentLesson && progress.currentLessonId !== currentLesson.id) {
      const updated: LearnerProgress = {
        ...progress,
        currentLessonId: currentLesson.id,
        lastAccessedAt: new Date().toISOString(),
      };
      setProgress(updated);
      storage.saveProgress(updated);
    }
  }, [currentLesson]);

  // Toggle lesson completed
  const handleToggleCompleted = (lessonId: string) => {
    const isCompleted = progress.completedLessonIds.includes(lessonId);
    let updatedCompleted: string[];

    if (isCompleted) {
      updatedCompleted = progress.completedLessonIds.filter(id => id !== lessonId);
    } else {
      updatedCompleted = [...progress.completedLessonIds, lessonId];
    }

    const updated: LearnerProgress = {
      ...progress,
      completedLessonIds: updatedCompleted,
      lastAccessedAt: new Date().toISOString(),
    };

    setProgress(updated);
    storage.saveProgress(updated);
    onRefreshData();
  };

  // Navigate to Next Lesson / Task
  const handleNext = () => {
    if (!currentWeek) return;

    if (activeType === 'lesson' && currentLesson) {
      const lessonIndex = currentWeek.lessons.findIndex(l => l.id === currentLesson.id);
      if (lessonIndex < currentWeek.lessons.length - 1) {
        // Next lesson in current week
        setActiveLessonId(currentWeek.lessons[lessonIndex + 1].id);
      } else if (currentWeek.taskId) {
        // Week task
        setActiveType('task');
        setActiveTaskId(currentWeek.taskId);
      } else {
        // Try next week
        const weekIndex = course.weeks.findIndex(w => w.id === currentWeek.id);
        if (weekIndex < course.weeks.length - 1) {
          const nextWeek = course.weeks[weekIndex + 1];
          const lockStatus = isWeekLocked(weekIndex + 1);
          if (!lockStatus.locked) {
            setActiveWeekId(nextWeek.id);
            setActiveLessonId(nextWeek.lessons[0]?.id || '');
            setActiveType('lesson');
          }
        }
      }
    } else if (activeType === 'task') {
      const weekIndex = course.weeks.findIndex(w => w.id === currentWeek.id);
      if (weekIndex < course.weeks.length - 1) {
        const nextWeek = course.weeks[weekIndex + 1];
        const lockStatus = isWeekLocked(weekIndex + 1);
        if (!lockStatus.locked) {
          setActiveWeekId(nextWeek.id);
          setActiveLessonId(nextWeek.lessons[0]?.id || '');
          setActiveType('lesson');
        }
      }
    }
  };

  // Navigate to Previous
  const handlePrevious = () => {
    if (!currentWeek) return;

    if (activeType === 'task') {
      // Go to last lesson of current week
      if (currentWeek.lessons.length > 0) {
        setActiveType('lesson');
        setActiveLessonId(currentWeek.lessons[currentWeek.lessons.length - 1].id);
      }
    } else if (activeType === 'lesson' && currentLesson) {
      const lessonIndex = currentWeek.lessons.findIndex(l => l.id === currentLesson.id);
      if (lessonIndex > 0) {
        setActiveLessonId(currentWeek.lessons[lessonIndex - 1].id);
      } else {
        // Go to previous week's task or lesson
        const weekIndex = course.weeks.findIndex(w => w.id === currentWeek.id);
        if (weekIndex > 0) {
          const prevWeek = course.weeks[weekIndex - 1];
          setActiveWeekId(prevWeek.id);
          if (prevWeek.taskId) {
            setActiveType('task');
            setActiveTaskId(prevWeek.taskId);
          } else if (prevWeek.lessons.length > 0) {
            setActiveType('lesson');
            setActiveLessonId(prevWeek.lessons[prevWeek.lessons.length - 1].id);
          }
        }
      }
    }
  };

  // Copy code snippet helper
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Handle task submission
  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;

    // Check deadline
    if (currentTask.deadline && !currentTask.allowLateSubmission) {
      if (new Date(currentTask.deadline).getTime() < Date.now()) {
        alert('This assignment has passed its configured deadline and does not accept late submissions.');
        return;
      }
    }

    if (!githubUrl.trim() && !liveDemoUrl.trim() && !docUrl.trim()) {
      alert('Please provide at least one link (GitHub Repository, Live Demo, or Documentation).');
      return;
    }

    setSubmitting(true);

    const existingSub = currentTaskSubmission;
    const attemptNumber = (existingSub?.attempts.length || 0) + 1;

    const newAttempt = {
      id: 'att_' + Date.now(),
      attemptNumber,
      submittedAt: new Date().toISOString(),
      githubUrl: githubUrl.trim() || undefined,
      liveDemoUrl: liveDemoUrl.trim() || undefined,
      documentationUrl: docUrl.trim() || undefined,
      notes: submissionNotes.trim() || undefined,
      status: 'pending' as const,
    };

    const updatedSub: TaskSubmission = {
      id: existingSub?.id || 'sub_' + Date.now(),
      taskId: currentTask.id,
      courseId: course.id,
      learnerId: currentUser.id,
      learnerName: currentUser.name,
      learnerEmail: currentUser.email,
      currentStatus: 'pending',
      attempts: existingSub ? [...existingSub.attempts, newAttempt] : [newAttempt],
      createdAt: existingSub?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveSubmission(updatedSub);
    setSubmitting(false);
    setSubmissionSuccessMsg('Submission received! Your instructor will review your links and award marks.');
    setTimeout(() => setSubmissionSuccessMsg(null), 5000);

    // Clear form
    setGithubUrl('');
    setLiveDemoUrl('');
    setDocUrl('');
    setSubmissionNotes('');

    onRefreshData();
  };

  // Total lessons in course
  const totalLessons = course.weeks.reduce((acc, w) => acc + w.lessons.length, 0);
  const completedLessonsCount = progress.completedLessonIds.length;
  const coursePercent = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-[#FAF9F6]">
      {/* Top Breadcrumb & Return Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCourses}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#009166] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Courses</span>
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-bold text-gray-900 truncate max-w-xs sm:max-w-md">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-gray-500">{completedLessonsCount}/{totalLessons} completed</span>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#009166]" style={{ width: `${coursePercent}%` }}></div>
            </div>
            <span className="font-bold text-[#009166]">{coursePercent}%</span>
          </div>
        </div>
      </div>

      {/* Main Player Workspace: Left Syllabus Drawer & Right Content Viewer */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Drawer / Curriculum Syllabus */}
        <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-10rem)]">
          <div className="p-4 border-b border-gray-100 bg-[#FAF9F6]">
            <h3 className="font-bold text-sm text-gray-900">Course Syllabus</h3>
            <p className="text-xs text-gray-500 mt-0.5">{course.weeks.length} Weeks of structured modules</p>
          </div>

          <div className="divide-y divide-gray-100">
            {course.weeks.map((week, weekIndex) => {
              const lockInfo = isWeekLocked(weekIndex);
              const isWeekActive = activeWeekId === week.id;

              return (
                <div key={week.id} className="py-2">
                  {/* Week Header */}
                  <div
                    className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold cursor-pointer transition ${
                      isWeekActive ? 'text-[#009166] bg-emerald-50/40' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (!lockInfo.locked) {
                        setActiveWeekId(week.id);
                        if (week.lessons.length > 0) {
                          setActiveType('lesson');
                          setActiveLessonId(week.lessons[0].id);
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {lockInfo.locked ? (
                        <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#e6f5f0] text-[#009166] text-[10px] flex items-center justify-center font-bold">
                          {week.weekNumber}
                        </div>
                      )}
                      <div>
                        <span className="block text-[13px] font-bold">Week {week.weekNumber}: {week.title}</span>
                        {lockInfo.locked && (
                          <span className="text-[10px] font-normal text-amber-700 block">
                            Locked • Task Approval Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Week Lessons & Task */}
                  {lockInfo.locked ? (
                    <div className="mx-4 my-2 p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-xs text-amber-900">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Module Gated</p>
                          <p className="text-[11px] text-amber-800 mt-0.5">{lockInfo.reason}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-4 pr-2 py-1 space-y-1">
                      {week.lessons.map(lesson => {
                        const isCompleted = progress.completedLessonIds.includes(lesson.id);
                        const isCurrent = activeType === 'lesson' && activeLessonId === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setActiveWeekId(week.id);
                              setActiveLessonId(lesson.id);
                              setActiveType('lesson');
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                              isCurrent
                                ? 'bg-[#009166] text-white font-semibold shadow-xs'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate pr-2">
                              {isCompleted ? (
                                <CheckCircle2
                                  className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-white' : 'text-[#009166]'}`}
                                />
                              ) : (
                                <PlayCircle
                                  className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-white' : 'text-gray-400'}`}
                                />
                              )}
                              <span className="truncate text-[13px]">{lesson.title}</span>
                            </div>
                            <span
                              className={`text-[11px] font-mono flex-shrink-0 ${
                                isCurrent ? 'text-emerald-100' : 'text-gray-400'
                              }`}
                            >
                              {lesson.durationMinutes}m
                            </span>
                          </button>
                        );
                      })}

                      {/* Associated Task for this week */}
                      {week.taskId && (() => {
                        const task = tasks.find(t => t.id === week.taskId);
                        const sub = submissions.find(
                          s => s.taskId === week.taskId && s.learnerId === currentUser.id
                        );
                        const isTaskCurrent = activeType === 'task' && activeTaskId === week.taskId;

                        return (
                          <button
                            onClick={() => {
                              setActiveWeekId(week.id);
                              setActiveTaskId(week.taskId!);
                              setActiveType('task');
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between mt-1 transition cursor-pointer border ${
                              isTaskCurrent
                                ? 'bg-amber-600 text-white font-semibold border-amber-600'
                                : 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <FileText className="w-4 h-4 flex-shrink-0 text-amber-500" />
                              <span className="truncate text-[13px] font-semibold">
                                Task: {task?.title || 'Deliverable'}
                              </span>
                            </div>

                            {sub ? (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  sub.currentStatus === 'approved'
                                    ? 'bg-emerald-100 text-[#009166]'
                                    : sub.currentStatus === 'revision_requested'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {sub.currentStatus === 'approved'
                                  ? 'Approved'
                                  : sub.currentStatus === 'revision_requested'
                                  ? 'Revision'
                                  : 'Submitted'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                                Due
                              </span>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Player Screen */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeType === 'lesson' && currentLesson ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Lesson Title & Completion Action */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>Week {currentWeek.weekNumber}</span>
                    <span>•</span>
                    <span>Lesson {currentLesson.order}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {currentLesson.durationMinutes} mins
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                    {currentLesson.title}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">{currentLesson.description}</p>
                </div>

                <button
                  onClick={() => handleToggleCompleted(currentLesson.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer flex-shrink-0 shadow-xs ${
                    progress.completedLessonIds.includes(currentLesson.id)
                      ? 'bg-[#e6f5f0] text-[#009166] border border-[#009166]/30 hover:bg-emerald-100'
                      : 'bg-[#009166] hover:bg-[#007a56] text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {progress.completedLessonIds.includes(currentLesson.id)
                      ? 'Completed ✓'
                      : 'Mark Completed'}
                  </span>
                </button>
              </div>

              {/* Video Player */}
              {currentLesson.videoEmbedUrl ? (
                <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-md border border-gray-800">
                  <iframe
                    src={currentLesson.videoEmbedUrl}
                    title={currentLesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="bg-slate-900 text-white rounded-2xl aspect-video flex flex-col items-center justify-center p-6 text-center border border-slate-800">
                  <PlayCircle className="w-16 h-16 text-[#009166] mb-3 opacity-90 animate-pulse" />
                  <h3 className="text-lg font-bold">Interactive Reading & Lab Session</h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    Focus on the architecture notes, executable code patterns, and reference documentation below.
                  </p>
                </div>
              )}

              {/* Lesson Notes & Architecture Guides */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <FileText className="w-5 h-5 text-[#009166]" />
                  <span>Curriculum Notes & Architecture</span>
                </h3>

                <div className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
                  {currentLesson.notesMarkdown}
                </div>
              </div>

              {/* Code Snippet Viewer */}
              {currentLesson.codeSnippet && (
                <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-gray-800 shadow-sm">
                  <div className="bg-[#2d2d2d] px-4 py-2.5 flex items-center justify-between text-xs text-gray-300">
                    <div className="flex items-center gap-2 font-mono">
                      <Code className="w-4 h-4 text-[#009166]" />
                      <span>{currentLesson.codeSnippet.filename || `${currentLesson.codeSnippet.language}-example`}</span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(currentLesson.codeSnippet!.code)}
                      className="flex items-center gap-1.5 bg-[#3e3e3e] hover:bg-[#4e4e4e] text-white px-2.5 py-1 rounded transition cursor-pointer text-xs"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-5 text-emerald-300 font-mono text-sm overflow-x-auto leading-relaxed">
                    <code>{currentLesson.codeSnippet.code}</code>
                  </pre>
                </div>
              )}

              {/* Resource Links */}
              {currentLesson.resources && currentLesson.resources.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-[#009166]" />
                    <span>Supplementary Documentation & Resources</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentLesson.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-lg border border-gray-200 hover:border-[#009166] hover:bg-emerald-50/30 transition flex items-center justify-between group"
                      >
                        <div className="truncate pr-2">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-[#009166] truncate">
                            {res.title}
                          </div>
                          <div className="text-[11px] text-gray-400 uppercase font-mono">{res.type} link</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#009166]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : activeType === 'task' && currentTask ? (
            /* Task & Assignment Workspace */
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Task Header Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Week {currentWeek.weekNumber} Required Deliverable
                      </span>
                      {currentTask.deadline && (
                        <span className="text-xs text-gray-500 font-medium">
                          Deadline: {new Date(currentTask.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      {currentTask.title}
                    </h1>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Max Score:</span>
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {currentTask.maxMarks} pts
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-2">Assignment Specifications</h3>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {currentTask.instructions}
                  </div>
                </div>

                {/* Current Status Banner */}
                {currentTaskSubmission && (
                  <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-gray-600">Current Review Status:</span>
                      <Badge
                        variant={
                          currentTaskSubmission.currentStatus === 'approved'
                            ? 'green'
                            : currentTaskSubmission.currentStatus === 'revision_requested'
                            ? 'amber'
                            : 'blue'
                        }
                      >
                        {currentTaskSubmission.currentStatus === 'approved'
                          ? 'Approved ✓'
                          : currentTaskSubmission.currentStatus === 'revision_requested'
                          ? 'Revision Requested'
                          : 'Pending Review'}
                      </Badge>
                    </div>

                    {currentTaskSubmission.latestMarks !== undefined && (
                      <div className="text-sm font-bold text-gray-900">
                        Score Awarded: <span className="text-[#009166]">{currentTaskSubmission.latestMarks} / {currentTask.maxMarks}</span>
                      </div>
                    )}

                    {currentTaskSubmission.latestFeedback && (
                      <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs">
                        <span className="font-bold text-gray-900 block mb-1">Instructor Feedback:</span>
                        <p className="text-gray-700 leading-relaxed">{currentTaskSubmission.latestFeedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submission Form */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-5">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Send className="w-4 h-4 text-[#009166]" />
                  <span>
                    {currentTaskSubmission?.currentStatus === 'revision_requested'
                      ? 'Submit Revised Work'
                      : 'Submit Assignment Deliverables'}
                  </span>
                </h3>

                {submissionSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border border-[#009166]/30 text-[#009166] rounded-xl text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{submissionSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitTask} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      GitHub Repository URL *
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={e => setGithubUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Live Demo URL (Cloudflare Pages / Vercel)
                      </label>
                      <input
                        type="url"
                        placeholder="https://project.pages.dev"
                        value={liveDemoUrl}
                        onChange={e => setLiveDemoUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Documentation / README URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/username/repo#readme"
                        value={docUrl}
                        onChange={e => setDocUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Notes for the Reviewing Instructor
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what you implemented, known edge cases handled, and testing performed..."
                      value={submissionNotes}
                      onChange={e => setSubmissionNotes(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#009166] hover:bg-[#007a56] text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Submit Deliverables for Review'}</span>
                  </button>
                </form>
              </div>

              {/* Submission Attempts History */}
              {currentTaskSubmission && currentTaskSubmission.attempts.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <History className="w-4 h-4 text-gray-500" />
                    <span>Submission Attempts History ({currentTaskSubmission.attempts.length})</span>
                  </h4>

                  <div className="space-y-3">
                    {currentTaskSubmission.attempts.map(att => (
                      <div key={att.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">Attempt #{att.attemptNumber}</span>
                          <span className="text-gray-500">{new Date(att.submittedAt).toLocaleString()}</span>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-1">
                          {att.githubUrl && (
                            <a
                              href={att.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#009166] font-medium underline flex items-center gap-1"
                            >
                              GitHub Repo ↗
                            </a>
                          )}
                          {att.liveDemoUrl && (
                            <a
                              href={att.liveDemoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 font-medium underline flex items-center gap-1"
                            >
                              Live Demo ↗
                            </a>
                          )}
                          {att.documentationUrl && (
                            <a
                              href={att.documentationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-600 font-medium underline flex items-center gap-1"
                            >
                              Docs ↗
                            </a>
                          )}
                        </div>

                        {att.feedback && (
                          <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                            <span className="font-semibold text-gray-800">Feedback: </span>
                            <span className="text-gray-600">{att.feedback}</span>
                            {att.marksAwarded !== undefined && (
                              <span className="font-bold text-[#009166] ml-2">({att.marksAwarded} pts)</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
