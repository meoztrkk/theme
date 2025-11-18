import { Routes } from '@angular/router';
import { ClarificationTextPdpComponent } from './clarification-text-pdp.component';
import { seoKeys } from 'app/mock-api/apps/seo-pages/seo-keys.data';

const PDP_SEO_KEY = seoKeys.find(k => k.value === 'pdp')?.value || 'pdp';

export default [
    {
        path: '',
        component: ClarificationTextPdpComponent,
        data: {
            seoKey: PDP_SEO_KEY,
            seo: {
                title: 'Kişisel Verilerin Korunması Aydınlatma Metni | Direkt Satış',
                description: 'Kişisel verilerinizin korunması hakkında aydınlatma metni.',
                ogType: 'website',
            },
        },
    },
] as Routes;

