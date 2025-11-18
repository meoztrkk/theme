/**
 * SEO Configuration Interface
 * 
 * Defines the structure for SEO metadata including:
 * - Basic meta tags (title, description, keywords, robots)
 * - OpenGraph tags for social media sharing
 * - Twitter Card tags
 * - Canonical URL
 * - JSON-LD schema (for future Schema.org implementation)
 */
export interface SeoConfig {
    // Basic SEO
    title: string;
    description?: string;
    keywords?: string[];
    canonicalUrl?: string;
    robots?: string;

    // OpenGraph
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    ogUrl?: string;

    // Twitter Card
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;

    // JSON-LD Schema (for future use)
    jsonLd?: any;
}

