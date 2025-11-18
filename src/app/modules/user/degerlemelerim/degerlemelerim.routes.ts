import { Routes } from '@angular/router';
import { DegerlemelerimComponent } from './degerlemelerim.component';
import { seoKeys } from 'app/mock-api/apps/seo-pages/seo-keys.data';

const USER_DEGERLEMELERIM_SEO_KEY = seoKeys.find(k => k.value === 'user-degerlemelerim')?.value || 'user-degerlemelerim';

export default [
    {
        path     : '',
        component: DegerlemelerimComponent,
        data: {
            seoKey: USER_DEGERLEMELERIM_SEO_KEY,
            seo: {
                title: 'Değerlemelerim | Direkt Satış',
                description: 'Araç değerleme geçmişinizi görüntüleyin ve tekliflerinizi takip edin.',
                ogType: 'website',
            },
        },
    },
] as Routes;
