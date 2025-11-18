import { Routes } from '@angular/router';
import { BlogDetailComponent } from 'app/modules/blog/detail/blog-detail.component';
import { seoKeys } from 'app/mock-api/apps/seo-pages/seo-keys.data';

const BLOG_DETAIL_SEO_KEY = seoKeys.find(k => k.value === 'blog-detail')?.value || 'blog-detail';

export default [
    {
        path     : '', // Bu yol parent route'ta zaten ':id' olarak tanımlı
        component: BlogDetailComponent,
        data: {
            seoKey: BLOG_DETAIL_SEO_KEY,
            seo: {
                title: 'Blog Detay | Direkt Satış',
                description: 'Araç satışı ve değerleme hakkında detaylı içerik.',
                ogType: 'article',
            },
        },
    },
] as Routes;
