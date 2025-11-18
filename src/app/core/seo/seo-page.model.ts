export interface SeoPage {
    id?: string;
    name: string;
    routeName: string;
    title: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    jsonLd?: string;
    isActive?: boolean;
    culture?: string;
    creationTime?: string;
    lastModificationTime?: string;
}

export interface CreateUpdateSeoPage {
    name: string;
    routeName: string;
    title: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    jsonLd?: string;
    isActive?: boolean;
    culture?: string;
}

export interface PagedSeoPageResult {
    items: SeoPage[];
    totalCount: number;
}

