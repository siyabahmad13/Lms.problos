import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { CLOUDFLARE_D1_SCHEMA_SQL, CLOUDFLARE_CONFIG } from '../../services/cloudflare-d1';
import {
  Sliders,
  Database,
  Cloud,
  Download,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface AdminSettingsProps {
  onRefreshData: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onRefreshData }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(CLOUDFLARE_D1_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadBackup = () => {
    const json = storage.exportJsonBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `problos-lms-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDb = () => {
    if (confirm('Warning: This will reset all records back to the default Problos LMS seed data (tracks, courses, seeded interns, and sample submissions). Proceed?')) {
      storage.resetDatabase();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">System & Infrastructure Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Cloudflare D1 edge database architecture, persistence exports, and environment specifications.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-[#009166]/30 text-[#009166] text-xs font-bold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Database successfully re-seeded to default demonstration state.</span>
        </div>
      )}

      {/* Cloudflare D1 Deployment Architecture */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#009166]">
                Target Cloudflare Infrastructure
              </span>
              <Badge variant="amber" size="sm">Local Persistence Active • D1 Ready</Badge>
            </div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-amber-500" />
              <span>Cloudflare Pages + Workers + D1 Database</span>
            </h2>
          </div>

          <div className="text-xs text-gray-500">
            Runtime Binding: <strong className="font-mono text-gray-800">env.DB</strong>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Problos LMS is engineered to run seamlessly across Cloudflare Pages (frontend SPA) and Cloudflare Workers (edge compute) with SQLite-backed Cloudflare D1. While running inside this sandbox preview, the system stores data in a persistent relational storage engine with full D1 schema compatibility.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-400 font-medium block mb-1">D1 Database ID</span>
            <span className="font-mono font-bold text-gray-900">{CLOUDFLARE_CONFIG.d1DatabaseName}</span>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-400 font-medium block mb-1">Workers API Route</span>
            <span className="font-mono font-bold text-gray-900">{CLOUDFLARE_CONFIG.workersRoute}</span>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-400 font-medium block mb-1">Edge Connection</span>
            <span className="font-semibold text-amber-700">D1 Ready for CLI Binding</span>
          </div>
        </div>

        {/* Schema SQL viewer */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#009166]" />
              <span>Cloudflare D1 SQL Schema (schema.sql)</span>
            </span>

            <button
              onClick={handleCopySql}
              className="text-xs font-semibold text-gray-700 hover:text-[#009166] flex items-center gap-1 cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied SQL' : 'Copy D1 SQL'}</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto max-h-48 border border-slate-800">
            <pre className="text-emerald-300 font-mono text-[11px] leading-relaxed">
              <code>{CLOUDFLARE_D1_SCHEMA_SQL}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Database Backup & Reset */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-5">
        <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3">
          Persistence Operations & Backup
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-gray-900 text-sm">Export Complete Database (JSON)</div>
            <p className="text-xs text-gray-500 mt-0.5">
              Download a complete JSON snapshot containing all tracks, courses, submissions, certificates, and audit logs.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full sm:w-auto px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup</span>
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-rose-700 text-sm">Reset to Default Seed Database</div>
            <p className="text-xs text-gray-500 mt-0.5">
              Re-initializes all courses, initial users (Siyab, Rauf, interns), and sample review submissions.
            </p>
          </div>

          <button
            onClick={handleResetDb}
            className="w-full sm:w-auto px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>
    </div>
  );
};
