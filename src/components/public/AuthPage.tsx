import React, { useState } from 'react';
import { User } from '../../types';
import { auth, DEFAULT_PASSWORDS } from '../../services/auth';
import { BookOpen, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  portalContext: 'learner' | 'admin';
  onLoginSuccess: (user: User) => void;
  onSwitchPortal?: (portal: 'learner' | 'admin') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  portalContext,
  onLoginSuccess,
  onSwitchPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mandatory First-Login Password Change Modal
  const [pendingChangeUser, setPendingChangeUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = auth.login(email, password);
    setLoading(false);

    if (!res.success || !res.user) {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      return;
    }

    // Role check: If attempting to login via admin portal but user is a learner
    if (portalContext === 'admin' && res.user.role !== 'admin') {
      auth.logout();
      setErrorMsg('Access denied. Administrator privileges required for admin.lms.problos.com.');
      return;
    }

    // Check mandatory password change
    if (res.requirePasswordChange) {
      setPendingChangeUser(res.user);
      return;
    }

    onLoginSuccess(res.user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // Public users can only register as learners!
    const res = auth.registerLearner(registerName, email, password);
    setLoading(false);

    if (!res.success || !res.user) {
      setErrorMsg(res.error || 'Registration failed.');
      return;
    }

    onLoginSuccess(res.user);
  };

  // Submit Password Change on First Login
  const handleCompletePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);

    if (newPassword.length < 6) {
      setPasswordChangeError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('Passwords do not match.');
      return;
    }

    if (!pendingChangeUser) return;

    const res = auth.changePassword(pendingChangeUser.id, newPassword);
    if (res.success) {
      const updatedUser = auth.getCurrentUser() || pendingChangeUser;
      setPendingChangeUser(null);
      onLoginSuccess(updatedUser);
    } else {
      setPasswordChangeError(res.error || 'Failed to update password.');
    }
  };

  // Quick Demo Login Shortcut
  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    const pass = DEFAULT_PASSWORDS[demoEmail] || 'Intern@12345';
    setPassword(pass);
    const res = auth.login(demoEmail, pass);
    if (res.success && res.user) {
      if (res.requirePasswordChange) {
        setPendingChangeUser(res.user);
        return;
      }
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-[#009166] text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-sm mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          PROBLOS<span className="text-[#009166]">.</span> LMS
        </h2>
        <p className="mt-1 text-sm text-gray-600 font-medium">
          {portalContext === 'admin'
            ? 'Administrator Security Console (admin.lms.problos.com)'
            : 'Learner Portal (lms.problos.com)'}
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          {/* Tab Switcher (Only in learner portal; admin portal does not allow public registration) */}
          {portalContext === 'learner' && (
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg cursor-pointer transition ${
                  activeTab === 'login' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg cursor-pointer transition ${
                  activeTab === 'register' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Register as Learner
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@problos.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#009166] hover:bg-[#007a56] text-white font-bold rounded-lg text-sm transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Zhang"
                    value={registerName}
                    onChange={e => setRegisterName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009166]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#009166] hover:bg-[#007a56] text-white font-bold rounded-lg text-sm transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Register as Learner'}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-4 border-t border-gray-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Instant Demo Credentials:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('msiyab10492@gmail.com')}
                className="p-2 text-left bg-gray-50 hover:bg-emerald-50/60 rounded-lg border border-gray-200 transition cursor-pointer"
              >
                <span className="font-bold text-gray-900 block truncate">Siyab (Admin)</span>
                <span className="text-[10px] text-gray-500 font-mono">msiyab10492@...</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('rauf@problos.com')}
                className="p-2 text-left bg-gray-50 hover:bg-emerald-50/60 rounded-lg border border-gray-200 transition cursor-pointer"
              >
                <span className="font-bold text-gray-900 block truncate">Rauf (Admin)</span>
                <span className="text-[10px] text-gray-500 font-mono">rauf@problos.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('alex.chen@problos.dev')}
                className="p-2 text-left bg-gray-50 hover:bg-emerald-50/60 rounded-lg border border-gray-200 transition cursor-pointer"
              >
                <span className="font-bold text-gray-900 block truncate">Alex Chen (Intern)</span>
                <span className="text-[10px] text-gray-500 font-mono">Certified, Week 1 Done</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('david.okafor@problos.dev')}
                className="p-2 text-left bg-gray-50 hover:bg-amber-50 rounded-lg border border-amber-200 transition cursor-pointer"
              >
                <span className="font-bold text-amber-900 block truncate">David Okafor (New)</span>
                <span className="text-[10px] text-amber-700 font-mono">Tests Password Change</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Password Change Modal */}
      {pendingChangeUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">Mandatory Password Change</h3>
                <p className="text-xs text-gray-500">First-login security requirement</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Hello <strong>{pendingChangeUser.name}</strong>. Because this account was provisioned with a temporary administrative password, you must create a new private password before entering the LMS.
            </p>

            {passwordChangeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {passwordChangeError}
              </div>
            )}

            <form onSubmit={handleCompletePasswordChange} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  New Private Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009166]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009166]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#009166] hover:bg-[#007a56] text-white font-bold rounded-lg text-sm shadow-xs transition cursor-pointer"
                >
                  Save New Password & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
