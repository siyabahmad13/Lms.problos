import React, { useState } from 'react';
import { User } from '../../types';
import { Shield, UserCheck, Globe, ChevronDown, Sparkles } from 'lucide-react';

interface PortalHeaderProps {
  currentDomain: 'learner' | 'admin' | 'verify';
  onSwitchDomain: (domain: 'learner' | 'admin' | 'verify') => void;
  currentUser: User | null;
  onQuickSwitchUser: (email: string) => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentDomain,
  onSwitchDomain,
  currentUser,
  onQuickSwitchUser,
}) => {
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const domainLabels = {
    learner: 'lms.problos.com (Learner Portal)',
    admin: 'admin.lms.problos.com (Admin Console)',
    verify: 'verify.problos.com (Public Verification)',
  };

  if (collapsed) {
    return (
      <div className="bg-[#111827] text-white text-xs px-4 py-1.5 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-gray-300">Active Domain: <strong className="text-white">{domainLabels[currentDomain]}</strong></span>
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="text-gray-400 hover:text-white underline text-xs cursor-pointer"
        >
          Expand Domain Switcher
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] text-white border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Globe className="w-3.5 h-3.5 text-[#009166]" />
          <span>Simulated Edge Domain:</span>
        </div>
        <div className="inline-flex rounded-md p-0.5 bg-slate-900 border border-slate-700">
          <button
            onClick={() => onSwitchDomain('learner')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
              currentDomain === 'learner'
                ? 'bg-[#009166] text-white font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            lms.problos.com
          </button>
          <button
            onClick={() => onSwitchDomain('admin')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              currentDomain === 'admin'
                ? 'bg-[#009166] text-white font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            admin.lms.problos.com
          </button>
          <button
            onClick={() => onSwitchDomain('verify')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
              currentDomain === 'verify'
                ? 'bg-[#009166] text-white font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            verify.problos.com
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Demo Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 cursor-pointer transition"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Switch Test Persona</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showDemoAccounts && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Full-Access Administrators
              </div>
              <button
                onClick={() => {
                  onQuickSwitchUser('msiyab10492@gmail.com');
                  setShowDemoAccounts(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-gray-900">Siyab (Admin)</div>
                  <div className="text-[11px] text-gray-500">msiyab10492@gmail.com</div>
                </div>
                {currentUser?.email === 'msiyab10492@gmail.com' && <UserCheck className="w-3.5 h-3.5 text-[#009166]" />}
              </button>
              <button
                onClick={() => {
                  onQuickSwitchUser('rauf@problos.com');
                  setShowDemoAccounts(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-gray-900">Rauf (Admin)</div>
                  <div className="text-[11px] text-gray-500">rauf@problos.com</div>
                </div>
                {currentUser?.email === 'rauf@problos.com' && <UserCheck className="w-3.5 h-3.5 text-[#009166]" />}
              </button>

              <div className="px-3 py-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-y border-gray-100 mt-1">
                Interns / Learners
              </div>
              <button
                onClick={() => {
                  onQuickSwitchUser('alex.chen@problos.dev');
                  setShowDemoAccounts(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-gray-900">Alex Chen (Active)</div>
                  <div className="text-[11px] text-gray-500">Completed Week 1, Certified</div>
                </div>
                {currentUser?.email === 'alex.chen@problos.dev' && <UserCheck className="w-3.5 h-3.5 text-[#009166]" />}
              </button>
              <button
                onClick={() => {
                  onQuickSwitchUser('sarah.jenkins@problos.dev');
                  setShowDemoAccounts(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-gray-900">Sarah Jenkins (Revision Req.)</div>
                  <div className="text-[11px] text-gray-500">Next week locked due to review</div>
                </div>
                {currentUser?.email === 'sarah.jenkins@problos.dev' && <UserCheck className="w-3.5 h-3.5 text-[#009166]" />}
              </button>
              <button
                onClick={() => {
                  onQuickSwitchUser('david.okafor@problos.dev');
                  setShowDemoAccounts(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-gray-900">David Okafor (New Intern)</div>
                  <div className="text-[11px] text-gray-500">Requires Password Change on Login</div>
                </div>
                {currentUser?.email === 'david.okafor@problos.dev' && <UserCheck className="w-3.5 h-3.5 text-[#009166]" />}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(true)}
          className="text-slate-400 hover:text-white cursor-pointer"
          title="Minimize bar"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
