import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SeoService } from './seo.service';
import { SeoConfig } from './seo-config.model';
import { defaultSeoConfig } from './default-seo.config';
import { SeoPageStoreService } from './seo-page-store.service';
import { mapSeoPageToSeoConfig } from './seo-mapper';

/**
 * SEO Route Listener
 *
 * Automatically applies SEO configuration from route data on navigation.
 *
 * Priority order:
 * 1. If route has `seoKey`: try to load SeoPage from backend store
 * 2. If not found or no seoKey: fallback to `route.data.seo`
 * 3. If neither exists: fallback to defaultSeoConfig
 */
@Injectable({ providedIn: 'root' })
export class SeoRouteListener {
    private _router = inject(Router);
    private _seoService = inject(SeoService);
    private _seoPageStore = inject(SeoPageStoreService);

    /**
     * Initialize the route listener
     * Should be called once in app initialization (e.g., in app.component.ts constructor)
     */
    initialize(): void {
        // Load SEO pages from backend (non-blocking)
        this._seoPageStore.loadAllIfNeeded().subscribe({
            error: (err) => {
                // Silently fail - we'll fallback to route.data.seo or defaultSeoConfig
                console.warn('Failed to load SEO pages from backend, using fallback SEO config', err);
            }
        });

        // Listen to navigation end events
        this._router.events
            .pipe(
                filter(event => event instanceof NavigationEnd)
            )
            .subscribe(() => {
                const route = this._getDeepestActivatedRoute();
                if (route) {
                    this._applyRouteSeo(route);
                }
            });

        // Apply SEO for initial route
        const initialRoute = this._getDeepestActivatedRoute();
        if (initialRoute) {
            this._applyRouteSeo(initialRoute);
        }
    }

    /**
     * Gets the deepest activated route (the leaf route)
     */
    private _getDeepestActivatedRoute(): ActivatedRoute | null {
        let route = this._router.routerState.root;
        while (route.firstChild) {
            route = route.firstChild;
        }
        return route;
    }

    /**
     * Applies SEO configuration from route data
     *
     * Priority:
     * 1. If seoKey exists: try to get SeoPage from backend store
     * 2. If not found: fallback to route.data.seo
     * 3. If neither exists: fallback to defaultSeoConfig
     */
    private _applyRouteSeo(route: ActivatedRoute): void {
        const routeData = route.snapshot.data;
        const seoKey = routeData['seoKey'] as string | undefined;
        const seoData = routeData['seo'] as Partial<SeoConfig> | undefined;

        let finalConfig: SeoConfig | null = null;

        // Priority 1: Try to get from backend store if seoKey is present
        if (seoKey) {
            const seoPage = this._seoPageStore.getByRouteName(seoKey);
            if (seoPage) {
                // Map SeoPage to SeoConfig and merge with default
                const mappedConfig = mapSeoPageToSeoConfig(seoPage);
                finalConfig = {
                    ...defaultSeoConfig,
                    ...mappedConfig,
                };
            }
        }

        // Priority 2: Fallback to route.data.seo if backend data not found
        if (!finalConfig && seoData && this._isValidSeoConfig(seoData)) {
            finalConfig = {
                ...defaultSeoConfig,
                ...seoData,
            };
        }

        // Priority 3: Fallback to default config
        if (!finalConfig) {
            finalConfig = defaultSeoConfig;
        }

        this._seoService.applySeo(finalConfig);
    }

    /**
     * Validates if the provided data is a valid SEO config
     * At minimum, it should have a title or be a non-empty object
     */
    private _isValidSeoConfig(data: any): data is Partial<SeoConfig> {
        return data && typeof data === 'object' && Object.keys(data).length > 0;
    }
}

