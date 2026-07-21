import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { getNormalizedPdfUrl } from '../../utils/pdfUtils';

interface PdfViewerProps {
  pdfUrl: string;
  title?: string;
  height?: string | number;
  className?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  title = 'Candidate Resume PDF',
  height = '100%',
  className = ''
}) => {
  if (!pdfUrl) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          backgroundColor: 'var(--gray-bg, #f8fafc)',
          borderRadius: 12,
          border: '1px solid var(--gray-border, #e2e8f0)',
          color: 'var(--gray-text-muted, #64748b)'
        }}
      >
        <FileText size={36} style={{ marginBottom: 8, opacity: 0.5 }} />
        <p style={{ margin: 0, fontWeight: 600 }}>No PDF resume file provided.</p>
      </div>
    );
  }

  const normalizedUrl = getNormalizedPdfUrl(pdfUrl);

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: height,
        minHeight: typeof height === 'number' ? height : 540,
        backgroundColor: '#525659',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <object
        data={normalizedUrl}
        type="application/pdf"
        width="100%"
        height="100%"
        aria-label={title}
        style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
      >
        <embed
          src={normalizedUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ border: 'none', width: '100%', height: '100%' }}
        />
        {/* Fallback card if browser native PDF plugin fails to render inline */}
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            backgroundColor: '#ffffff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a'
          }}
        >
          <FileText size={48} style={{ color: 'var(--accent, #4f46e5)', marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px 0' }}>{title}</h3>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px 0', maxWidth: 360 }}>
            Inline PDF preview is restricted by your device browser. Click below to view the PDF directly.
          </p>
          <a
            href={normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 10,
              backgroundColor: 'var(--accent, #4f46e5)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none'
            }}
          >
            Open Resume PDF Portfolio <ExternalLink size={14} />
          </a>
        </div>
      </object>
    </div>
  );
};
