import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { SeoRouteListener } from './core/seo/seo-route.listener';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet],
})
export class AppComponent {
    /**
     * Constructor
     */
    constructor(
        private authService: AuthService,
        private _seoRouteListener: SeoRouteListener
    ) {
        // Initialize SEO route listener to automatically apply SEO from route data
        this._seoRouteListener.initialize();
        // this.authService.check().subscribe();
    }
}
