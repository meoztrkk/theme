/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'home',
        title: 'Anasayfa',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/home',
    },
    {
        id: 'wizard',
        title: 'Aracını Sat',
        type: 'basic',
        icon: 'heroicons_outline:truck',
        link: '/wizard',
    },
    {
        id: 'blog',
        title: 'BLOG',
        type: 'collapsable',
        icon: 'heroicons_outline:newspaper',
        children: [
            {
                id: 'blog.list',
                title: 'Blog Listesi',
                type: 'basic',
                link: '/blog',
            },
            {
                id: 'blog.form',
                title: 'Blog Ekle',
                type: 'basic',
                link: '/blog/new',
            },
        ],
    },
    {
        id: 'admin',
        title: 'YÖNETİM',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id: 'admin.users',
                title: 'Kullanıcı Yönetimi',
                type: 'basic',
                link: '/admin/users',
            },
            {
                id: 'admin.seo-pages',
                title: 'SEO Yönetimi',
                type: 'basic',
                link: '/admin/seo-pages',
            },
            {
                id: 'admin.seo-global',
                title: 'SEO Global',
                type: 'basic',
                link: '/admin/seo-global',
            },
        ],
    },
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'home',
        title: 'Anasayfa',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/home',
    },
    {
        id: 'wizard',
        title: 'Aracını Sat',
        type: 'basic',
        icon: 'heroicons_outline:truck',
        link: '/wizard',
    },
    {
        id: 'blog',
        title: 'BLOG',
        type: 'collapsable',
        icon: 'heroicons_outline:newspaper',
        children: [
            {
                id: 'blog.list',
                title: 'Blog Listesi',
                type: 'basic',
                link: '/blog',
            },
            {
                id: 'blog.form',
                title: 'Blog Ekle',
                type: 'basic',
                link: '/blog/new',
            },
        ],
    },
    {
        id: 'admin',
        title: 'YÖNETİM',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id: 'admin.users',
                title: 'Kullanıcı Yönetimi',
                type: 'basic',
                link: '/admin/users',
            },
            {
                id: 'admin.seo-pages',
                title: 'SEO Yönetimi',
                type: 'basic',
                link: '/admin/seo-pages',
            },
            {
                id: 'admin.seo-global',
                title: 'SEO Global',
                type: 'basic',
                link: '/admin/seo-global',
            },
        ],
    },
];

export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'home',
        title: 'Anasayfa',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/home',
    },
    {
        id: 'wizard',
        title: 'Aracını Sat',
        type: 'basic',
        icon: 'heroicons_outline:truck',
        link: '/wizard',
    },
    {
        id: 'blog',
        title: 'BLOG',
        type: 'collapsable',
        icon: 'heroicons_outline:newspaper',
        children: [
            {
                id: 'blog.list',
                title: 'Blog Listesi',
                type: 'basic',
                link: '/blog',
            },
            {
                id: 'blog.form',
                title: 'Blog Ekle',
                type: 'basic',
                link: '/blog/new',
            },
        ],
    },
    {
        id: 'admin',
        title: 'YÖNETİM',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id: 'admin.users',
                title: 'Kullanıcı Yönetimi',
                type: 'basic',
                link: '/admin/users',
            },
            {
                id: 'admin.seo-pages',
                title: 'SEO Yönetimi',
                type: 'basic',
                link: '/admin/seo-pages',
            },
            {
                id: 'admin.seo-global',
                title: 'SEO Global',
                type: 'basic',
                link: '/admin/seo-global',
            },
        ],
    },
];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'home',
        title: 'Anasayfa',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/home',
    },
    {
        id: 'wizard',
        title: 'Aracını Sat',
        type: 'basic',
        icon: 'heroicons_outline:truck',
        link: '/wizard',
    },
    {
        id: 'blog',
        title: 'BLOG',
        type: 'collapsable',
        icon: 'heroicons_outline:newspaper',
        children: [
            {
                id: 'blog.list',
                title: 'Blog Listesi',
                type: 'basic',
                link: '/blog',
            },
            {
                id: 'blog.form',
                title: 'Blog Ekle',
                type: 'basic',
                link: '/blog/new',
            },
        ],
    },
    {
        id: 'admin',
        title: 'YÖNETİM',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id: 'admin.users',
                title: 'Kullanıcı Yönetimi',
                type: 'basic',
                link: '/admin/users',
            },
            {
                id: 'admin.seo-pages',
                title: 'SEO Yönetimi',
                type: 'basic',
                link: '/admin/seo-pages',
            },
            {
                id: 'admin.seo-global',
                title: 'SEO Global',
                type: 'basic',
                link: '/admin/seo-global',
            },
        ],
    },
];
