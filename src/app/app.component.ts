import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { SeoRouteListener } from './core/seo/seo-route.listener';
import { GlobalSeoSettingService } from './core/services/global-seo-setting.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
    /**
     * Constructor
     */
    constructor(
        private authService: AuthService,
        private _seoRouteListener: SeoRouteListener,
        private _globalSeoSettingService: GlobalSeoSettingService
    ) {
        // Initialize SEO route listener to automatically apply SEO from route data
        this._seoRouteListener.initialize();
        // this.authService.check().subscribe();
    }

    ngOnInit(): void {
        // Fetch and inject global head code
        this._globalSeoSettingService.get().subscribe({
            next: (setting) => {
                const headCode = setting?.headCode;
                if (headCode && headCode.trim().length > 0) {
                    try {
                        const head = document.head || document.getElementsByTagName('head')[0];
                        head.insertAdjacentHTML('beforeend', headCode);
                    } catch (error) {
                        console.warn('Failed to inject global head code', error);
                    }
                }
            },
            error: (err) => {
                console.warn('Failed to load global SEO settings', err);
            },
        });
    }
}
