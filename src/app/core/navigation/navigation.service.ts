import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { distinctUntilChanged, Observable, ReplaySubject, tap } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _authService = inject(AuthService);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);
    private _isReloading = false;

    constructor() {
        // Listen to authentication state changes and reload navigation
        // Use distinctUntilChanged to prevent reload on same value
        this._authService.authenticated$.pipe(
            distinctUntilChanged()
        ).subscribe(() => {
            // Prevent concurrent reloads
            if (!this._isReloading) {
                this._reloadNavigation();
            }
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
        if (this._isReloading) {
            return; // Prevent concurrent reloads
        }

        this._isReloading = true;
        this._httpClient.get<Navigation>('api/common/navigation').subscribe({
            next: (navigation) => {
                this._navigation.next(navigation);
                this._isReloading = false;
            },
            error: () => {
                this._isReloading = false;
            }
        });
    }
}
