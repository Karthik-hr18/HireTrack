import { Request, Response, NextFunction } from 'express';
import { Job } from '../models/Job';

export const generateSitemapXml = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all open active jobs
    const jobs = await Job.find({ status: 'open', deletedAt: null }).select('_id updatedAt');

    // Retrieve active request host for dynamic domain calculations
    const hostHeader = req.get('host') || 'hiretrack.onrender.com';
    const protocol = req.secure ? 'https' : 'http';
    const baseUrl = `${protocol}://${hostHeader}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Root home page
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Login & Register pages
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/login</loc>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.5</priority>\n`;
    xml += `  </url>\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/register</loc>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.5</priority>\n`;
    xml += `  </url>\n`;

    // Dynamic Job Detail pages
    jobs.forEach(job => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/jobs/${job._id}</loc>\n`;
      xml += `    <lastmod>${new Date(job.updatedAt).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    return next(error);
  }
};
