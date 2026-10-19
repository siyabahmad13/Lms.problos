import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Award,
  Bell,
  Settings,
  Users,
  Layers,
  FileCode2,
  ClipboardList,
  CheckCircle2,
  Megaphone,
  History,
  Sliders,
} from 'lucide-react';

export type LearnerTab =
  | 'dashboard'
  | 'my-learning'
  | 'submissions'
  | 'certificates'
  | 'notifications'
  | 'account';

export type AdminTab =
  | 'overview'
  | 'interns'
  | 'tracks-courses'
  | 'curriculum-builder'
  | 'tasks'
  | 'reviews'
  | 'certificates'
  | 'announcements'
  | 'activity-logs'
  | 'settings';

interface SidebarProps {
  role: 'learner' | 'admin';
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingReviewsCount?: number;
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onSelectTab,
  pendingReviewsCount = 0,
  unreadNotificationsCount = 0,
}) => {
  const learnerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-learning', label: 'My Learning', icon: BookOpen },
    { id: 'submissions', label: 'My Submissions', icon: FileCheck2 },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    { id: 'account', label: 'Account Settings', icon: Settings },
  ];

  const adminNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'interns', label: 'Interns & Access', icon: Users },
    { id: 'tracks-courses', label: 'Tracks & Courses', icon: Layers },
    { id: 'curriculum-builder', label: 'Curriculum Builder', icon: FileCode2 },
    { id: 'tasks', label: 'Tasks & Assignments', icon: ClipboardList },
    { id: 'reviews', label: 'Submission Reviews', icon: CheckCircle2, badge: pendingReviewsCount },
    { id: 'certificates', label: 'Certificates Desk', icon: Award },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'activity-logs', label: 'Activity Logs', icon: History },
    { id: 'settings', label: 'Admin Settings', icon: Sliders },
  ];

  const items = role === 'admin' ? adminNavItems : learnerNavItems;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6">
      <div className="space-y-1 px-3">
        <div className="px-3 pb-3 mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-100">
          {role === 'admin' ? 'Admin Navigation' : 'Learning Portal'}
        </div>

        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition cursor-pointer text-left ${
                isActive
                  ? 'bg-[#009166] text-white shadow-sm font-semibold'
                  : 'text-gray-700 hover:bg-emerald-50/60 hover:text-[#009166]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#009166]'}`} />
                <span className="text-[15px]">{item.label}</span>
              </div>

              {item.badge && item.badge > 0 ? (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-[#009166]' : 'bg-[#009166] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Footer Branding Info */}
      <div className="px-6 pt-4 border-t border-gray-100 text-xs text-gray-600">
        <div className="flex items-center gap-2 font-medium text-gray-700">
          <span className="w-2 h-2 rounded-full bg-[#009166]"></span>
          <span>Problos LMS v2.4</span>
        </div>
        <p className="mt-1 text-[11px] text-gray-600">Coursera-inspired Learning Engine</p>
      </div>
    </aside>
  );
};
