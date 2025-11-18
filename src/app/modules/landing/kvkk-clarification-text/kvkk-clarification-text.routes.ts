import { Routes } from '@angular/router';
import { KvkkClarificationTextComponent } from './kvkk-clarification-text.component';
import { seoKeys } from 'app/mock-api/apps/seo-pages/seo-keys.data';

const KVKK_SEO_KEY = seoKeys.find(k => k.value === 'kvkk')?.value || 'kvkk';

export default [
    {
        path: '',
        component: KvkkClarificationTextComponent,
        data: {
            seoKey: KVKK_SEO_KEY,
            seo: {
                title: 'KVKK Aydınlatma Metni | Direkt Satış',
                description: 'Kişisel verilerin korunması kanunu kapsamında aydınlatma metni.',
                ogType: 'website',
            },
        },
    },
] as Routes;

