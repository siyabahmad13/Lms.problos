import React, { useState } from 'react';
import { User } from '../../types';
import { auth } from '../../services/auth';
import { KeyRound, Shield, CheckCircle2, AlertCircle, Clock, UserCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

interface AccountSettingsProps {
  currentUser: User;
  onRefreshUser: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  currentUser,
  onRefreshUser,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setUpdating(true);
    const res = auth.changePassword(currentUser.id, newPassword);
    setUpdating(false);

    if (res.success) {
      setSuccessMsg('Your password has been securely updated!');
      setNewPassword('');
      setConfirmPassword('');
      onRefreshUser();
    } else {
      setErrorMsg(res.error || 'Failed to update password.');
    }
  };

  const isExpired = auth.isAccessExpired(currentUser);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Account & Security Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your personal profile, credentials, and view your cohort enrollment terms.
        </p>
      </div>

      {currentUser.mustChangePassword && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Security Notice: </span>
            <span>
              You are currently using a temporary initial password. Please choose a new, private password below before continuing.
            </span>
          </div>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <UserCheck className="w-5 h-5 text-[#009166]" />
          <span>Learner Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
            <div className="font-semibold text-gray-900 bg-gray-50 px-3.5 py-2.5 rounded-lg border border-gray-200">
              {currentUser.name}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Registered Email</label>
            <div className="font-semibold text-gray-900 bg-gray-50 px-3.5 py-2.5 rounded-lg border border-gray-200 truncate">
              {currentUser.email}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Account Status</label>
            <div className="pt-1">
              <Badge variant={currentUser.accountActive ? 'green' : 'red'}>
                {currentUser.accountActive ? 'Active Account' : 'Deactivated'}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Course Access Duration</label>
            <div className="pt-1 text-xs">
              {currentUser.accessExpiresAt ? (
                <span className={isExpired ? 'text-rose-600 font-bold' : 'text-gray-700 font-medium'}>
                  {isExpired ? 'Expired on: ' : 'Valid until: '}
                  {new Date(currentUser.accessExpiresAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-[#009166] font-semibold">Unlimited Cohort Access</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <KeyRound className="w-5 h-5 text-[#009166]" />
          <span>Update Account Password</span>
        </h3>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-[#009166]/30 rounded-lg text-[#009166] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Retype password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="px-6 py-2.5 bg-[#009166] hover:bg-[#007a56] text-white font-bold rounded-lg text-sm transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {updating ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
