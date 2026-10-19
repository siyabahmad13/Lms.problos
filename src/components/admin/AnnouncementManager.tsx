import React, { useState } from 'react';
import { Announcement, LearningTrack, User } from '../../types';
import { storage } from '../../services/storage';
import { Megaphone, PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface AnnouncementManagerProps {
  currentAdmin: User;
  announcements: Announcement[];
  tracks: LearningTrack[];
  users: User[];
  onRefreshData: () => void;
}

export const AnnouncementManager: React.FC<AnnouncementManagerProps> = ({
  currentAdmin,
  announcements,
  tracks,
  users,
  onRefreshData,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'track' | 'learners'>('all');
  const [targetTrackId, setTargetTrackId] = useState(tracks[0]?.id || '');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  const interns = users.filter(u => u.role === 'learner');

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newAnn: Announcement = {
      id: 'ann_' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      authorName: currentAdmin.name,
      targetType,
      targetTrackId: targetType === 'track' ? targetTrackId : undefined,
      priority,
      createdAt: new Date().toISOString(),
    };

    storage.saveAnnouncement(newAnn);

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: 'Posted Announcement',
      details: `Published "${newAnn.title}" targeted to ${newAnn.targetType}.`,
      targetType: 'announcement',
      targetId: newAnn.id,
    });

    setShowCreateModal(false);
    setTitle('');
    setContent('');
    onRefreshData();
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    storage.deleteAnnouncement(id);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Announcements & Broadcasts</h1>
          <p className="text-sm text-gray-600 mt-1">
            Broadcast updates to all interns or target specific learning tracks and cohorts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#009166] hover:bg-[#007a56] text-white rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            No announcements broadcast yet.
          </div>
        ) : (
          announcements.map(ann => {
            const track = tracks.find(t => t.id === ann.targetTrackId);

            return (
              <div
                key={ann.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-gray-900 text-base">{ann.title}</span>
                    {ann.priority === 'urgent' ? (
                      <Badge variant="red" size="sm">Urgent</Badge>
                    ) : ann.priority === 'important' ? (
                      <Badge variant="amber" size="sm">Important</Badge>
                    ) : (
                      <Badge variant="blue" size="sm">Normal</Badge>
                    )}
                    <span className="text-xs text-gray-400">
                      Target: {ann.targetType === 'all' ? 'All Interns' : track?.title || 'Specific track'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{ann.content}</p>

                  <div className="text-[11px] text-gray-400">
                    Posted by <strong className="text-gray-700">{ann.authorName}</strong> on {new Date(ann.createdAt).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition cursor-pointer self-start"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Broadcast Announcement</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update: Live Mentorship Office Hours"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write message details..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Target Audience</label>
                  <select
                    value={targetType}
                    onChange={e => setTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="all">All Interns</option>
                    <option value="track">Specific Track</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {targetType === 'track' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Select Track</label>
                  <select
                    value={targetTrackId}
                    onChange={e => setTargetTrackId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  >
                    {tracks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              )}

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
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
