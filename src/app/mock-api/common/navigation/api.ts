import { Injectable, inject } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import {
    compactNavigation,
    defaultNavigation,
    futuristicNavigation,
    horizontalNavigation,
} from 'app/mock-api/common/navigation/data';
import { cloneDeep } from 'lodash-es';
import { AuthService } from 'app/core/auth/auth.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavigationMockApi {
    private readonly _compactNavigation: FuseNavigationItem[] =
        compactNavigation;
    private readonly _defaultNavigation: FuseNavigationItem[] =
        defaultNavigation;
    private readonly _futuristicNavigation: FuseNavigationItem[] =
        futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] =
        horizontalNavigation;
    private readonly _authService = inject(AuthService);

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService.onGet('api/common/navigation').reply(() => {
            // Check authentication status and return Observable
            return this._authService.check().pipe(
                map((isAuthenticated) => {
                    // Helper function to filter blog children based on authentication
                    const filterBlogChildren = (children: FuseNavigationItem[] | undefined): FuseNavigationItem[] | undefined => {
                        if (!children) return undefined;
                        // If authenticated, return all children, otherwise filter out "Blog Ekle"
                        if (isAuthenticated) {
                            return cloneDeep(children);
                        }
                        return cloneDeep(children).filter((child) => child.id !== 'blog.form');
                    };

                    // Fill compact navigation children using the default navigation
                    this._compactNavigation.forEach((compactNavItem) => {
                        this._defaultNavigation.forEach((defaultNavItem) => {
                            if (defaultNavItem.id === compactNavItem.id) {
                                if (defaultNavItem.id === 'blog') {
                                    compactNavItem.children = filterBlogChildren(defaultNavItem.children);
                                } else {
                                    compactNavItem.children = cloneDeep(defaultNavItem.children);
                                }
                            }
                        });
                    });

                    // Fill futuristic navigation children using the default navigation
                    this._futuristicNavigation.forEach((futuristicNavItem) => {
                        this._defaultNavigation.forEach((defaultNavItem) => {
                            if (defaultNavItem.id === futuristicNavItem.id) {
                                if (defaultNavItem.id === 'blog') {
                                    futuristicNavItem.children = filterBlogChildren(defaultNavItem.children);
                                } else {
                                    futuristicNavItem.children = cloneDeep(defaultNavItem.children);
                                }
                            }
                        });
                    });

                    // Fill horizontal navigation children using the default navigation
                    this._horizontalNavigation.forEach((horizontalNavItem) => {
                        this._defaultNavigation.forEach((defaultNavItem) => {
                            if (defaultNavItem.id === horizontalNavItem.id) {
                                if (defaultNavItem.id === 'blog') {
                                    horizontalNavItem.children = filterBlogChildren(defaultNavItem.children);
                                } else {
                                    horizontalNavItem.children = cloneDeep(defaultNavItem.children);
                                }
                            }
                        });
                    });

                    // Filter default navigation blog children
                    const filteredDefaultNavigation = cloneDeep(this._defaultNavigation).map((item) => {
                        if (item.id === 'blog') {
                            return {
                                ...item,
                                children: filterBlogChildren(item.children),
                            };
                        }
                        return item;
                    });

                    // Return the response
                    return [
                        200,
                        {
                            compact: cloneDeep(this._compactNavigation),
                            default: filteredDefaultNavigation,
                            futuristic: cloneDeep(this._futuristicNavigation),
                            horizontal: cloneDeep(this._horizontalNavigation),
                        },
                    ];
                })
            );
        });
    }
}
