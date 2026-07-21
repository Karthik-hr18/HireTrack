/**
 * PDF Helper Utilities for HireTrack
 * Handles URL normalization and backend-authenticated PDF stream URLs.
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Generates an authenticated backend PDF stream URL.
 * Bypasses 3rd-party CDN 401 delivery restrictions by streaming through our backend server.
 */
export const getBackendResumeStreamUrl = (applicationId?: string, rawUrl?: string): string => {
  if (applicationId) {
    return `${API_URL}/api/applications/${applicationId}/resume`;
  }
  if (rawUrl) {
    return `${API_URL}/api/applications/resume-stream?url=${encodeURIComponent(rawUrl)}`;
  }
  return '';
};

/**
 * Normalizes Cloudinary PDF URLs for direct external links.
 */
export const getNormalizedPdfUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/raw/upload/');
  }
  return url;
};
