import { Routes } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { seoKeys } from 'app/mock-api/apps/seo-pages/seo-keys.data';

const HOME_SEO_KEY = seoKeys.find(k => k.value === 'home')?.value || 'home';

export default [
    {
        path: '',
        component: LandingHomeComponent,
        data: {
            seoKey: HOME_SEO_KEY,
            seo: {
                title: 'Aracını Değerinde Hemen Sat! | Direkt Satış',
                description: 'Aracının güncel piyasa değerini öğren, ücretsiz fiyat teklifini anında al. Hızlı, güvenli ve şeffaf satış deneyimi ile aracını aynı gün nakde çevirebilirsin.',
                keywords: ['araç değerleme', 'araç fiyat teklifi', 'hızlı araç satışı', 'güvenli araç satma'],
                ogType: 'website',
                jsonLd: [
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: 'Direkt Satış',
                        url: 'https://ds.direktsatis.com',
                        logo: 'https://ds.direktsatis.com/assets/logo.png',
                        sameAs: []
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name: 'Direkt Satış',
                        url: 'https://ds.direktsatis.com',
                        potentialAction: {
                            '@type': 'SearchAction',
                            target: {
                                '@type': 'EntryPoint',
                                urlTemplate: 'https://ds.direktsatis.com/arama?q={search_term_string}'
                            },
                            'query-input': 'required name=search_term_string'
                        }
                    }
                ]
            },
        },
    },
] as Routes;
