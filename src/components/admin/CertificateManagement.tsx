import React, { useState } from 'react';
import { Certificate, User, Course, LearningTrack } from '../../types';
import { storage } from '../../services/storage';
import {
  Award,
  PlusCircle,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  ShieldX,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CertificateManagementProps {
  currentAdmin: User;
  certificates: Certificate[];
  users: User[];
  courses: Course[];
  tracks: LearningTrack[];
  onRefreshData: () => void;
  onVerifyCertificate: (certId: string) => void;
}

export const CertificateManagement: React.FC<CertificateManagementProps> = ({
  currentAdmin,
  certificates,
  users,
  courses,
  tracks,
  onRefreshData,
  onVerifyCertificate,
}) => {
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);

  // Form state
  const interns = users.filter(u => u.role === 'learner');
  const [selectedLearnerId, setSelectedLearnerId] = useState(interns[0]?.id || '');
  const [targetType, setTargetType] = useState<'course' | 'track'>('course');
  const [selectedTargetTitle, setSelectedTargetTitle] = useState(courses[0]?.title || '');
  const [customCertId, setCustomCertId] = useState(`PRB-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  const [issuerName, setIssuerName] = useState(currentAdmin.name);
  const [issuerTitle, setIssuerTitle] = useState('Director of Curriculum & Engineering');
  const [gradeMarks, setGradeMarks] = useState('Grade: A (Honors)');
  const [fileUrl, setFileUrl] = useState('https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=800&auto=format&fit=crop&q=80');

  // Revoke modal state
  const [revocationReason, setRevocationReason] = useState('');

  // Handle Issue Certificate
  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = users.find(u => u.id === selectedLearnerId);
    if (!recipient || !selectedTargetTitle.trim()) return;

    const newCert: Certificate = {
      id: customCertId.trim().toUpperCase(),
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      courseOrTrackTitle: selectedTargetTitle,
      type: targetType,
      issueDate: new Date().toISOString().split('T')[0],
      issuerName,
      issuerTitle,
      gradeOrMarks: gradeMarks,
      certificateFileUrl: fileUrl.trim() || undefined,
      isRevoked: false,
    };

    storage.saveCertificate(newCert);

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: 'Issued Certificate',
      details: `Awarded credential ${newCert.id} to ${recipient.name} for ${newCert.courseOrTrackTitle}.`,
      targetType: 'certificate',
      targetId: newCert.id,
    });

    setShowIssueModal(false);
    setCustomCertId(`PRB-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    onRefreshData();
  };

  // Handle Revoke Certificate
  const handleRevokeCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingCert || !revocationReason.trim()) return;

    const updated: Certificate = {
      ...revokingCert,
      isRevoked: true,
      revokedAt: new Date().toISOString(),
      revocationReason: revocationReason.trim(),
    };

    storage.saveCertificate(updated);

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: 'Revoked Certificate',
      details: `Revoked credential ${revokingCert.id} issued to ${revokingCert.recipientName}. Reason: ${revocationReason}`,
      targetType: 'certificate',
      targetId: revokingCert.id,
    });

    setRevokingCert(null);
    setRevocationReason('');
    onRefreshData();
  };

  // Re-instate a revoked certificate
  const handleReinstateCertificate = (cert: Certificate) => {
    if (!confirm(`Re-instate credential ${cert.id}? It will immediately verify as valid again.`)) return;

    const updated: Certificate = {
      ...cert,
      isRevoked: false,
      revokedAt: undefined,
      revocationReason: undefined,
    };

    storage.saveCertificate(updated);

    storage.addLog({
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action: 'Re-instated Certificate',
      details: `Re-instated credential ${cert.id} to active verified status.`,
      targetType: 'certificate',
      targetId: cert.id,
    });

    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Certificates & Verification Desk</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manually upload credential images/PDFs, issue verifiable certificates with unique IDs, and revoke compromised credentials.
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="px-4 py-2.5 bg-[#009166] hover:bg-[#007a56] text-white rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue New Certificate</span>
        </button>
      </div>

      {/* Certificates Registry Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9F6] border-b border-gray-200 text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-4">Credential ID</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Subject Course / Track</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {certificates.map(cert => (
                <tr key={cert.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-gray-900">
                    {cert.id}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{cert.recipientName}</div>
                    <div className="text-xs text-gray-400">{cert.recipientEmail}</div>
                  </td>

                  <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                    <div>{cert.courseOrTrackTitle}</div>
                    {cert.gradeOrMarks && (
                      <span className="text-[11px] text-[#009166]">{cert.gradeOrMarks}</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-xs text-gray-600">
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    {cert.isRevoked ? (
                      <div>
                        <Badge variant="red">Revoked</Badge>
                        <span className="block text-[10px] text-rose-600 mt-0.5 line-clamp-1">
                          {cert.revocationReason}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="green">Valid & Active</Badge>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Test public verification */}
                      <button
                        onClick={() => onVerifyCertificate(cert.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-[#009166] rounded cursor-pointer"
                        title="Verify on Public Registry"
                      >
                        Verify ↗
                      </button>

                      {cert.isRevoked ? (
                        <button
                          onClick={() => handleReinstateCertificate(cert)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#009166] rounded text-xs font-bold cursor-pointer"
                        >
                          Reinstate
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setRevokingCert(cert);
                            setRevocationReason('Academic policy violation or administrative audit.');
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-xs font-bold cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue Certificate */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#009166]" />
                <span>Issue Certificate of Accomplishment</span>
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Select Intern *</label>
                <select
                  value={selectedLearnerId}
                  onChange={e => setSelectedLearnerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  {interns.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Credential Type</label>
                  <select
                    value={targetType}
                    onChange={e => {
                      const type = e.target.value as 'course' | 'track';
                      setTargetType(type);
                      if (type === 'course') setSelectedTargetTitle(courses[0]?.title || '');
                      else setSelectedTargetTitle(tracks[0]?.title || '');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="course">Course Completion</option>
                    <option value="track">Complete Track Specialization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Target Subject</label>
                  <select
                    value={selectedTargetTitle}
                    onChange={e => setSelectedTargetTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  >
                    {targetType === 'course'
                      ? courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)
                      : tracks.map(t => <option key={t.id} value={t.title}>{t.title}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Unique Credential ID *
                </label>
                <input
                  type="text"
                  required
                  value={customCertId}
                  onChange={e => setCustomCertId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Issuer Name</label>
                  <input
                    type="text"
                    value={issuerName}
                    onChange={e => setIssuerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Issuer Title</label>
                  <input
                    type="text"
                    value={issuerTitle}
                    onChange={e => setIssuerTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Grade or Honors (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grade: A (96%)"
                  value={gradeMarks}
                  onChange={e => setGradeMarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Certificate Document / Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://... (ready-made image or PDF URL)"
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#009166] hover:bg-[#007a56] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Issue Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Revoke Certificate */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-rose-700 flex items-center gap-2">
                <ShieldX className="w-5 h-5 text-rose-600" />
                <span>Revoke Certificate</span>
              </h3>
              <button onClick={() => setRevokingCert(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <p className="text-xs text-gray-600">
              Revoking credential <strong className="text-gray-900 font-mono">{revokingCert.id}</strong> ({revokingCert.recipientName}) will instantly update the public verification engine to report this credential as <strong>REVOKED</strong>.
            </p>

            <form onSubmit={handleRevokeCertificate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Reason for Revocation *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the audit finding or policy violation..."
                  value={revocationReason}
                  onChange={e => setRevocationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRevokingCert(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Revocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
