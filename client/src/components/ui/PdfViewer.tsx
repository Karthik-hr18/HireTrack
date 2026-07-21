import React, { useState, useEffect, useCallback } from 'react';
import { FileText, ExternalLink, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { getBackendResumeStreamUrl, getNormalizedPdfUrl } from '../../utils/pdfUtils';

interface PdfViewerProps {
  applicationId?: string;
  pdfUrl?: string;
  title?: string;
  height?: string | number;
  className?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  applicationId,
  pdfUrl = '',
  title = 'Candidate Resume PDF',
  height = '100%',
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const streamUrl = applicationId ? getBackendResumeStreamUrl(applicationId) : '';
  const rawUrl = getNormalizedPdfUrl(pdfUrl);

  const fetchAuthenticatedPdf = useCallback(async () => {
    if (!streamUrl && !rawUrl) {
      setLoading(false);
      setErrorStatus(404);
      setErrorMessage('No resume file URL provided for this candidate.');
      return;
    }

    try {
      setLoading(true);
      setErrorStatus(null);
      setErrorMessage(null);

      const token = localStorage.getItem('token');
      const targetFetchUrl = streamUrl || rawUrl;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch raw PDF bytes with Authorization header
      const res = await fetch(targetFetchUrl, { headers });

      if (!res.ok) {
        setErrorStatus(res.status);
        if (res.status === 404) {
          setErrorMessage('Resume PDF file not found in storage repository.');
        } else if (res.status === 401 || res.status === 403) {
          setErrorMessage('Access restricted: Invalid authentication token or session expired.');
        } else {
          setErrorMessage(`Storage provider or server returned status ${res.status}.`);
        }
        return;
      }

      // Create Blob URL for in-page inline PDF rendering
      const pdfBlob = await res.blob();
      const createdUrl = URL.createObjectURL(
        new Blob([pdfBlob], { type: 'application/pdf' })
      );

      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return createdUrl;
      });
    } catch (err) {
      console.error('[PdfViewer Fetch Error]', err);
      setErrorStatus(500);
      setErrorMessage('Network connection error while fetching candidate resume.');
    } finally {
      setLoading(false);
    }
  }, [streamUrl, rawUrl]);

  useEffect(() => {
    fetchAuthenticatedPdf();

    return () => {
      setBlobUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
    };
  }, [fetchAuthenticatedPdf, reloadKey]);

  const handleRetry = () => {
    setReloadKey((prev) => prev + 1);
  };

  if (!pdfUrl && !applicationId) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}
      >
        <FileText size={36} style={{ marginBottom: 8, opacity: 0.5 }} />
        <p style={{ margin: 0, fontWeight: 600 }}>No PDF resume file associated with this candidate profile.</p>
      </div>
    );
  }

  // ── Error State Card (Preserves 404, 401, 500 without fake PDF fallbacks) ──
  if (errorStatus && errorStatus !== 200) {
    return (
      <div
        style={{
          width: '100%',
          height: height,
          minHeight: typeof height === 'number' ? height : 500,
          backgroundColor: '#1e293b',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          color: '#ffffff',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}
        >
          <AlertCircle size={28} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px 0', color: '#f8fafc' }}>
          Resume PDF Unavailable
        </h3>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 24px 0', maxWidth: 420, lineHeight: 1.5 }}>
          {errorMessage || `Unable to load PDF document (HTTP Status ${errorStatus}).`}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 10,
              backgroundColor: 'var(--accent, #4f46e5)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} /> Retry Loading
          </button>

          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none'
              }}
            >
              Open Direct Storage Link <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    );
  }

  // ── Loading Spinner State ────────────────────────────────────────────────
  if (loading || !blobUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: height,
          minHeight: typeof height === 'number' ? height : 500,
          backgroundColor: '#525659',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}
      >
        <Loader2 size={36} className="spin-animation" style={{ marginBottom: 12, color: '#ffffff' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
          Buffering Authenticated Candidate Resume PDF...
        </p>
      </div>
    );
  }

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
        data={blobUrl}
        type="application/pdf"
        width="100%"
        height="100%"
        aria-label={title}
        style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
      >
        <embed
          src={blobUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ border: 'none', width: '100%', height: '100%' }}
        />
        {/* Fallback CTA */}
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
            Click below to open the authenticated PDF resume document.
          </p>
          <a
            href={blobUrl}
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
            Open Resume PDF <ExternalLink size={14} />
          </a>
        </div>
      </object>
    </div>
  );
};
