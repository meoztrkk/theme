import { SeoPage } from './seo-page.model';
import { SeoConfig } from './seo-config.model';

/**
 * Maps a SeoPage DTO to SeoConfig
 *
 * Converts backend SeoPage data structure to frontend SeoConfig format
 * for use with SeoService.
 */
export function mapSeoPageToSeoConfig(page: SeoPage): SeoConfig {
    return {
        title: page.title,
        description: page.description,
        keywords: page.keywords ? page.keywords.split(',').map(k => k.trim()).filter(k => !!k) : undefined,
        canonicalUrl: page.canonicalUrl,
        ogTitle: page.ogTitle || page.title,
        ogDescription: page.ogDescription || page.description,
        ogImage: page.ogImage,
        ogType: page.ogType,
        twitterCard: page.twitterCard || 'summary_large_image',
        twitterTitle: page.twitterTitle || page.title,
        twitterDescription: page.twitterDescription || page.description,
        twitterImage: page.twitterImage,
        jsonLd: page.jsonLd ? (() => {
            try {
                return JSON.parse(page.jsonLd);
            } catch (e) {
                console.warn('Failed to parse JSON-LD from SeoPage:', e);
                return undefined;
            }
        })() : undefined
    };
}

