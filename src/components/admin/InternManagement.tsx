import React, { useState } from 'react';
import { User, LearningTrack, Course, LearnerProgress, UnlockOverride } from '../../types';
import { storage } from '../../services/storage';
import { auth } from '../../services/auth';
import {
  Users,
  UserPlus,
  KeyRound,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Unlock,
  AlertTriangle,
  Lock,
  Edit3,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface InternManagementProps {
  currentAdmin: User;
  users: User[];
  tracks: LearningTrack[];
  courses: Course[];
  allProgress: LearnerProgress[];
  overrides: UnlockOverride[];
  onRefreshData: () => void;
}

export const InternManagement: React.FC<InternManagementProps> = ({
  currentAdmin,
  users,
  tracks,
  courses,
  allProgress,
  overrides,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [enrollmentEditUser, setEnrollmentEditUser] = useState<User | null>(null);
  const [overrideModalUser, setOverrideModalUser] = useState<User | null>(null);

  // Form states for Create Intern
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('Intern@12345');
  const [selectedTracks, setSelectedTracks] = useState<string[]>(['trk_web_dev']);
  const [accessDurationDays, setAccessDurationDays] = useState<number>(180); // 6 months

  // Password Reset state
  const [temporaryPassword, setTemporaryPassword] = useState('TempPass2026!');
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);

  // Override Week state
  const [selectedCourseForOverride, setSelectedCourseForOverride] = useState<string>('');
  const [selectedWeekForOverride, setSelectedWeekForOverride] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('Special permission granted by administrator.');

  const interns = users.filter(u => u.role === 'learner');

  const filteredInterns = interns.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'active') return u.accountActive;
    if (filterStatus === 'inactive') return !u.accountActive;
    return true;
  });

  // Handle Create Intern
  const handleCreateIntern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    if (storage.getUserByEmail(email)) {
      alert('A user with this email address already exists.');
      return;
    }

    let accessExpiresAt: string | undefined = undefined;
    if (accessDurationDays > 0) {
      const exp = new Date();
      exp.setDate(exp.getDate() + accessDurationDays);
      accessExpiresAt = exp.toISOString();
    }

    // Auto-enroll courses from assigned tracks
    const courseIdsToEnroll: string[] = [];
    selectedTracks.forEach(tId => {
      const trk = tracks.find(t => t.id === tId);
      if (trk) {
        courseIdsToEnroll.push(...trk.courseIds);
      }
    });

    const newIntern: User = {
      id: 'usr_intern_' + Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'learner',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=009166`,
      createdAt: new Date().toISOString(),
      accountActive: true,
      mustChangePassword: true, // Required on first login!
      temporaryPasswordActive: true,
      assignedTrackIds: selectedTracks,
      enrolledCourseIds: Array.from(new Set(courseIdsToEnroll)),
      accessExpiresAt,
    };

    storage.saveUser(newIntern);

    // Save initial password in auth service
    const passwords = JSON.parse(localStorage.getItem('problos_user_passwords') || '{}');
    passwords[newIntern.email] = initialPassword;
    localStorage.setItem('problos_user_passwords', JSON.stringify(passwords));

    // Audit log
    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: 'Created Intern Account',
      details: `Provisioned account for ${newIntern.name} (${newIntern.email}). Assigned ${selectedTracks.length} tracks. First-login password change enforced.`,
      targetType: 'intern',
      targetId: newIntern.id,
    });

    setShowCreateModal(false);
    setName('');
    setEmail('');
    onRefreshData();
  };

  // Toggle Account Active / Inactive
  const handleToggleStatus = (targetUser: User) => {
    const updated = { ...targetUser, accountActive: !targetUser.accountActive };
    storage.saveUser(updated);

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: updated.accountActive ? 'Reactivated Intern' : 'Deactivated Intern',
      details: `Set account status of ${targetUser.name} to ${updated.accountActive ? 'Active' : 'Deactivated'}.`,
      targetType: 'intern',
      targetId: targetUser.id,
    });

    onRefreshData();
  };

  // Set Temporary Password for Forgot-Password recovery
  const handleSetTemporaryPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser) return;

    auth.adminSetTemporaryPassword(currentAdmin.id, passwordResetUser.id, temporaryPassword);
    setResetSuccessNotice(`Temporary password set to "${temporaryPassword}". User must change password at next login.`);
    setTimeout(() => {
      setResetSuccessNotice(null);
      setPasswordResetUser(null);
    }, 4000);
    onRefreshData();
  };

  // Handle Granting Module Unlock Override
  const handleGrantUnlockOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalUser || !selectedCourseForOverride || !selectedWeekForOverride) return;

    const newOverride: UnlockOverride = {
      id: 'ovr_' + Date.now(),
      learnerId: overrideModalUser.id,
      courseId: selectedCourseForOverride,
      weekId: selectedWeekForOverride,
      grantedBy: currentAdmin.name,
      grantedAt: new Date().toISOString(),
      reason: overrideReason,
    };

    storage.saveOverride(newOverride);

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: 'Granted Module Unlock Override',
      details: `Overrode task gating for ${overrideModalUser.name} on course ${selectedCourseForOverride}, week ${selectedWeekForOverride}. Reason: ${overrideReason}`,
      targetType: 'intern',
      targetId: overrideModalUser.id,
    });

    setOverrideModalUser(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Intern Directory & Access Control</h1>
          <p className="text-sm text-gray-600 mt-1">
            Provision accounts, assign tracks/courses, manage duration terms, set temporary recovery passwords, and authorize unlock overrides.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#009166] hover:bg-[#007a56] text-white rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Intern Account</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search interns by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500">Status:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009166] cursor-pointer"
          >
            <option value="all">All Accounts ({interns.length})</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Interns Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9F6] border-b border-gray-200 text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-4">Intern</th>
                <th className="px-6 py-4">Assigned Tracks</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Access Term</th>
                <th className="px-6 py-4">Security Flag</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInterns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No interns found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInterns.map(intern => {
                  const assignedTrackNames = tracks
                    .filter(t => intern.assignedTrackIds.includes(t.id))
                    .map(t => t.title);

                  const isExpired = intern.accessExpiresAt
                    ? new Date(intern.accessExpiresAt).getTime() < Date.now()
                    : false;

                  return (
                    <tr key={intern.id} className="hover:bg-gray-50/60 transition">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {intern.avatar ? (
                            <img
                              src={intern.avatar}
                              alt={intern.name}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#009166] flex items-center justify-center font-bold text-xs">
                              {intern.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900">{intern.name}</div>
                            <div className="text-xs text-gray-500">{intern.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Tracks */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {assignedTrackNames.length === 0 ? (
                            <span className="text-xs text-gray-400">None</span>
                          ) : (
                            assignedTrackNames.map((name, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium bg-emerald-50 text-[#009166] px-2 py-0.5 rounded"
                              >
                                {name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge variant={intern.accountActive ? 'green' : 'red'}>
                          {intern.accountActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>

                      {/* Term Expiration */}
                      <td className="px-6 py-4 text-xs">
                        {intern.accessExpiresAt ? (
                          <div className={isExpired ? 'text-rose-600 font-bold' : 'text-gray-700'}>
                            {new Date(intern.accessExpiresAt).toLocaleDateString()}
                            {isExpired && <span className="block text-[10px] text-rose-500">(Term Expired)</span>}
                          </div>
                        ) : (
                          <span className="text-gray-500 font-medium">Unlimited</span>
                        )}
                      </td>

                      {/* Security Flags */}
                      <td className="px-6 py-4 text-xs">
                        {intern.mustChangePassword ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                            <KeyRound className="w-3 h-3" />
                            Must Change Pass
                          </span>
                        ) : (
                          <span className="text-gray-400">Normal</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Unlock Override */}
                          <button
                            onClick={() => {
                              setOverrideModalUser(intern);
                              setSelectedCourseForOverride(intern.enrolledCourseIds[0] || '');
                            }}
                            className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer"
                            title="Grant Module Unlock Override"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setPasswordResetUser(intern);
                              setTemporaryPassword('TempPass2026!');
                            }}
                            className="p-1.5 text-gray-600 hover:text-[#009166] hover:bg-emerald-50 rounded transition cursor-pointer"
                            title="Set Temporary Recovery Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Toggle Active/Deactivated */}
                          <button
                            onClick={() => handleToggleStatus(intern)}
                            className={`p-1.5 rounded transition cursor-pointer ${
                              intern.accountActive
                                ? 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-gray-600 hover:text-[#009166] hover:bg-emerald-50'
                            }`}
                            title={intern.accountActive ? 'Deactivate Account' : 'Reactivate Account'}
                          >
                            {intern.accountActive ? (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-[#009166]" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Intern */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#009166]" />
                <span>Create Intern Account</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateIntern} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Patel"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maya.patel@problos.dev"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Initial Temporary Password *
                </label>
                <input
                  type="text"
                  required
                  value={initialPassword}
                  onChange={e => setInitialPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#009166]"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Intern will be required to create a new password on their first login.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Assign Learning Track(s)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-2.5">
                  {tracks.map(t => (
                    <label key={t.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTracks.includes(t.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedTracks([...selectedTracks, t.id]);
                          } else {
                            setSelectedTracks(selectedTracks.filter(id => id !== t.id));
                          }
                        }}
                        className="rounded text-[#009166] focus:ring-[#009166]"
                      />
                      <span>{t.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Access Duration
                </label>
                <select
                  value={accessDurationDays}
                  onChange={e => setAccessDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                >
                  <option value={90}>3 Months (90 Days)</option>
                  <option value={180}>6 Months (180 Days)</option>
                  <option value={365}>1 Year (365 Days)</option>
                  <option value={0}>Unlimited Access</option>
                </select>
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
                  Create & Provision Intern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Set Temporary Password */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>Issue Temporary Password</span>
              </h3>
              <button onClick={() => setPasswordResetUser(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <p className="text-xs text-gray-600">
              Set a temporary password for <strong>{passwordResetUser.name}</strong> ({passwordResetUser.email}).
              This immediately flags the account to enforce a mandatory password change on their next login.
            </p>

            {resetSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-[#009166]/30 text-[#009166] text-xs font-semibold rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{resetSuccessNotice}</span>
              </div>
            )}

            <form onSubmit={handleSetTemporaryPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  New Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={temporaryPassword}
                  onChange={e => setTemporaryPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#009166]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Set & Flag Password Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Grant Unlock Override */}
      {overrideModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-amber-600" />
                <span>Grant Module Unlock Override</span>
              </h3>
              <button onClick={() => setOverrideModalUser(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <p className="text-xs text-gray-600">
              Admins can override task approval gating for an individual learner. This unlocks the chosen week even if previous assignments are not yet approved.
            </p>

            <form onSubmit={handleGrantUnlockOverride} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Intern</label>
                <div className="font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-xs">
                  {overrideModalUser.name} ({overrideModalUser.email})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Select Course</label>
                <select
                  value={selectedCourseForOverride}
                  onChange={e => {
                    setSelectedCourseForOverride(e.target.value);
                    const c = courses.find(crs => crs.id === e.target.value);
                    if (c && c.weeks.length > 0) {
                      setSelectedWeekForOverride(c.weeks[0].id);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="">Select a course</option>
                  {courses
                    .filter(c => overrideModalUser.enrolledCourseIds.includes(c.id))
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                </select>
              </div>

              {selectedCourseForOverride && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Select Week to Unlock</label>
                  <select
                    value={selectedWeekForOverride}
                    onChange={e => setSelectedWeekForOverride(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="">Select a week</option>
                    {courses
                      .find(c => c.id === selectedCourseForOverride)
                      ?.weeks.map(w => (
                        <option key={w.id} value={w.id}>
                          Week {w.weekNumber}: {w.title}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Reason for Override</label>
                <input
                  type="text"
                  required
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setOverrideModalUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedCourseForOverride || !selectedWeekForOverride}
                  className="px-5 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Authorize Unlock Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
