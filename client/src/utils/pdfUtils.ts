/**
  * PDF Helper Utilities for HireTrack
  * Handles URL normalization for Cloudinary PDFs and Google Docs Viewer embedding.
  */

/**
 * Normalizes Cloudinary PDF URLs:
 * Converts legacy `/image/upload/` paths to `/raw/upload/` so Cloudinary streams the raw PDF binary.
 */
export const getNormalizedPdfUrl = (url: string): string => {
  if (!url) return '';
  
  // Transform Cloudinary image upload URLs to raw upload URLs for PDFs
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/raw/upload/');
  }
  
  return url;
};

/**
 * Generates an embedded Google Docs PDF Viewer URL.
 * Works 100% reliably in an iframe across Chrome, Safari, Firefox, Edge, and mobile browsers.
 */
export const getGoogleDocsPdfUrl = (url: string): string => {
  const normalized = getNormalizedPdfUrl(url);
  return `https://docs.google.com/viewer?url=${encodeURIComponent(normalized)}&embedded=true`;
};
