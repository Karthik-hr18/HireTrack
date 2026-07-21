import React, { useState } from 'react';
import { X, ExternalLink, FileText, RefreshCw } from 'lucide-react';
import { getNormalizedPdfUrl, getGoogleDocsPdfUrl } from '../../utils/pdfUtils';

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
  const [engine, setEngine] = useState<'google' | 'direct'>('google');
  const [reloadKey, setReloadKey] = useState(0);

  if (!isOpen || !pdfUrl) return null;

  const normalizedUrl = getNormalizedPdfUrl(pdfUrl);
  const googleViewerUrl = getGoogleDocsPdfUrl(pdfUrl);
  const activeFrameUrl = engine === 'google' ? googleViewerUrl : normalizedUrl;

  const handleRefresh = () => {
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
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
          maxWidth: 1000,
          height: '90vh',
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
                Interactive In-App PDF Document Viewer
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View Engine Toggle */}
            <div style={{ display: 'flex', backgroundColor: 'var(--gray-bg)', padding: 3, borderRadius: 10, border: '1px solid var(--gray-border)' }}>
              <button
                type="button"
                onClick={() => setEngine('google')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: engine === 'google' ? '#ffffff' : 'transparent',
                  color: engine === 'google' ? 'var(--accent)' : 'var(--gray-text-muted)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: engine === 'google' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Google Engine
              </button>
              <button
                type="button"
                onClick={() => setEngine('direct')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: engine === 'direct' ? '#ffffff' : 'transparent',
                  color: engine === 'direct' ? 'var(--accent)' : 'var(--gray-text-muted)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: engine === 'direct' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Direct Stream
              </button>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              title="Reload Preview"
              style={{ padding: 8, borderRadius: 10, border: '1px solid var(--gray-border)', backgroundColor: '#fff', cursor: 'pointer', color: 'var(--gray-text-muted)' }}
            >
              <RefreshCw size={16} />
            </button>

            <a
              href={normalizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-sm"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 14px' }}
            >
              Open Tab <ExternalLink size={14} />
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

        {/* IFRAME EMBED WORKSPACE */}
        <div style={{ flex: 1, backgroundColor: '#525659', position: 'relative' }}>
          <iframe
            key={reloadKey}
            src={activeFrameUrl}
            title={`${candidateName} Resume PDF`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#525659'
            }}
          />
        </div>
      </div>
    </div>
  );
};
