import { SeoConfig } from './seo-config.model';

/**
 * Default SEO Configuration
 * 
 * Site-wide default SEO values that can be used as fallback
 * or merged with page-specific configurations
 */
export const defaultSeoConfig: SeoConfig = {
    title: 'Direkt Satış | Aracını Değerinde Hemen Sat',
    description: 'Aracının güncel piyasa değerini öğren, ücretsiz fiyat teklifini anında al. Hızlı, güvenli ve şeffaf satış deneyimi ile aracını aynı gün nakde çevirebilirsin.',
    keywords: ['araç satışı', 'araç değerleme', 'direkt satış', 'araç fiyat teklifi'],
    robots: 'index, follow',
    ogType: 'website',
    twitterCard: 'summary_large_image',
};

