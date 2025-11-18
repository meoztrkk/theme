import { Routes } from '@angular/router';
import { OffersComponent } from './offers.component';
import { seoKeys } from 'app/mock-api/apps/seo-pages/seo-keys.data';

const OFFERS_SEO_KEY = seoKeys.find(k => k.value === 'offers')?.value || 'offers';

export default [
    {
        path: 'offers/:id',
        component: OffersComponent,
        data: {
            seoKey: OFFERS_SEO_KEY,
            seo: {
                title: 'Teklifler | Direkt Satış',
                description: 'Aracınız için aldığınız fiyat tekliflerini görüntüleyin ve karşılaştırın.',
                keywords: ['araç teklifleri', 'fiyat teklifleri', 'araç satış teklifleri'],
                ogType: 'website',
            },
        },
    },
] as Routes;
