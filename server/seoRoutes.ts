/**
 * SEO routes for sitemap, robots.txt, and structured data
 */

import { Router } from 'express';
import { generateSitemap, generateRobotsTxt, generateLocationSitemap, generateBlogSitemap } from './seo';

const router = Router();

/**
 * Main sitemap
 */
router.get('/sitemap.xml', (req, res) => {
  const baseUrl = `https://${req.get('host')}`;
  const sitemap = generateSitemap(baseUrl);
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

/**
 * Location-specific sitemap
 */
router.get('/sitemap-locations.xml', (req, res) => {
  const baseUrl = `https://${req.get('host')}`;
  const sitemap = generateLocationSitemap(baseUrl);
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

/**
 * Blog sitemap
 */
router.get('/sitemap-blog.xml', (req, res) => {
  const baseUrl = `https://${req.get('host')}`;
  // In production, fetch blog posts from database
  const blogPosts = [
    { slug: 'choose-domestic-help', date: '2024-01-15' },
    { slug: 'qualities-professional-maid', date: '2024-01-12' },
    { slug: 'household-budget-management', date: '2024-01-10' },
    { slug: 'safety-vetting-domestic-help', date: '2024-01-08' },
    { slug: 'professional-childcare-benefits', date: '2024-01-05' },
  ];
  const sitemap = generateBlogSitemap(baseUrl, blogPosts);
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

/**
 * Robots.txt
 */
router.get('/robots.txt', (req, res) => {
  const robotsTxt = generateRobotsTxt();
  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

/**
 * .well-known/security.txt for security disclosures
 */
router.get('/.well-known/security.txt', (req, res) => {
  const securityTxt = `Contact: security@24hoursmaid.com
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Preferred-Languages: en
`;
  res.header('Content-Type', 'text/plain');
  res.send(securityTxt);
});

export default router;
