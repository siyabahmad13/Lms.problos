import React, { useState } from 'react';
import { User } from '../../types';
import { Bell, LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import { Badge } from './Badge';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToAccount?: () => void;
  unreadCount?: number;
  portalTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onNavigateToNotifications,
  onNavigateToAccount,
  unreadCount = 0,
  portalTitle,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#009166] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                PROBLOS<span className="text-[#009166]">.</span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                LMS
              </span>
            </div>
            {portalTitle && (
              <p className="text-[11px] text-gray-500 font-medium leading-none mt-0.5">{portalTitle}</p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        {currentUser && (
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              onClick={onNavigateToNotifications}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#009166] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#009166] flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-gray-900 leading-tight">{currentUser.name}</div>
                  <div className="text-[11px] text-gray-500 capitalize">{currentUser.role}</div>
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-40 text-sm">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    <div className="mt-1.5">
                      <Badge variant={currentUser.role === 'admin' ? 'purple' : 'green'} size="sm">
                        {currentUser.role === 'admin' ? 'Administrator' : 'Learner Intern'}
                      </Badge>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigateToAccount?.();
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span>Account Settings</span>
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
