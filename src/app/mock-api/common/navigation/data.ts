/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
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
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
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
];

export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
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
];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Anasayfa',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
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
];
