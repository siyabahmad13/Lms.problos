import React, { useState } from 'react';
import { User, LearningTrack, Course, LearnerProgress } from '../../types';
import { BookOpen, Layers, Clock, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface MyLearningProps {
  currentUser: User;
  tracks: LearningTrack[];
  courses: Course[];
  allProgress: LearnerProgress[];
  onOpenCourse: (courseId: string) => void;
}

export const MyLearning: React.FC<MyLearningProps> = ({
  currentUser,
  tracks,
  courses,
  allProgress,
  onOpenCourse,
}) => {
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');

  // Filter assigned tracks
  const userTracks = tracks.filter(t => currentUser.assignedTrackIds.includes(t.id));

  // Determine which courses are accessible to this learner
  const isCourseAccessible = (courseId: string) => {
    if (currentUser.excludedCourseIds?.includes(courseId)) return false;
    if (currentUser.enrolledCourseIds.includes(courseId)) return true;
    const parentTrack = tracks.find(t => t.courseIds.includes(courseId));
    if (parentTrack && currentUser.assignedTrackIds.includes(parentTrack.id)) return true;
    return false;
  };

  // Filter courses by selected track
  const filteredCourses = courses.filter(course => {
    if (!isCourseAccessible(course.id)) return false;
    if (selectedTrackFilter !== 'all' && course.trackId !== selectedTrackFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Learning Paths</h1>
          <p className="text-sm text-gray-600 mt-1">
            Browse your assigned tracks and structured courses. Each course contains weekly modules and hands-on deliverables.
          </p>
        </div>

        {/* Track Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="track-filter-select" className="text-xs font-semibold text-gray-500">Filter by Track:</label>
          <select
            id="track-filter-select"
            value={selectedTrackFilter}
            onChange={e => setSelectedTrackFilter(e.target.value)}
            className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#009166] cursor-pointer"
          >
            <option value="all">All Tracks ({userTracks.length})</option>
            {userTracks.map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tracks Overview Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#009166]" />
          <span>Assigned Learning Tracks</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userTracks.map(track => {
            const trackCourses = courses.filter(c => track.courseIds.includes(c.id));
            const accessibleTrackCourses = trackCourses.filter(c => isCourseAccessible(c.id));

            return (
              <div
                key={track.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="green" size="sm">{track.category}</Badge>
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {track.estimatedHours} hours total
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{track.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{track.description}</p>
                </div>

                <div className="px-6 py-3 bg-[#FAF9F6] border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">
                    {accessibleTrackCourses.length} Assigned Courses in this Track
                  </span>
                  <button
                    onClick={() => setSelectedTrackFilter(track.id)}
                    className="text-[#009166] font-bold hover:underline cursor-pointer"
                  >
                    View Courses →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#009166]" />
            <span>Course Catalog ({filteredCourses.length})</span>
          </h2>
          {selectedTrackFilter !== 'all' && (
            <button
              onClick={() => setSelectedTrackFilter('all')}
              className="text-xs text-[#009166] font-semibold hover:underline cursor-pointer"
            >
              Show All Courses
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const parentTrack = tracks.find(t => t.id === course.trackId);
            const prog = allProgress.find(p => p.userId === currentUser.id && p.courseId === course.id);
            const totalLessons = course.weeks.reduce((acc, w) => acc + w.lessons.length, 0);
            const completedCount = prog?.completedLessonIds.length || 0;
            const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
            const isCompleted = percent === 100 && totalLessons > 0;

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                        {parentTrack?.title || 'Course'}
                      </span>
                    </div>
                    {isCompleted && (
                      <div className="absolute top-3 right-3 bg-[#009166] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                      <span>{course.weeks.length} Weeks</span>
                      <span>•</span>
                      <span>{totalLessons} Lessons</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#009166] transition line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#009166] text-[10px] font-bold flex items-center justify-center">
                        {course.instructorName.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-600 truncate">{course.instructorName}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                      <span>Progress</span>
                      <span className="text-[#009166] font-bold">{percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#009166] rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenCourse(course.id)}
                    className="w-full py-2.5 px-4 bg-[#009166] hover:bg-[#007a56] text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <span>{percent === 0 ? 'Start Course' : 'View Syllabus & Player'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
