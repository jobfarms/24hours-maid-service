/**
 * SEO utilities for sitemap generation, robots.txt, and structured data
 */

import { generateLocationSitemapEntries, PRIORITY_STATES } from '../shared/locations';

/**
 * Generate sitemap.xml content
 */
export function generateSitemap(baseUrl: string): string {
  const entries = generateLocationSitemapEntries();

  // Add core pages
  const corePages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/blog', priority: 0.9, changefreq: 'weekly' },
    { url: '/about', priority: 0.7, changefreq: 'monthly' },
    { url: '/contact', priority: 0.7, changefreq: 'monthly' },
    { url: '/privacy', priority: 0.5, changefreq: 'yearly' },
    { url: '/terms', priority: 0.5, changefreq: 'yearly' },
  ];

  const allEntries = [...corePages, ...entries];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (entry) => `  <url>
    <loc>${baseUrl}${entry.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return sitemap;
}

/**
 * Generate robots.txt content
 * Allows all pages but with crawl delay for non-priority areas
 */
export function generateRobotsTxt(): string {
  const priorityStates = PRIORITY_STATES.join('|');

  return `# 24Hours Maid Services - robots.txt
# Generated for SEO optimization

User-agent: *
Allow: /
Allow: /locations/
Allow: /blog/
Allow: /services/
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /*.json$
Disallow: /*.js$
Disallow: /*.css$

# Crawl delay for respectful crawling
Crawl-delay: 1

# Priority states for faster crawling
User-agent: Googlebot
Allow: /locations/(${priorityStates})/
Crawl-delay: 0

# Sitemap location
Sitemap: https://24hoursmaid.com/sitemap.xml
Sitemap: https://24hoursmaid.com/sitemap-locations.xml
Sitemap: https://24hoursmaid.com/sitemap-blog.xml`;
}

/**
 * Generate location-specific sitemap
 */
export function generateLocationSitemap(baseUrl: string): string {
  const entries = generateLocationSitemapEntries();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${baseUrl}${entry.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return sitemap;
}

/**
 * Generate blog sitemap
 */
export function generateBlogSitemap(baseUrl: string, blogPosts: any[]): string {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogPosts
  .map(
    (post) => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return sitemap;
}

/**
 * Generate SEO meta tags for a page
 */
export interface SEOMetaTags {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  canonical: string;
  robots: string;
}

export function generateSEOMetaTags(
  pageTitle: string,
  pageDescription: string,
  pageUrl: string,
  keywords: string[] = [],
  ogImage?: string
): SEOMetaTags {
  return {
    title: `${pageTitle} | 24Hours Maid Services`,
    description: pageDescription,
    keywords: [...keywords, 'maid services', 'domestic help', 'India'],
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogImage: ogImage || 'https://24hoursmaid.com/og-image.jpg',
    canonical: `https://24hoursmaid.com${pageUrl}`,
    robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  };
}

/**
 * Generate Schema.org structured data for Organization
 */
export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '24Hours Maid Services',
    url: 'https://24hoursmaid.com',
    logo: 'https://24hoursmaid.com/logo.png',
    description: 'Professional domestic services including maids, cooks, nannies, and drivers across India',
    sameAs: [
      'https://www.facebook.com/24hoursmaid',
      'https://www.instagram.com/24hoursmaid',
      'https://www.twitter.com/24hoursmaid',
      'https://www.linkedin.com/company/24hoursmaid',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+91-9876543210',
      availableLanguage: ['en', 'hi'],
    },
    areaServed: {
      '@type': 'Country',
      name: 'IN',
    },
    priceRange: '₹₹',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '10000',
    },
  };
}

/**
 * Generate Schema.org structured data for Service
 */
export function generateServiceSchema(
  serviceName: string,
  serviceDescription: string,
  areaServed: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: serviceDescription,
    provider: {
      '@type': 'Organization',
      name: '24Hours Maid Services',
      url: 'https://24hoursmaid.com',
    },
    areaServed: {
      '@type': 'Place',
      name: areaServed,
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: 'https://24hoursmaid.com',
      availableLanguage: ['en', 'hi'],
    },
  };
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://24hoursmaid.com${crumb.url}`,
    })),
  };
}

/**
 * Generate FAQ schema for location pages
 */
export function generateFAQSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I book a maid service?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply select your service, choose your preferred date and time, and complete the booking through our secure platform.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are your maids verified?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all our maids undergo thorough background checks and verification before being added to our platform.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is your cancellation policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cancellations made 24 hours before the scheduled service are fully refundable.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer services in my area?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer services across major cities and areas in India. Check our locations page to see if we serve your area.',
        },
      },
    ],
  };
}
