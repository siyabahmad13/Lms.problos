import React from 'react';
import { Announcement } from '../../types';
import { Bell, Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface LearnerNotificationsProps {
  announcements: Announcement[];
  currentUserId: string;
  assignedTrackIds: string[];
}

export const LearnerNotifications: React.FC<LearnerNotificationsProps> = ({
  announcements,
  currentUserId,
  assignedTrackIds,
}) => {
  const filtered = announcements.filter(a => {
    if (a.targetType === 'all') return true;
    if (a.targetType === 'track' && a.targetTrackId && assignedTrackIds.includes(a.targetTrackId)) return true;
    if (a.targetType === 'learners' && a.targetLearnerIds?.includes(currentUserId)) return true;
    return false;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Notifications & Announcements</h1>
        <p className="text-sm text-gray-600 mt-1">
          Stay informed on cohort milestones, assignment feedback, and platform announcements.
        </p>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
            No notifications at this time.
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-5 shadow-xs space-y-2 transition ${
                item.priority === 'urgent'
                  ? 'border-rose-200 bg-rose-50/20'
                  : item.priority === 'important'
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-base">{item.title}</span>
                  {item.priority === 'urgent' ? (
                    <Badge variant="red" size="sm">Urgent</Badge>
                  ) : item.priority === 'important' ? (
                    <Badge variant="amber" size="sm">Important</Badge>
                  ) : (
                    <Badge variant="blue" size="sm">Announcement</Badge>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.content}</p>

              <div className="text-xs text-gray-400 pt-1">
                Posted by <strong className="text-gray-700">{item.authorName}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
