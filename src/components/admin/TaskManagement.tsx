import React, { useState } from 'react';
import { Task, Course, User, LearningTrack } from '../../types';
import { storage } from '../../services/storage';
import { ClipboardList, PlusCircle, Calendar, Clock, AlertTriangle, FileEdit } from 'lucide-react';
import { Badge } from '../common/Badge';

interface TaskManagementProps {
  currentAdmin: User;
  tasks: Task[];
  courses: Course[];
  tracks: LearningTrack[];
  users: User[];
  onRefreshData: () => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({
  currentAdmin,
  tasks,
  courses,
  tracks,
  users,
  onRefreshData,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedWeekId, setSelectedWeekId] = useState(courses[0]?.weeks[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [hasDeadline, setHasDeadline] = useState(true);
  const [deadlineDate, setDeadlineDate] = useState('2026-11-30');
  const [maxMarks, setMaxMarks] = useState(100);
  const [allowLate, setAllowLate] = useState(true);

  const interns = users.filter(u => u.role === 'learner');

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedCourseId || !selectedWeekId) return;

    const newTask: Task = {
      id: editingTask?.id || 'tsk_' + Date.now(),
      courseId: selectedCourseId,
      weekId: selectedWeekId,
      title: title.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      deadline: hasDeadline && deadlineDate ? `${deadlineDate}T23:59:59Z` : undefined,
      maxMarks,
      allowLateSubmission: allowLate,
      createdAt: editingTask?.createdAt || new Date().toISOString(),
    };

    storage.saveTask(newTask);

    // Also link task to the week if not linked
    const course = courses.find(c => c.id === selectedCourseId);
    if (course) {
      const updatedWeeks = course.weeks.map(w => {
        if (w.id === selectedWeekId) {
          return { ...w, taskId: newTask.id };
        }
        return w;
      });
      storage.saveCourse({ ...course, weeks: updatedWeeks });
    }

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: editingTask ? 'Updated Task' : 'Created Assignment Task',
      details: `${editingTask ? 'Updated' : 'Created'} task "${newTask.title}" for ${course?.title || 'course'}.`,
      targetType: 'task',
      targetId: newTask.id,
    });

    setShowCreateModal(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setInstructions('');
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tasks & Deliverables Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure practical assignments, optional deadline rules, late submission policies, and max scores.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setTitle('');
            setDescription('');
            setInstructions('### Requirements\n1. GitHub repository\n2. Live URL');
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 bg-[#009166] hover:bg-[#007a56] text-white rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9F6] border-b border-gray-200 text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-4">Task Deliverable</th>
                <th className="px-6 py-4">Assigned Course</th>
                <th className="px-6 py-4">Max Score</th>
                <th className="px-6 py-4">Deadline Policy</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No tasks created yet.
                  </td>
                </tr>
              ) : (
                tasks.map(task => {
                  const course = courses.find(c => c.id === task.courseId);
                  const week = course?.weeks.find(w => w.id === task.weekId);

                  return (
                    <tr key={task.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{task.description}</div>
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                        <div>{course?.title || 'Unknown Course'}</div>
                        <div className="text-[11px] text-[#009166]">Week {week?.weekNumber || 1}</div>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono font-bold text-gray-900">
                        {task.maxMarks} pts
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {task.deadline ? (
                          <div>
                            <span className="font-semibold text-gray-800">
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                            <span className="block text-[11px] text-gray-500">
                              {task.allowLateSubmission ? 'Late allowed' : 'Strict cutoff'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-medium">Unrestricted (No Deadline)</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setSelectedCourseId(task.courseId);
                            setSelectedWeekId(task.weekId);
                            setTitle(task.title);
                            setDescription(task.description);
                            setInstructions(task.instructions);
                            setHasDeadline(!!task.deadline);
                            if (task.deadline) {
                              setDeadlineDate(task.deadline.split('T')[0]);
                            }
                            setMaxMarks(task.maxMarks);
                            setAllowLate(!!task.allowLateSubmission);
                            setShowCreateModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-[#009166] rounded cursor-pointer"
                          title="Edit Task"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit Task */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">
                {editingTask ? 'Edit Task Specifications' : 'Create Assignment Task'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Target Course *</label>
                <select
                  value={selectedCourseId}
                  onChange={e => {
                    setSelectedCourseId(e.target.value);
                    const c = courses.find(crs => crs.id === e.target.value);
                    if (c && c.weeks.length > 0) {
                      setSelectedWeekId(c.weeks[0].id);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Target Week / Module *</label>
                <select
                  value={selectedWeekId}
                  onChange={e => setSelectedWeekId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  {selectedCourse?.weeks.map(w => (
                    <option key={w.id} value={w.id}>
                      Week {w.weekNumber}: {w.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asynchronous Fetcher Client with Debounce"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Short Summary</label>
                <textarea
                  rows={2}
                  placeholder="Overview of expectations..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Detailed Instructions & Rubric
                </label>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Max Score</label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={maxMarks}
                    onChange={e => setMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Deadline Date</label>
                  <input
                    type="date"
                    disabled={!hasDeadline}
                    value={deadlineDate}
                    onChange={e => setDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDeadline}
                    onChange={e => setHasDeadline(e.target.checked)}
                    className="rounded text-[#009166]"
                  />
                  <span>Enforce deadline for this task</span>
                </label>

                {hasDeadline && (
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pl-5">
                    <input
                      type="checkbox"
                      checked={allowLate}
                      onChange={e => setAllowLate(e.target.checked)}
                      className="rounded text-[#009166]"
                    />
                    <span>Allow late submissions after deadline</span>
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
