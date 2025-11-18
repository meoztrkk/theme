import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SeoPageService } from '../services/seo-page.service';
import { SeoPage } from './seo-page.model';

/**
 * SEO Page Store Service
 *
 * Manages in-memory cache of active SeoPage entries from the backend.
 * Provides methods to load and retrieve SEO pages by route name.
 */
@Injectable({
    providedIn: 'root'
})
export class SeoPageStoreService {
    private seoPagesByRouteName = new Map<string, SeoPage>();
    private isLoaded = false;
    private isLoading = false;

    constructor(private seoPageService: SeoPageService) {}

    /**
     * Loads all active SEO pages from the backend if not already loaded
     * @returns Observable that completes when loading is done
     */
    loadAllIfNeeded(): Observable<void> {
        if (this.isLoaded) {
            return of(void 0);
        }

        if (this.isLoading) {
            // If already loading, wait for it to complete
            // For simplicity, we'll just return void 0 here
            // In a more sophisticated implementation, we could queue observers
            return of(void 0);
        }

        this.isLoading = true;

        return this.seoPageService.getList({
            skipCount: 0,
            maxResultCount: 1000,
            sorting: 'name'
        }).pipe(
            map(result => {
                // Filter only active records and populate the cache
                this.seoPagesByRouteName.clear();
                result.items
                    .filter(page => page.isActive !== false)
                    .forEach(page => {
                        // Normalize route name to lowercase for case-insensitive lookup
                        const normalizedRouteName = this.normalizeRouteName(page.routeName);
                        this.seoPagesByRouteName.set(normalizedRouteName, page);
                    });
                this.isLoaded = true;
                this.isLoading = false;
            }),
            tap({
                error: () => {
                    // On error, mark as not loading but don't mark as loaded
                    // This allows retry on next access
                    this.isLoading = false;
                }
            })
        );
    }

    /**
     * Gets a SeoPage by route name
     * @param routeName The route name to look up
     * @param culture Optional culture code (not fully implemented yet)
     * @returns The found SeoPage or null
     */
    getByRouteName(routeName: string, culture?: string): SeoPage | null {
        const normalizedRouteName = this.normalizeRouteName(routeName);
        const page = this.seoPagesByRouteName.get(normalizedRouteName);

        // TODO: Add culture filtering when multi-language support is implemented
        // For now, we return the first match regardless of culture

        return page || null;
    }

    /**
     * Refreshes the cache by reloading all SEO pages from the backend
     * @returns Observable that completes when refresh is done
     */
    refresh(): Observable<void> {
        this.isLoaded = false;
        this.isLoading = false;
        return this.loadAllIfNeeded();
    }

    /**
     * Normalizes a route name for consistent lookup
     * Converts to lowercase and trims whitespace
     */
    private normalizeRouteName(routeName: string): string {
        return routeName.trim().toLowerCase();
    }
}

