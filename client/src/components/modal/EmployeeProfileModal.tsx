import React, { useEffect, useRef, useState } from 'react';
import { X, FileText } from 'lucide-react';
import { useEmployeeDetail } from '../../hooks/useEmployees';
import { PdfViewerModal } from '../ui/PdfViewerModal';
import './modal.css';

interface EmployeeProfileModalProps {
  applicationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type ProfileTab = 'employment' | 'personal' | 'resume' | 'interviews' | 'notes';

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  applicationId,
  isOpen,
  onClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('employment');
  const [showPdfModal, setShowPdfModal] = useState(false);

  const { detail, loading, error } = useEmployeeDetail(isOpen ? applicationId : null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !applicationId) return null;

  const app = detail?.employee;
  const candidate = typeof app?.candidate === 'object' ? app?.candidate : null;
  const job = typeof app?.job === 'object' ? app?.job : null;
  const emp = app?.employment;

  const candidateName = candidate?.name || app?.candidateName || 'Employee';
  const candidateEmail = candidate?.email || app?.candidateEmail || 'No Email';
  const employeeId = emp?.employeeId || `EMP-${app?._id?.substring(0, 6)?.toUpperCase() || '1001'}`;

  const formatDate = (dateVal?: Date | string) => {
    if (!dateVal) return 'N/A';
    try {
      return new Date(dateVal).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return String(dateVal);
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'active': return 'badge-green';
      case 'onboarding': return 'badge-blue';
      case 'probation': return 'badge-amber';
      case 'leave': return 'badge-purple';
      case 'resigned': return 'badge-gray';
      default: return 'badge-green';
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      ref={modalRef}
      tabIndex={-1}
      style={{ zIndex: 1000 }}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 960,
          width: '90%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* HEADER BAR */}
        <header
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 20
              }}
            >
              {candidateName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {candidateName}
                </h2>
                <span
                  style={{
                    padding: '2px 10px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd'
                  }}
                >
                  {employeeId}
                </span>
                <span className={`stage-badge ${getStatusBadgeClass(emp?.employmentStatus)}`}>
                  {emp?.employmentStatus || 'Active'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>{job?.title || 'Employee'}</span>
                <span>•</span>
                <span>{job?.department || 'Engineering'}</span>
                <span>•</span>
                <span>{emp?.workLocation || job?.location || 'Main Office'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 6,
              borderRadius: 8
            }}
          >
            <X size={22} />
          </button>
        </header>

        {/* PROFILE TABS */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn-tab ${activeTab === 'employment' ? 'active' : ''}`}
            onClick={() => setActiveTab('employment')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: activeTab === 'employment' ? 700 : 500,
              color: activeTab === 'employment' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'employment' ? '2px solid #0284c7' : '2px solid transparent',
              background: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer'
            }}
          >
            Employment Info
          </button>
          <button
            type="button"
            className={`btn-tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: activeTab === 'personal' ? 700 : 500,
              color: activeTab === 'personal' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'personal' ? '2px solid #0284c7' : '2px solid transparent',
              background: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer'
            }}
          >
            Personal & Contact
          </button>
          <button
            type="button"
            className={`btn-tab ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => setActiveTab('resume')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: activeTab === 'resume' ? 700 : 500,
              color: activeTab === 'resume' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'resume' ? '2px solid #0284c7' : '2px solid transparent',
              background: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer'
            }}
          >
            Resume PDF
          </button>
          <button
            type="button"
            className={`btn-tab ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: activeTab === 'interviews' ? 700 : 500,
              color: activeTab === 'interviews' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'interviews' ? '2px solid #0284c7' : '2px solid transparent',
              background: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer'
            }}
          >
            Interview History ({detail?.interviews?.length || 0})
          </button>
        </div>

        {/* BODY WORKSPACE CONTENT */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
              Loading Employee Profile...
            </div>
          )}

          {error && (
            <div style={{ padding: 20, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 8 }}>
              {error}
            </div>
          )}

          {!loading && !error && app && (
            <>
              {/* TAB 1: EMPLOYMENT INFORMATION */}
              {activeTab === 'employment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employee ID</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>{employeeId}</p>
                    </div>

                    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Department</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>{job?.department || 'Engineering'}</p>
                    </div>

                    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Job Title</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>{job?.title || 'Employee'}</p>
                    </div>

                    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Reporting Manager</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>{emp?.managerName || 'Sarah Jenkins'}</p>
                    </div>

                    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employment Type</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0', textTransform: 'capitalize' }}>
                        {(emp?.employmentType || 'full_time').replace('_', ' ')}
                      </p>
                    </div>

                    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employment Status</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0', textTransform: 'capitalize' }}>
                        {emp?.employmentStatus || 'Active'}
                      </p>
                    </div>

                    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Joining Date</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>{formatDate(emp?.joiningDate || app.createdAt)}</p>
                    </div>

                    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Probation End Date</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>{formatDate(emp?.probationEndDate)}</p>
                    </div>

                    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Office / Facility</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>{emp?.office || 'Bangalore HQ'}</p>
                    </div>

                    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Work Shift</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>{emp?.shift || 'Day (9 AM - 6 PM)'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PERSONAL & CONTACT */}
              {activeTab === 'personal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 10 }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Contact Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
                      <div><strong>Email:</strong> {candidateEmail}</div>
                      <div><strong>Phone:</strong> {app.phone}</div>
                      <div><strong>Country:</strong> {app.country}</div>
                      <div><strong>Location:</strong> {app.address}</div>
                    </div>
                  </div>

                  <div style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 10 }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Professional Background</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
                      <div><strong>Total Experience:</strong> {app.experience} Years</div>
                      <div><strong>Previous Title:</strong> {app.currentTitle || 'N/A'}</div>
                      <div><strong>Previous Company:</strong> {app.currentCompany || 'N/A'}</div>
                      <div><strong>LinkedIn:</strong> <a href={app.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>Profile Link</a></div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RESUME PDF */}
              {activeTab === 'resume' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <FileText size={24} style={{ color: '#0284c7' }} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{candidateName} Resume</h4>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Original Application Portfolio Attachment</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-primary-sm"
                      onClick={() => setShowPdfModal(true)}
                      style={{ padding: '8px 16px', fontSize: 12 }}
                    >
                      Open Full Screen PDF
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: INTERVIEW HISTORY */}
              {activeTab === 'interviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(!detail?.interviews || detail.interviews.length === 0) ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>No interviews recorded for this employee application.</div>
                  ) : (
                    detail.interviews.map((iv: any) => (
                      <div key={iv._id} style={{ padding: 14, border: '1px solid #e2e8f0', borderRadius: 10, backgroundColor: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 14, textTransform: 'capitalize' }}>{iv.type} Interview</span>
                          <span style={{ fontSize: 12, color: '#64748b' }}>{formatDate(iv.scheduledAt)}</span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
                          Interviewer: {iv.interviewer?.name || 'Assigned Admin'} • Status: <strong style={{ textTransform: 'capitalize' }}>{iv.status}</strong>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showPdfModal && app?.resumeUrl && (
        <PdfViewerModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          pdfUrl={app.resumeUrl}
          candidateName={candidateName}
        />
      )}
    </div>
  );
};
