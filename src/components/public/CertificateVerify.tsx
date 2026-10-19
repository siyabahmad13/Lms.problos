import React, { useState } from 'react';
import { Certificate } from '../../types';
import { storage } from '../../services/storage';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  User,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CertificateVerifyProps {
  initialCertId?: string;
  onBackToApp?: () => void;
}

export const CertificateVerify: React.FC<CertificateVerifyProps> = ({
  initialCertId = '',
  onBackToApp,
}) => {
  const [queryId, setQueryId] = useState(initialCertId);
  const [searchedId, setSearchedId] = useState<string | null>(initialCertId ? initialCertId : null);
  const [resultCert, setResultCert] = useState<Certificate | undefined>(() =>
    initialCertId ? storage.getCertificateById(initialCertId) : undefined
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = queryId.trim();
    if (!cleanId) return;

    setSearchedId(cleanId);
    const cert = storage.getCertificateById(cleanId);
    setResultCert(cert);
  };

  const handleQuickLookup = (sampleId: string) => {
    setQueryId(sampleId);
    setSearchedId(sampleId);
    setResultCert(storage.getCertificateById(sampleId));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#009166] text-white flex items-center justify-center font-bold text-base shadow-sm">
              P
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">
              PROBLOS<span className="text-[#009166]">.</span> <span className="text-xs font-semibold text-gray-500 uppercase">Verification Registry</span>
            </span>
          </div>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="text-xs font-bold text-[#009166] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Learning Portal</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="max-w-2xl mx-auto w-full px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#009166] flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Official Credential Verification
          </h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Verify the authenticity of completion certificates issued by Problos LMS for enterprise engineering tracks.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="bg-white p-3 rounded-2xl border border-gray-200 shadow-md flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              placeholder="Enter Certificate ID (e.g. PRB-2026-WD-0481)"
              value={queryId}
              onChange={e => setQueryId(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm font-mono uppercase bg-transparent focus:outline-none text-gray-900"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#009166] hover:bg-[#007a56] text-white font-bold text-sm rounded-xl transition cursor-pointer shadow-xs"
          >
            Verify
          </button>
        </form>

        {/* Quick Demo Lookup Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
          <span>Quick Verification Examples:</span>
          <button
            type="button"
            onClick={() => handleQuickLookup('PRB-2026-WD-0481')}
            className="text-xs font-mono font-bold text-[#009166] hover:underline bg-[#e6f5f0] px-2 py-0.5 rounded cursor-pointer"
          >
            PRB-2026-WD-0481 (Valid)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLookup('PRB-2025-ARCH-0012')}
            className="text-xs font-mono font-bold text-rose-700 hover:underline bg-rose-50 px-2 py-0.5 rounded cursor-pointer"
          >
            PRB-2025-ARCH-0012 (Revoked)
          </button>
        </div>

        {/* Verification Result Display */}
        {searchedId && (
          <div>
            {!resultCert ? (
              /* Case 1: NOT FOUND */
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Credential Not Found</h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  No certificate record was located in the official Problos registry matching ID{' '}
                  <strong className="font-mono text-gray-900">{searchedId}</strong>.
                  Please double-check the unique ID or contact the issuing administrator.
                </p>
                <div className="pt-2">
                  <Badge variant="gray">Status: Record Not Found</Badge>
                </div>
              </div>
            ) : resultCert.isRevoked ? (
              /* Case 2: REVOKED (NEVER presented as valid!) */
              <div className="bg-white rounded-2xl border-2 border-rose-300 p-8 shadow-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-rose-100">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-rose-700">Credential Has Been Revoked</h3>
                    <p className="text-xs text-gray-500 font-mono">ID: {resultCert.id}</p>
                  </div>
                </div>

                <div className="p-4 bg-rose-50 rounded-xl text-xs text-rose-900 space-y-2 border border-rose-200">
                  <div className="font-bold">Revocation Notice:</div>
                  <p className="leading-relaxed">
                    This credential was formally revoked on{' '}
                    <strong>{resultCert.revokedAt ? new Date(resultCert.revokedAt).toLocaleDateString() : 'N/A'}</strong>.
                    It is strictly invalid and no longer certified by Problos.
                  </p>
                  {resultCert.revocationReason && (
                    <div className="pt-1 text-rose-800 italic">
                      Reason: &quot;{resultCert.revocationReason}&quot;
                    </div>
                  )}
                </div>

                <div className="pt-2 text-xs text-gray-500 border-t border-gray-100 space-y-1">
                  <div>Originally issued to: <strong className="text-gray-800">{resultCert.recipientName}</strong></div>
                  <div>Course / Track: <strong className="text-gray-800">{resultCert.courseOrTrackTitle}</strong></div>
                </div>
              </div>
            ) : (
              /* Case 3: VALID */
              <div className="bg-white rounded-2xl border-2 border-[#009166] p-8 shadow-md space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#009166] flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">Valid Problos Credential</h3>
                      <p className="text-xs font-mono font-bold text-[#009166]">Verified ID: {resultCert.id}</p>
                    </div>
                  </div>

                  <Badge variant="green" size="md">Authentic & Active</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-100">
                    <span className="text-gray-500 block mb-1">Recipient Name</span>
                    <span className="font-bold text-gray-900 text-sm">{resultCert.recipientName}</span>
                  </div>

                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-100">
                    <span className="text-gray-500 block mb-1">Issue Date</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {new Date(resultCert.issueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="sm:col-span-2 p-3 bg-[#FAF9F6] rounded-xl border border-gray-100">
                    <span className="text-gray-500 block mb-1">Subject Mastery</span>
                    <span className="font-bold text-gray-900 text-base">{resultCert.courseOrTrackTitle}</span>
                    {resultCert.gradeOrMarks && (
                      <span className="block text-xs font-semibold text-[#009166] mt-1">
                        {resultCert.gradeOrMarks}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-100">
                    <span className="text-gray-500 block mb-1">Issuing Authority</span>
                    <span className="font-bold text-gray-900">{resultCert.issuerName}</span>
                    <span className="block text-[11px] text-gray-500">{resultCert.issuerTitle}</span>
                  </div>

                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 block mb-0.5">Registry Status</span>
                      <span className="font-bold text-emerald-700">Cryptographically Recorded</span>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-[#009166]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Problos LMS. All certificate credentials cryptographically verifiable.</p>
      </footer>
    </div>
  );
};
