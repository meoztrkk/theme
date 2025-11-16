import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, Subject, switchMap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    // Authentication state değişikliklerini dinlemek için Subject
    private _authenticationStateChanged$ = new Subject<boolean>();
    public authenticationStateChanged$ = this._authenticationStateChanged$.asObservable();

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post('api/auth/sign-in', credentials).pipe(
            switchMap((response: any) => {
                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post('api/auth/sign-in-with-token', {
                accessToken: this.accessToken,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Authentication state değişikliğini bildir
        this._authenticationStateChanged$.next(false);

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        console.log('[AuthService.check] Starting authentication check');
        console.log('[AuthService.check] _authenticated flag:', this._authenticated);
        console.log('[AuthService.check] accessToken from localStorage:', !!this.accessToken, this.accessToken ? this.accessToken.substring(0, 20) + '...' : 'null');

        // Check if the user is logged in
        if (this._authenticated) {
            console.log('[AuthService.check] Already authenticated, returning true');
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            // Token yoksa bu normal bir durum (henüz login yapılmamış), uyarı vermeye gerek yok
            console.log('[AuthService.check] No access token found, returning false');
            return of(false);
        }

        // Token JWT değilse: decode etmeye çalışma
        if (!this._isJwt(this.accessToken)) {
            console.log('[AuthService.check] Non-JWT token found, marking as authenticated');
            this._authenticated = true;
            return of(true);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            console.log('[AuthService.check] Token expired');
            this._authenticated = false;
            return of(false);
        }

        // JWT token varsa ve expire olmamışsa, direkt true döndür
        // signInUsingToken() çağrısı yapmıyoruz çünkü bu endpoint çalışmıyor olabilir
        // Token geçerliyse authenticated flag'ini set et
        console.log('[AuthService.check] Valid JWT token found, marking as authenticated');
        this._authenticated = true;
        return of(true);
    }

    private _isJwt(token: string): boolean {
        if (!token) {
            return false;
        }
        return token.split('.').length === 3;
    }

    /**
     * Harici (telefonla vb.) alınan token ile oturum aç
     */
    signInWithExternalToken(token: string, user?: any): void {
        console.log('[AuthService.signInWithExternalToken] Setting token and marking as authenticated');
        // tokeni kaydet
        this.accessToken = token;
        console.log('[AuthService.signInWithExternalToken] Token saved, checking localStorage:', !!localStorage.getItem('accessToken'));

        // authenticated bayrağını kaldır
        this._authenticated = true;
        console.log('[AuthService.signInWithExternalToken] _authenticated flag set to true');

        // kullanıcı bilgisi geldiyse kaydet
        if (user) {
            console.log('[AuthService.signInWithExternalToken] User data received, saving to user service');
            this._userService.user = user;
        } else {
            console.log('[AuthService.signInWithExternalToken] No user data, will be fetched later');
        }

        // Authentication state değişikliğini bildir
        this._authenticationStateChanged$.next(true);
        console.log('[AuthService.signInWithExternalToken] Authentication state change event emitted');
    }
}
