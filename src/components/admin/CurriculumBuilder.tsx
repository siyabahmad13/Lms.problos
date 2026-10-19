import React, { useState } from 'react';
import { Course, WeekModule, Lesson, ResourceLink, User } from '../../types';
import { storage } from '../../services/storage';
import {
  FileCode2,
  Plus,
  Trash2,
  Lock,
  PlayCircle,
  FileText,
  Code,
  ExternalLink,
  Save,
  CheckCircle2,
  Eye,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CurriculumBuilderProps {
  currentAdmin: User;
  courses: Course[];
  initialSelectedCourseId?: string;
  onRefreshData: () => void;
  onPreviewCourse?: (courseId: string) => void;
}

export const CurriculumBuilder: React.FC<CurriculumBuilderProps> = ({
  currentAdmin,
  courses,
  initialSelectedCourseId,
  onRefreshData,
  onPreviewCourse,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialSelectedCourseId || courses[0]?.id || ''
  );

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Week editing
  const [activeWeekId, setActiveWeekId] = useState<string>(
    selectedCourse?.weeks[0]?.id || ''
  );

  // Lesson Modal State
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isNewLesson, setIsNewLesson] = useState<boolean>(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonDuration, setLessonDuration] = useState(25);
  const [videoUrl, setVideoUrl] = useState('');
  const [notesMarkdown, setNotesMarkdown] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeFilename, setCodeFilename] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState<ResourceLink['type']>('doc');

  // New Week Modal
  const [showAddWeekModal, setShowAddWeekModal] = useState(false);
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekDesc, setNewWeekDesc] = useState('');
  const [newWeekGated, setNewWeekGated] = useState(true);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!selectedCourse) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
        No courses available. Please create a course first in Tracks & Courses.
      </div>
    );
  }

  const currentWeek = selectedCourse.weeks.find(w => w.id === activeWeekId) || selectedCourse.weeks[0];

  // Save changes to course
  const persistCourse = (updatedCourse: Course, logMsg: string) => {
    storage.saveCourse(updatedCourse);
    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: 'Updated Curriculum',
      details: logMsg,
      targetType: 'course',
      targetId: updatedCourse.id,
    });
    setSaveSuccessMsg('Curriculum changes saved to database.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
    onRefreshData();
  };

  // Add a new week
  const handleAddWeek = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeekTitle.trim()) return;

    const newWeek: WeekModule = {
      id: 'wk_' + Date.now(),
      weekNumber: selectedCourse.weeks.length + 1,
      title: newWeekTitle.trim(),
      description: newWeekDesc.trim(),
      unlockRequiresTaskApproval: newWeekGated,
      lessons: [],
    };

    const updated: Course = {
      ...selectedCourse,
      weeks: [...selectedCourse.weeks, newWeek],
      updatedAt: new Date().toISOString(),
    };

    persistCourse(updated, `Added Week ${newWeek.weekNumber} ("${newWeek.title}") to ${selectedCourse.title}.`);
    setShowAddWeekModal(false);
    setNewWeekTitle('');
    setNewWeekDesc('');
    setActiveWeekId(newWeek.id);
  };

  // Toggle Week Gating (Task Approval Rule)
  const handleToggleWeekGating = (weekId: string) => {
    const updatedWeeks = selectedCourse.weeks.map(w => {
      if (w.id === weekId) {
        return { ...w, unlockRequiresTaskApproval: !w.unlockRequiresTaskApproval };
      }
      return w;
    });

    const targetWeek = selectedCourse.weeks.find(w => w.id === weekId);
    const updated: Course = {
      ...selectedCourse,
      weeks: updatedWeeks,
      updatedAt: new Date().toISOString(),
    };

    persistCourse(
      updated,
      `Toggled task approval gating for Week ${targetWeek?.weekNumber} on ${selectedCourse.title}.`
    );
  };

  // Open Lesson Editor
  const handleOpenLessonEditor = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setIsNewLesson(false);
      setLessonTitle(lesson.title);
      setLessonDesc(lesson.description);
      setLessonDuration(lesson.durationMinutes);
      setVideoUrl(lesson.videoEmbedUrl || '');
      setNotesMarkdown(lesson.notesMarkdown);
      setCodeLanguage(lesson.codeSnippet?.language || 'typescript');
      setCodeFilename(lesson.codeSnippet?.filename || '');
      setCodeContent(lesson.codeSnippet?.code || '');
      setResources(lesson.resources || []);
    } else {
      setEditingLesson({} as Lesson);
      setIsNewLesson(true);
      setLessonTitle('');
      setLessonDesc('');
      setLessonDuration(25);
      setVideoUrl('');
      setNotesMarkdown('### Lesson Overview\n\nExplain key concepts, architecture diagrams, and takeaways here.');
      setCodeLanguage('typescript');
      setCodeFilename('');
      setCodeContent('');
      setResources([]);
    }
  };

  // Save Lesson
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !currentWeek) return;

    const lessonData: Lesson = {
      id: isNewLesson ? 'lsn_' + Date.now() : editingLesson!.id,
      title: lessonTitle.trim(),
      description: lessonDesc.trim(),
      durationMinutes: lessonDuration,
      videoEmbedUrl: videoUrl.trim() || undefined,
      notesMarkdown,
      codeSnippet: codeContent.trim()
        ? {
            language: codeLanguage,
            filename: codeFilename.trim() || undefined,
            code: codeContent.trim(),
          }
        : undefined,
      resources,
      order: isNewLesson ? currentWeek.lessons.length + 1 : editingLesson!.order,
    };

    const updatedWeeks = selectedCourse.weeks.map(w => {
      if (w.id === currentWeek.id) {
        let newLessons: Lesson[];
        if (isNewLesson) {
          newLessons = [...w.lessons, lessonData];
        } else {
          newLessons = w.lessons.map(l => (l.id === lessonData.id ? lessonData : l));
        }
        return { ...w, lessons: newLessons };
      }
      return w;
    });

    const updatedCourse: Course = {
      ...selectedCourse,
      weeks: updatedWeeks,
      updatedAt: new Date().toISOString(),
    };

    persistCourse(
      updatedCourse,
      `${isNewLesson ? 'Added' : 'Updated'} lesson "${lessonData.title}" in Week ${currentWeek.weekNumber} of ${selectedCourse.title}.`
    );

    setEditingLesson(null);
  };

  // Delete Lesson
  const handleDeleteLesson = (lessonId: string) => {
    if (!confirm('Are you sure you want to remove this lesson? Existing progress will adapt gracefully.')) return;

    const updatedWeeks = selectedCourse.weeks.map(w => {
      if (w.id === currentWeek.id) {
        return {
          ...w,
          lessons: w.lessons.filter(l => l.id !== lessonId),
        };
      }
      return w;
    });

    const updatedCourse: Course = {
      ...selectedCourse,
      weeks: updatedWeeks,
      updatedAt: new Date().toISOString(),
    };

    persistCourse(updatedCourse, `Deleted a lesson from Week ${currentWeek.weekNumber} on ${selectedCourse.title}.`);
  };

  // Add Resource Link helper
  const handleAddResource = () => {
    if (!resTitle.trim() || !resUrl.trim()) return;
    setResources([...resources, { title: resTitle.trim(), url: resUrl.trim(), type: resType }]);
    setResTitle('');
    setResUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Course Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Interactive Curriculum Builder</h1>
          <p className="text-sm text-gray-600 mt-1">
            Build weeks, lessons, architecture notes, code examples, and embedded videos directly without editing source code.
          </p>
        </div>

        {/* Course Dropdown */}
        <div className="flex items-center gap-3">
          <label htmlFor="curriculum-course-select" className="text-xs font-semibold text-gray-500">Active Course:</label>
          <select
            id="curriculum-course-select"
            value={selectedCourse.id}
            onChange={e => {
              setSelectedCourseId(e.target.value);
              const c = courses.find(crs => crs.id === e.target.value);
              if (c && c.weeks.length > 0) {
                setActiveWeekId(c.weeks[0].id);
              }
            }}
            className="text-sm bg-white border border-gray-300 rounded-lg px-3.5 py-2 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#009166] cursor-pointer"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-[#009166]/30 text-[#009166] text-xs font-bold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Weeks/Modules List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">Weeks / Modules</h3>
            <button
              onClick={() => setShowAddWeekModal(true)}
              className="p-1 text-[#009166] hover:bg-emerald-50 rounded transition cursor-pointer"
              title="Add Week"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {selectedCourse.weeks.map(w => {
              const isActive = w.id === currentWeek?.id;

              return (
                <div
                  key={w.id}
                  onClick={() => setActiveWeekId(w.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    isActive
                      ? 'border-[#009166] bg-emerald-50/50 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Week {w.weekNumber}</span>
                    <span className="text-gray-400 font-mono text-[10px]">{w.lessons.length} lessons</span>
                  </div>
                  <div className="text-gray-700 font-medium truncate mt-0.5">{w.title}</div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-500">
                      {w.unlockRequiresTaskApproval ? 'Task Gate: On' : 'Open Gate'}
                    </span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleToggleWeekGating(w.id);
                      }}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                        w.unlockRequiresTaskApproval
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Toggle task approval required to unlock following week"
                    >
                      {w.unlockRequiresTaskApproval ? 'Gated' : 'Ungated'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Active Week Details & Lessons Editor */}
        <div className="lg:col-span-3 space-y-6">
          {currentWeek && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
              {/* Active Week Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#009166] uppercase tracking-wider">
                      Week {currentWeek.weekNumber} Configuration
                    </span>
                    <Badge variant={currentWeek.unlockRequiresTaskApproval ? 'amber' : 'green'} size="sm">
                      {currentWeek.unlockRequiresTaskApproval ? 'Task Approval Required' : 'Standard Progression'}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900">{currentWeek.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{currentWeek.description}</p>
                </div>

                <button
                  onClick={() => handleOpenLessonEditor()}
                  className="px-4 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Lesson to Week</span>
                </button>
              </div>

              {/* Lessons List in Current Week */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                  Curriculum Lessons ({currentWeek.lessons.length})
                </h3>

                {currentWeek.lessons.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                    No lessons created for this week yet. Click &quot;Add Lesson to Week&quot; to add content.
                  </div>
                ) : (
                  currentWeek.lessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#009166] text-[10px] font-bold flex items-center justify-center">
                            {lesson.order}
                          </span>
                          <span className="font-bold text-gray-900 text-sm">{lesson.title}</span>
                          <span className="text-xs font-mono text-gray-400">({lesson.durationMinutes}m)</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-1">{lesson.description}</p>

                        <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1">
                          {lesson.videoEmbedUrl && <span className="text-emerald-700 font-medium">✓ Video</span>}
                          {lesson.codeSnippet && <span className="text-blue-700 font-medium">✓ Code ({lesson.codeSnippet.language})</span>}
                          {lesson.resources.length > 0 && <span>{lesson.resources.length} resources</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleOpenLessonEditor(lesson)}
                          className="px-3 py-1.5 border border-gray-300 hover:bg-white text-gray-700 rounded text-xs font-semibold cursor-pointer"
                        >
                          Edit Content
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Week */}
      {showAddWeekModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Add New Module / Week</h3>
              <button onClick={() => setShowAddWeekModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleAddWeek} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Week Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asynchronous Architecture & Promises"
                  value={newWeekTitle}
                  onChange={e => setNewWeekTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of this module..."
                  value={newWeekDesc}
                  onChange={e => setNewWeekDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                ></textarea>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newWeekGated}
                    onChange={e => setNewWeekGated(e.target.checked)}
                    className="rounded text-[#009166]"
                  />
                  <span>Gated: Require Task Approval to Unlock Subsequent Week</span>
                </label>
                <p className="text-[11px] text-amber-800">
                  When enabled, learners cannot access the next week until an admin marks this week's task deliverable as approved.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddWeekModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Add Week
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Lesson Editor (Rich notes, video, code, resources) */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">
                {isNewLesson ? 'Create New Lesson' : `Edit Lesson: ${lessonTitle}`}
              </h3>
              <button onClick={() => setEditingLesson(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asynchronous JavaScript & Event Loop"
                    value={lessonTitle}
                    onChange={e => setLessonTitle(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={lessonDuration}
                    onChange={e => setLessonDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Brief Summary
                </label>
                <input
                  type="text"
                  placeholder="One sentence summary of learning objective..."
                  value={lessonDesc}
                  onChange={e => setLessonDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Video Embed URL (YouTube embed or MP4)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/embed/..."
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Lesson Notes & Architecture Guides (Markdown)
                </label>
                <textarea
                  rows={6}
                  value={notesMarkdown}
                  onChange={e => setNotesMarkdown(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-mono leading-relaxed"
                ></textarea>
              </div>

              {/* Code Snippet Editor */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-[#009166]" />
                    <span>Embedded Code Example (Optional)</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Language</label>
                    <select
                      value={codeLanguage}
                      onChange={e => setCodeLanguage(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="sql">SQL</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Filename</label>
                    <input
                      type="text"
                      placeholder="e.g. useDebounce.ts"
                      value={codeFilename}
                      onChange={e => setCodeFilename(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>

                <textarea
                  rows={4}
                  placeholder="// Paste or write code snippet here..."
                  value={codeContent}
                  onChange={e => setCodeContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-emerald-300 font-mono text-xs rounded-lg"
                ></textarea>
              </div>

              {/* Resource Links Editor */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Reference & Download Links
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Link Title (e.g. MDN Docs)"
                    value={resTitle}
                    onChange={e => setResTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs"
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={resUrl}
                    onChange={e => setResUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddResource}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {resources.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {resources.map((r, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full flex items-center gap-1.5"
                      >
                        <span>{r.title}</span>
                        <button
                          type="button"
                          onClick={() => setResources(resources.filter((_, idx) => idx !== i))}
                          className="text-gray-400 hover:text-rose-600 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Lesson</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
