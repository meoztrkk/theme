import { DOCUMENT } from '@angular/common';
import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { SeoConfig } from './seo-config.model';

/**
 * SEO Service
 * 
 * Manages SEO metadata including:
 * - Document title and meta tags
 * - Canonical URLs
 * - OpenGraph tags
 * - Twitter Card tags
 * - JSON-LD structured data (infrastructure ready, not generating schemas yet)
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
    private _title = inject(Title);
    private _meta = inject(Meta);
    private _document = inject(DOCUMENT);
    private _router = inject(Router);
    private _rendererFactory = inject(RendererFactory2);
    private _renderer: Renderer2;
    private _jsonLdScripts: HTMLScriptElement[] = [];
    private _canonicalLink: HTMLLinkElement | null = null;

    constructor() {
        this._renderer = this._rendererFactory.createRenderer(null, null);
    }

    /**
     * Main method to apply complete SEO configuration
     * Calls all update methods in the correct order
     */
    applySeo(config: SeoConfig): void {
        this.updateSeo(config);
        this.updateCanonical(config.canonicalUrl);
        this.updateOpenGraph(config);
        this.updateTwitterCard(config);

        // JSON-LD is optional and will be set separately if provided
        if (config.jsonLd) {
            this.setJsonLd(config.jsonLd);
        } else {
            this.clearJsonLd();
        }
    }

    /**
     * Updates basic SEO meta tags: title, description, keywords, robots
     */
    updateSeo(config: SeoConfig): void {
        // Set document title
        if (config.title) {
            this._title.setTitle(config.title);
        }

        // Update or add description meta tag
        if (config.description) {
            this._meta.updateTag({ name: 'description', content: config.description });
        } else {
            this._meta.removeTag("name='description'");
        }

        // Update or add keywords meta tag (join array with commas)
        if (config.keywords && config.keywords.length > 0) {
            const keywordsString = config.keywords.join(', ');
            this._meta.updateTag({ name: 'keywords', content: keywordsString });
        } else {
            this._meta.removeTag("name='keywords'");
        }

        // Update or add robots meta tag
        if (config.robots) {
            this._meta.updateTag({ name: 'robots', content: config.robots });
        } else {
            this._meta.removeTag("name='robots'");
        }
    }

    /**
     * Updates or creates the canonical link tag
     * If url is not provided, builds it from the current router URL + base URL
     */
    updateCanonical(url?: string): void {
        // Remove existing canonical link if present
        if (this._canonicalLink) {
            this._renderer.removeChild(this._document.head, this._canonicalLink);
            this._canonicalLink = null;
        }

        // Build canonical URL
        let canonicalUrl = url;
        if (!canonicalUrl) {
            const baseUrl = environment.application.baseUrl.replace(/\/$/, '');
            const currentPath = this._router.url.split('?')[0]; // Remove query params
            canonicalUrl = `${baseUrl}${currentPath}`;
        }

        // Create and append new canonical link
        this._canonicalLink = this._renderer.createElement('link');
        this._renderer.setAttribute(this._canonicalLink, 'rel', 'canonical');
        this._renderer.setAttribute(this._canonicalLink, 'href', canonicalUrl);
        this._renderer.appendChild(this._document.head, this._canonicalLink);
    }

    /**
     * Updates OpenGraph meta tags
     * Uses fallbacks: ogTitle → title, ogDescription → description, ogUrl → canonical
     */
    updateOpenGraph(config: SeoConfig): void {
        const ogTitle = config.ogTitle || config.title;
        const ogDescription = config.ogDescription || config.description;
        const ogUrl = config.ogUrl || (this._canonicalLink ? this._canonicalLink.getAttribute('href') || '' : '');

        // Update or add og:title
        if (ogTitle) {
            this._meta.updateTag({ property: 'og:title', content: ogTitle });
        } else {
            this._meta.removeTag("property='og:title'");
        }

        // Update or add og:description
        if (ogDescription) {
            this._meta.updateTag({ property: 'og:description', content: ogDescription });
        } else {
            this._meta.removeTag("property='og:description'");
        }

        // Update or add og:image
        if (config.ogImage) {
            this._meta.updateTag({ property: 'og:image', content: config.ogImage });
        } else {
            this._meta.removeTag("property='og:image'");
        }

        // Update or add og:type
        if (config.ogType) {
            this._meta.updateTag({ property: 'og:type', content: config.ogType });
        } else {
            this._meta.updateTag({ property: 'og:type', content: 'website' }); // Default to website
        }

        // Update or add og:url
        if (ogUrl) {
            this._meta.updateTag({ property: 'og:url', content: ogUrl });
        } else {
            this._meta.removeTag("property='og:url'");
        }
    }

    /**
     * Updates Twitter Card meta tags
     * Uses fallbacks: twitterTitle → ogTitle → title, twitterDescription → ogDescription → description
     * Default card type: "summary_large_image"
     */
    updateTwitterCard(config: SeoConfig): void {
        const twitterTitle = config.twitterTitle || config.ogTitle || config.title;
        const twitterDescription = config.twitterDescription || config.ogDescription || config.description;
        const twitterImage = config.twitterImage || config.ogImage;
        const twitterCard = config.twitterCard || 'summary_large_image';

        // Update or add twitter:card
        this._meta.updateTag({ name: 'twitter:card', content: twitterCard });

        // Update or add twitter:title
        if (twitterTitle) {
            this._meta.updateTag({ name: 'twitter:title', content: twitterTitle });
        } else {
            this._meta.removeTag("name='twitter:title'");
        }

        // Update or add twitter:description
        if (twitterDescription) {
            this._meta.updateTag({ name: 'twitter:description', content: twitterDescription });
        } else {
            this._meta.removeTag("name='twitter:description'");
        }

        // Update or add twitter:image
        if (twitterImage) {
            this._meta.updateTag({ name: 'twitter:image', content: twitterImage });
        } else {
            this._meta.removeTag("name='twitter:image'");
        }
    }

    /**
     * Sets JSON-LD structured data
     * Removes any existing JSON-LD scripts created by this service and adds a new one
     * This is infrastructure only - we will generate schemas in a later step
     */
    setJsonLd(schema: any): void {
        // Remove existing JSON-LD scripts
        this.clearJsonLd();

        // Create new JSON-LD script
        const script = this._renderer.createElement('script');
        this._renderer.setAttribute(script, 'type', 'application/ld+json');
        const jsonContent = JSON.stringify(schema);
        this._renderer.setProperty(script, 'textContent', jsonContent);
        this._renderer.appendChild(this._document.head, script);

        // Track the script for later removal
        this._jsonLdScripts.push(script);
    }

    /**
     * Removes all JSON-LD script tags created by this service
     */
    clearJsonLd(): void {
        this._jsonLdScripts.forEach(script => {
            if (script.parentNode) {
                this._renderer.removeChild(this._document.head, script);
            }
        });
        this._jsonLdScripts = [];
    }
}

