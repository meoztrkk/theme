import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _authService = inject(AuthService);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    constructor() {
        // Listen to authentication state changes and reload navigation
        this._authService.authenticationStateChanged$.subscribe(() => {
            this._reloadNavigation();
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                this._navigation.next(navigation);
            })
        );
    }

    /**
     * Reload navigation data
     */
    private _reloadNavigation(): void {
        this._httpClient.get<Navigation>('api/common/navigation').subscribe((navigation) => {
            this._navigation.next(navigation);
        });
    }
}
