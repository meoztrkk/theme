import { Routes } from '@angular/router';
import { RandevularimComponent } from './randevularim.component';
import { seoKeys } from 'app/mock-api/apps/seo-pages/seo-keys.data';

const USER_RANDEVULARIM_SEO_KEY = seoKeys.find(k => k.value === 'user-randevularim')?.value || 'user-randevularim';

export default [
    {
        path     : '',
        component: RandevularimComponent,
        data: {
            seoKey: USER_RANDEVULARIM_SEO_KEY,
            seo: {
                title: 'Randevularım | Direkt Satış',
                description: 'Aracınızı satmak için randevularınızı görüntüleyin, güncelleyin veya iptal edin.',
                ogType: 'website',
            },
        },
    },
] as Routes;

