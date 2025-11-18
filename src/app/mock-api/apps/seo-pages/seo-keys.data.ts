/* eslint-disable */
/**
 * SEO Keys (Route Names) Data
 *
 * Centralized list of SEO keys used across the application.
 * These values are used in route data.seoKey and must match SeoPage.RouteName in the backend.
 *
 * IMPORTANT: Both route definitions and admin form use this same source to ensure consistency.
 */

export interface SeoKeyOption {
    value: string;
    label: string;
    description?: string;
}

export const seoKeys: SeoKeyOption[] = [
    {
        value: 'home',
        label: 'Ana Sayfa',
        description: 'Landing page - Ana sayfa'
    },
    {
        value: 'wizard',
        label: 'Değerleme Sihirbazı',
        description: 'Araç değerleme sihirbazı sayfası'
    },
    {
        value: 'blog-list',
        label: 'Blog Listesi',
        description: 'Blog yazılarının listelendiği sayfa'
    },
    {
        value: 'blog-detail',
        label: 'Blog Detay',
        description: 'Tek bir blog yazısının detay sayfası'
    },
    {
        value: 'user-profile',
        label: 'Kullanıcı Profili',
        description: 'Kullanıcı profil sayfası'
    },
    {
        value: 'user-degerlemelerim',
        label: 'Değerlemelerim',
        description: 'Kullanıcının değerleme geçmişi sayfası'
    },
    {
        value: 'user-randevularim',
        label: 'Randevularım',
        description: 'Kullanıcının randevu listesi sayfası'
    },
    {
        value: 'kvkk',
        label: 'KVKK Aydınlatma Metni',
        description: 'Kişisel Verilerin Korunması Kanunu aydınlatma metni sayfası'
    },
    {
        value: 'pdp',
        label: 'Kişisel Verilerin Korunması',
        description: 'Kişisel verilerin korunması aydınlatma metni sayfası'
    },
    {
        value: 'offers',
        label: 'Teklifler',
        description: 'Araç tekliflerinin görüntülendiği sayfa'
    }
];

/**
 * Get SEO key value by key name
 */
export function getSeoKeyValue(key: string): string | undefined {
    const option = seoKeys.find(k => k.value === key);
    return option?.value;
}

/**
 * Get SEO key label by key name
 */
export function getSeoKeyLabel(key: string): string | undefined {
    const option = seoKeys.find(k => k.value === key);
    return option?.label;
}

