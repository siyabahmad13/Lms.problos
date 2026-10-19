import React, { useState } from 'react';
import { LearningTrack, Course, User } from '../../types';
import { storage } from '../../services/storage';
import {
  Layers,
  BookOpen,
  PlusCircle,
  Archive,
  Eye,
  CheckCircle2,
  FileEdit,
  FolderPlus,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface TracksCoursesProps {
  currentAdmin: User;
  tracks: LearningTrack[];
  courses: Course[];
  onRefreshData: () => void;
  onOpenCurriculumBuilder: (courseId: string) => void;
}

export const TracksCourses: React.FC<TracksCoursesProps> = ({
  currentAdmin,
  tracks,
  courses,
  onRefreshData,
  onOpenCurriculumBuilder,
}) => {
  const [activeTab, setActiveTab] = useState<'tracks' | 'courses'>('tracks');

  // Modals
  const [showCreateTrackModal, setShowCreateTrackModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<LearningTrack | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Create Track Form
  const [trackTitle, setTrackTitle] = useState('');
  const [trackDesc, setTrackDesc] = useState('');
  const [trackCategory, setTrackCategory] = useState('Software Engineering');
  const [trackHours, setTrackHours] = useState(80);
  const [trackLevel, setTrackLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  // Create Course Form
  const [courseTrackId, setCourseTrackId] = useState(tracks[0]?.id || '');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [instructorName, setInstructorName] = useState(currentAdmin.name);
  const [instructorTitle, setInstructorTitle] = useState('Senior Staff Architect');
  const [courseThumbnail, setCourseThumbnail] = useState('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80');

  // Save Track
  const handleSaveTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim()) return;

    const newTrack: LearningTrack = {
      id: editingTrack?.id || 'trk_' + Date.now(),
      title: trackTitle.trim(),
      slug: trackTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: trackDesc.trim(),
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
      category: trackCategory,
      courseIds: editingTrack?.courseIds || [],
      isPublished: true,
      isArchived: false,
      estimatedHours: trackHours,
      level: trackLevel,
      createdAt: editingTrack?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveTrack(newTrack);

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: editingTrack ? 'Updated Learning Track' : 'Created Learning Track',
      details: `${editingTrack ? 'Updated' : 'Created'} track "${newTrack.title}".`,
      targetType: 'track',
      targetId: newTrack.id,
    });

    setShowCreateTrackModal(false);
    setEditingTrack(null);
    setTrackTitle('');
    setTrackDesc('');
    onRefreshData();
  };

  // Save Course
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseTrackId) return;

    const newCourse: Course = {
      id: editingCourse?.id || 'crs_' + Date.now(),
      trackId: courseTrackId,
      title: courseTitle.trim(),
      slug: courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: courseDesc.trim(),
      thumbnail: courseThumbnail,
      instructorName,
      instructorTitle,
      isPublished: editingCourse ? editingCourse.isPublished : false, // Defaults to draft until published!
      isArchived: editingCourse ? editingCourse.isArchived : false,
      status: editingCourse ? editingCourse.status : 'draft',
      weeks: editingCourse?.weeks || [
        {
          id: 'wk_' + Date.now() + '_1',
          weekNumber: 1,
          title: 'Module 1: Foundations',
          description: 'Introduction and core concepts.',
          unlockRequiresTaskApproval: false,
          lessons: [],
        },
      ],
      createdAt: editingCourse?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveCourse(newCourse);

    // Link course to parent track if not linked
    const parentTrack = tracks.find(t => t.id === courseTrackId);
    if (parentTrack && !parentTrack.courseIds.includes(newCourse.id)) {
      parentTrack.courseIds.push(newCourse.id);
      storage.saveTrack(parentTrack);
    }

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: editingCourse ? 'Updated Course Info' : 'Created Course (Draft)',
      details: `${editingCourse ? 'Updated' : 'Created draft for'} course "${newCourse.title}".`,
      targetType: 'course',
      targetId: newCourse.id,
    });

    setShowCreateCourseModal(false);
    setEditingCourse(null);
    setCourseTitle('');
    setCourseDesc('');
    onRefreshData();
  };

  // Toggle Course Publish / Draft
  const handleToggleCoursePublish = (course: Course) => {
    const willPublish = !course.isPublished;
    const updated: Course = {
      ...course,
      isPublished: willPublish,
      status: willPublish ? 'published' : 'draft',
      updatedAt: new Date().toISOString(),
    };
    storage.saveCourse(updated);

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: willPublish ? 'Published Course' : 'Unpublished Course (Draft)',
      details: `Changed "${course.title}" status to ${willPublish ? 'Published' : 'Draft'}.`,
      targetType: 'course',
      targetId: course.id,
    });

    onRefreshData();
  };

  // Toggle Course Archive (preserves all records and certificates!)
  const handleToggleArchiveCourse = (course: Course) => {
    const willArchive = !course.isArchived;
    const updated: Course = {
      ...course,
      isArchived: willArchive,
      status: willArchive ? 'archived' : course.isPublished ? 'published' : 'draft',
      updatedAt: new Date().toISOString(),
    };
    storage.saveCourse(updated);

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: willArchive ? 'Archived Course' : 'Restored Course from Archive',
      details: `Archived status of "${course.title}" set to ${willArchive}. Existing learner progress and certificates preserved.`,
      targetType: 'course',
      targetId: course.id,
    });

    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tracks & Courses Architecture</h1>
          <p className="text-sm text-gray-600 mt-1">
            Build multi-course tracks, manage publication statuses, draft updates, and archive historical records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTrack(null);
              setTrackTitle('');
              setTrackDesc('');
              setShowCreateTrackModal(true);
            }}
            className="px-3.5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-[#009166]" />
            <span>New Track</span>
          </button>
          <button
            onClick={() => {
              setEditingCourse(null);
              setCourseTitle('');
              setCourseDesc('');
              setShowCreateCourseModal(true);
            }}
            className="px-4 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Course</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-gray-200 flex gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`pb-3 cursor-pointer flex items-center gap-2 ${
            activeTab === 'tracks'
              ? 'text-[#009166] border-b-2 border-[#009166]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Learning Tracks ({tracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 cursor-pointer flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'text-[#009166] border-b-2 border-[#009166]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses ({courses.length})</span>
        </button>
      </div>

      {/* Tracks Tab */}
      {activeTab === 'tracks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map(track => {
            const trackCourses = courses.filter(c => track.courseIds.includes(c.id));

            return (
              <div
                key={track.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="green" size="sm">{track.category}</Badge>
                    <span className="text-xs text-gray-500">{track.level} • {track.estimatedHours} hrs</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{track.title}</h3>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{track.description}</p>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-700 block mb-2">
                      Courses in this Track ({trackCourses.length}):
                    </span>
                    <div className="space-y-1.5">
                      {trackCourses.map(c => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-2 rounded bg-gray-50 text-xs"
                        >
                          <span className="font-medium text-gray-800 truncate pr-2">{c.title}</span>
                          <Badge variant={c.isPublished ? 'green' : 'gray'} size="sm">
                            {c.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setEditingTrack(track);
                      setTrackTitle(track.title);
                      setTrackDesc(track.description);
                      setTrackCategory(track.category);
                      setTrackHours(track.estimatedHours);
                      setTrackLevel(track.level);
                      setShowCreateTrackModal(true);
                    }}
                    className="font-bold text-[#009166] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Edit Track</span>
                  </button>

                  <span className="text-gray-400 font-mono text-[10px]">ID: {track.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9F6] border-b border-gray-200 text-xs uppercase font-bold text-gray-500">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Parent Track</th>
                  <th className="px-6 py-4">Curriculum</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map(course => {
                  const parentTrack = tracks.find(t => t.id === course.trackId);
                  const totalLessons = course.weeks.reduce((acc, w) => acc + w.lessons.length, 0);

                  return (
                    <tr key={course.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{course.title}</div>
                            <div className="text-xs text-gray-500">Instructor: {course.instructorName}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                        {parentTrack?.title || 'Standalone'}
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-600">
                        <span>{course.weeks.length} Weeks</span>
                        <span className="mx-1.5">•</span>
                        <span>{totalLessons} Lessons</span>
                      </td>

                      <td className="px-6 py-4">
                        {course.isArchived ? (
                          <Badge variant="amber">Archived</Badge>
                        ) : course.isPublished ? (
                          <Badge variant="green">Published</Badge>
                        ) : (
                          <Badge variant="gray">Draft</Badge>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Open Curriculum Builder */}
                          <button
                            onClick={() => onOpenCurriculumBuilder(course.id)}
                            className="px-2.5 py-1.5 bg-[#e6f5f0] text-[#009166] hover:bg-emerald-100 rounded text-xs font-bold transition cursor-pointer"
                            title="Edit Curriculum & Lessons"
                          >
                            Edit Curriculum
                          </button>

                          {/* Publish/Unpublish */}
                          <button
                            onClick={() => handleToggleCoursePublish(course)}
                            className={`p-1.5 rounded transition cursor-pointer ${
                              course.isPublished ? 'text-gray-500 hover:text-amber-600' : 'text-gray-500 hover:text-[#009166]'
                            }`}
                            title={course.isPublished ? 'Unpublish to Draft' : 'Publish Course'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Archive/Unarchive */}
                          <button
                            onClick={() => handleToggleArchiveCourse(course)}
                            className={`p-1.5 rounded transition cursor-pointer ${
                              course.isArchived ? 'text-amber-600 hover:text-gray-600' : 'text-gray-400 hover:text-amber-600'
                            }`}
                            title={course.isArchived ? 'Restore from Archive' : 'Archive Course'}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Track */}
      {showCreateTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">
                {editingTrack ? 'Edit Learning Track' : 'Create Learning Track'}
              </h3>
              <button onClick={() => setShowCreateTrackModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSaveTrack} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Track Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Full-Stack Web Development"
                  value={trackTitle}
                  onChange={e => setTrackTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Track overview, career outcomes, and competencies..."
                  value={trackDesc}
                  onChange={e => setTrackDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Category</label>
                  <input
                    type="text"
                    value={trackCategory}
                    onChange={e => setTrackCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Level</label>
                  <select
                    value={trackLevel}
                    onChange={e => setTrackLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTrackModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Course */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Create New Course (Draft)</h3>
              <button onClick={() => setShowCreateCourseModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Parent Track *</label>
                <select
                  value={courseTrackId}
                  onChange={e => setCourseTrackId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  {tracks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asynchronous TypeScript & REST APIs"
                  value={courseTitle}
                  onChange={e => setCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Course summary and learning objectives..."
                  value={courseDesc}
                  onChange={e => setCourseDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Instructor Name</label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={e => setInstructorName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Instructor Title</label>
                  <input
                    type="text"
                    value={instructorTitle}
                    onChange={e => setInstructorTitle(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Course Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
