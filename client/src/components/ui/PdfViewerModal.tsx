import React from 'react';
import { X, ExternalLink, FileText } from 'lucide-react';
import { getNormalizedPdfUrl } from '../../utils/pdfUtils';
import { PdfViewer } from './PdfViewer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  candidateName?: string;
}

export const PdfViewerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  pdfUrl,
  candidateName = 'Candidate'
}) => {
  if (!isOpen || !pdfUrl) return null;

  const normalizedUrl = getNormalizedPdfUrl(pdfUrl);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000000,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 1040,
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid var(--gray-border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <header
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--gray-border)',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--gray-text-primary)', margin: 0 }}>
                {candidateName} — Resume PDF Portfolio
              </h3>
              <p style={{ fontSize: 12, color: 'var(--gray-text-muted)', margin: 0 }}>
                In-App Native PDF Document Viewer
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href={normalizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-sm"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 14px' }}
            >
              Open in New Tab <ExternalLink size={14} />
            </a>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-text-muted)',
                padding: 6,
                borderRadius: 8
              }}
            >
              <X size={22} />
            </button>
          </div>
        </header>

        {/* NATIVE PDF VIEWER WORKSPACE */}
        <div style={{ flex: 1, backgroundColor: '#525659', position: 'relative' }}>
          <PdfViewer
            pdfUrl={pdfUrl}
            title={`${candidateName} Resume PDF Portfolio`}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};
