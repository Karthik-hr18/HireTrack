import { Router } from 'express';
import { generateSitemapXml } from '../controllers/sitemapController';

const router = Router();

// Sitemap mapping (Public RSS/SEO bot endpoints)
router.get('/sitemap.xml', generateSitemapXml);

export default router;
