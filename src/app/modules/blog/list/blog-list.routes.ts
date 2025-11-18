import { Routes } from '@angular/router';
import { BlogListComponent } from 'app/modules/blog/list/blog-list.component';
import { seoKeys } from 'app/mock-api/apps/seo-pages/seo-keys.data';

const BLOG_LIST_SEO_KEY = seoKeys.find(k => k.value === 'blog-list')?.value || 'blog-list';

export default [
    {
        path     : '',
        component: BlogListComponent,
        data: {
            seoKey: BLOG_LIST_SEO_KEY,
            seo: {
                title: 'Blog | Direkt Satış',
                description: 'Araç satışı, araç değerleme ve ikinci el piyasası hakkında rehber içerikler ve ipuçları.',
                keywords: ['araç satış blog', 'araç değerleme rehberi', 'ikinci el araç ipuçları'],
                ogType: 'website',
            },
        },
    },
] as Routes;
