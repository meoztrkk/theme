import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, RouterModule, RouterLink, LanguagesComponent],
})
export class FooterComponent implements OnInit, OnDestroy {
    currentYear: number = new Date().getFullYear();
    isPublicRoute: boolean = false;

    // Public routes where footer should be visible
    private readonly publicRoutes: string[] = [
        'home',
        'kvkk-clarification-text',
        'clarification-text-pdp',
        'wizard',
        'blog',
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Check initial route
        this._checkRoute();

        // Subscribe to route changes
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._checkRoute();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check if current route is a public route
     */
    private _checkRoute(): void {
        const url = this._router.url;
        const urlSegments = url.split('/').filter((segment) => segment);

        // Exclude admin and user routes first
        const isAdminRoute =
            urlSegments[0] === 'admin' ||
            urlSegments[0] === 'user' ||
            urlSegments[0] === 'example' ||
            urlSegments[0] === 'degerlemelerim' ||
            urlSegments[0] === 'randevularim' ||
            urlSegments[0] === 'offers' ||
            (urlSegments[0] === 'blog' &&
                (urlSegments[1] === 'new' || urlSegments[1] === 'edit'));


        //adminde footer kapat
        if (isAdminRoute) {
            this.isPublicRoute = false;
            this._changeDetectorRef.markForCheck();
            return;
        }


        const isPublic =
            urlSegments.length === 0 ||
            this.publicRoutes.some((route) => {
                if (urlSegments[0] === route) {
                    if (route === 'blog') {
                        return (
                            urlSegments.length === 1 ||
                            (urlSegments.length === 2 &&
                                urlSegments[1] !== 'new' &&
                                urlSegments[1] !== 'edit')
                        );
                    }
                    return true;
                }
                return false;
            });

        this.isPublicRoute = isPublic;
        this._changeDetectorRef.markForCheck();
    }
}

