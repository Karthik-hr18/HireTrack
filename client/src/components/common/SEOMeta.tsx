import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOMetaProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
}

export const SEOMeta: React.FC<SEOMetaProps> = ({
  title = 'HireTrack — Modern B2B Applicant Tracking System',
  description = 'HireTrack simplifies candidate sourcing, job distribution, technical interview scheduling, and hiring pipeline analytics for modern talent acquisition teams.',
  canonicalUrl = 'https://hiretrack-client.vercel.app',
  ogImage = 'https://hiretrack-client.vercel.app/og-image.png',
  ogType = 'website'
}) => {
  const fullTitle = title.includes('HireTrack') ? title : `${title} | HireTrack`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
};
