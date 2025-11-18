import { Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { seoKeys } from 'app/mock-api/apps/seo-pages/seo-keys.data';

const USER_PROFILE_SEO_KEY = seoKeys.find(k => k.value === 'user-profile')?.value || 'user-profile';

export default [
    {
        path     : '',
        component: ProfileComponent,
        data: {
            seoKey: USER_PROFILE_SEO_KEY,
            seo: {
                title: 'Profilim | Direkt Satış',
                description: 'Profil bilgilerinizi görüntüleyin ve güncelleyin.',
                ogType: 'website',
            },
        },
    },
] as Routes;

