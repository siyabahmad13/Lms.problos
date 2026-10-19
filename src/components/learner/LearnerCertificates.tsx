import React, { useState } from 'react';
import { Certificate } from '../../types';
import { Award, CheckCircle2, Download, ExternalLink, ShieldCheck, Printer } from 'lucide-react';
import { Badge } from '../common/Badge';

interface LearnerCertificatesProps {
  certificates: Certificate[];
  onVerifyCertificate: (certId: string) => void;
}

export const LearnerCertificates: React.FC<LearnerCertificatesProps> = ({
  certificates,
  onVerifyCertificate,
}) => {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const activeCertificates = certificates.filter(c => !c.isRevoked);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Earned Certificates & Credentials</h1>
        <p className="text-sm text-gray-600 mt-1">
          Industry-recognized credentials awarded upon successful completion of Problos learning tracks and verified coursework.
        </p>
      </div>

      {activeCertificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#009166] flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Certificates Earned Yet</h3>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Certificates are issued by administrators once you finish all required course modules and your deliverables receive final approval.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeCertificates.map(cert => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#009166] bg-[#e6f5f0] px-2.5 py-1 rounded">
                    ID: {cert.id}
                  </span>
                  <Badge variant="green" size="sm">Verified Active</Badge>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mt-2">{cert.courseOrTrackTitle}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Issued to <strong className="text-gray-800">{cert.recipientName}</strong> on {new Date(cert.issueDate).toLocaleDateString()}
                </p>

                {cert.gradeOrMarks && (
                  <div className="mt-3 inline-block text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    {cert.gradeOrMarks}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-[#FAF9F6] border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="font-bold text-[#009166] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View Certificate</span>
                </button>

                <button
                  onClick={() => onVerifyCertificate(cert.id)}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verify Credential ↗</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-300 relative my-8">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg cursor-pointer"
            >
              ✕
            </button>

            {/* Coursera-style Credential Layout */}
            <div className="border-8 border-double border-[#009166]/30 p-8 sm:p-12 text-center rounded-xl bg-[#FAF9F6] shadow-inner space-y-6">
              <div className="flex justify-center items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#009166] text-white flex items-center justify-center font-extrabold text-xl shadow-sm">
                  P
                </div>
                <span className="font-extrabold text-xl tracking-tight text-gray-900">PROBLOS LMS</span>
              </div>

              <div className="text-xs uppercase font-extrabold tracking-widest text-emerald-800">
                Official Certificate of Accomplishment
              </div>

              <div className="py-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">This is proudly presented to</p>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mt-2">
                  {selectedCert.recipientName}
                </h2>
              </div>

              <div className="max-w-xl mx-auto">
                <p className="text-sm text-gray-600">
                  for successfully mastering all curriculum competencies, completing practical assignments, and satisfying the rigor of
                </p>
                <h3 className="text-xl font-bold text-gray-900 mt-2">
                  {selectedCert.courseOrTrackTitle}
                </h3>
              </div>

              {selectedCert.gradeOrMarks && (
                <div className="text-xs font-bold text-[#009166]">
                  {selectedCert.gradeOrMarks}
                </div>
              )}

              <div className="pt-8 border-t border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
                <div>
                  <div className="font-serif italic text-base text-gray-800 border-b border-gray-400 pb-1">
                    {selectedCert.issuerName}
                  </div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wider mt-1">
                    {selectedCert.issuerTitle}
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="text-xs font-mono font-bold text-gray-700">
                    ID: {selectedCert.id}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Issued on {new Date(selectedCert.issueDate).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center justify-center sm:justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#009166]" />
                    <span>Cryptographically Authenticated</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedCert(null);
                  onVerifyCertificate(selectedCert.id);
                }}
                className="text-xs font-semibold text-[#009166] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Public Verification Page</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
