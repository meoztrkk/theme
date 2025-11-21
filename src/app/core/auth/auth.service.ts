import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from 'app/const';
import { AuthUtils } from 'app/core/auth/auth.utils';
import {
    AbpUser,
    AuthResponse,
    LoginRequest,
    PhoneCodeRequest,
    PhoneLoginRequest,
    RegisterByPhoneRequest,
    RegisterRequest,
    VerifyPhoneCodeRequest,
} from 'app/core/auth/auth.types';
import { User } from 'app/core/user/user.types';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _httpClient = inject(HttpClient);
    private _authenticated = new BehaviorSubject<boolean>(false);
    private _user = new BehaviorSubject<User | null>(null);

    // Public observables
    public readonly authenticated$ = this._authenticated.asObservable();
    public readonly user$ = this._user.asObservable();

    // Legacy observable name for backward compatibility
    public readonly authenticationStateChanged$ = this._authenticated.asObservable();

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        if (token) {
            localStorage.setItem('accessToken', token);
            this._checkTokenAndUpdateState();
        } else {
            localStorage.removeItem('accessToken');
            this._authenticated.next(false);
        }
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
     * Get current authenticated state
     */
    get isAuthenticated(): boolean {
        return this._authenticated.value;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in with email and password
     * Uses standard ABP endpoint: POST /api/account/login
     */
    signIn(credentials: LoginRequest): Observable<AuthResponse> {
        if (this._authenticated.value) {
            return throwError(() => new Error('User is already logged in.'));
        }

        // ABP standard login endpoint expects form data
        const formData = new URLSearchParams();
        formData.set('grant_type', 'password');
        formData.set('username', credentials.email);
        formData.set('password', credentials.password);
        formData.set('client_id', 'MEO_DirektSatis_App');
        formData.set('scope', 'offline_access MEO_DirektSatis');

        return this._httpClient
            .post<{ access_token: string; token_type: string; expires_in: number }>(
                `${API_BASE_URL}/connect/token`,
                formData.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            )
            .pipe(
                map((response) => ({
                    accessToken: response.access_token,
                    tokenType: response.token_type,
                    expiresIn: response.expires_in,
                })),
                switchMap((authResponse: AuthResponse) => {
                    this.accessToken = authResponse.accessToken;
                    return this.getUser().pipe(
                        map(() => authResponse),
                        catchError(() => {
                            // Even if getUser fails, login is successful
                            return of(authResponse);
                        })
                    );
                }),
                catchError((error) => {
                    return throwError(() => error);
                })
            );
    }

    /**
     * Sign in with phone number and password
     * Uses custom endpoint: POST /api/app/app-account/login-by-phone
     */
    signInWithPhone(credentials: PhoneLoginRequest): Observable<AuthResponse> {
        if (this._authenticated.value) {
            return throwError(() => new Error('User is already logged in.'));
        }

        return this._httpClient
            .post<{ accessToken: string; tokenType: string; expiresIn: number }>(
                `${API_BASE_URL}/api/app/app-account/login-by-phone`,
                credentials
            )
            .pipe(
                map((response) => ({
                    accessToken: response.accessToken || response['access_token'],
                    tokenType: response.tokenType || response['token_type'] || 'Bearer',
                    expiresIn: response.expiresIn || response['expires_in'] || 3600,
                })),
                switchMap((authResponse: AuthResponse) => {
                    this.accessToken = authResponse.accessToken;
                    return this.getUser().pipe(
                        map(() => authResponse),
                        catchError(() => {
                            // Even if getUser fails, login is successful
                            return of(authResponse);
                        })
                    );
                }),
                catchError((error) => {
                    return throwError(() => error);
                })
            );
    }

    /**
     * Send phone verification code
     * Uses custom endpoint: POST /api/app/app-account/send-phone-code
     */
    sendPhoneCode(phone: string): Observable<void> {
        const request: PhoneCodeRequest = { phoneNumber: phone };
        return this._httpClient.post<void>(`${API_BASE_URL}/api/app/app-account/send-phone-code`, request);
    }

    /**
     * Verify phone code
     * Uses custom endpoint: POST /api/app/app-account/verify-phone-code
     */
    verifyPhoneCode(request: VerifyPhoneCodeRequest): Observable<boolean> {
        return this._httpClient.post<boolean>(`${API_BASE_URL}/api/app/app-account/verify-phone-code`, request);
    }

    /**
     * Sign up with standard ABP registration
     * Uses endpoint: POST /api/account/register
     */
    signUp(data: RegisterRequest): Observable<AbpUser> {
        return this._httpClient.post<AbpUser>(`${API_BASE_URL}/api/account/register`, data);
    }

    /**
     * Sign up with phone-based registration
     * Uses custom endpoint: POST /api/app/app-account/register-by-phone
     */
    signUpByPhone(data: RegisterByPhoneRequest): Observable<AbpUser> {
        return this._httpClient.post<AbpUser>(`${API_BASE_URL}/api/app/app-account/register-by-phone`, data);
    }

    /**
     * Sign out - clear token and reset state
     */
    signOut(): Observable<boolean> {
        localStorage.removeItem('accessToken');
        this._authenticated.next(false);
        this._user.next(null);
        return of(true);
    }

    /**
     * Get current user from backend
     * Uses endpoint: GET /api/app/app-account/current-user
     */
    getUser(): Observable<User> {
        return this._httpClient.get<AbpUser>(`${API_BASE_URL}/api/app/app-account/current-user`).pipe(
            map((abpUser) => this._mapAbpUserToUser(abpUser)),
            tap((user) => {
                this._user.next(user);
            }),
            catchError((error) => {
                // If getUser fails, clear user state
                this._user.next(null);
                return throwError(() => error);
            })
        );
    }

    /**
     * Check authentication status
     */
    check(): Observable<boolean> {
        const token = this.accessToken;
        const currentState = this._authenticated.value;
        let newState: boolean;

        if (!token) {
            newState = false;
        } else if (!this._isJwt(token)) {
            // Non-JWT token, assume valid
            newState = true;
        } else if (AuthUtils.isTokenExpired(token)) {
            newState = false;
            this.accessToken = ''; // Clear expired token
        } else {
            // Token is valid
            newState = true;
        }

        // Only emit if state actually changed
        if (currentState !== newState) {
            this._authenticated.next(newState);
        }

        // Try to fetch user if authenticated and not already loaded
        if (newState && !this._user.value) {
            this.getUser().subscribe({
                error: () => {
                    // Silent fail - token might be valid but user endpoint might fail
                },
            });
        }

        return of(newState);
    }

    /**
     * Legacy method for external token sign-in (kept for backward compatibility)
     */
    signInWithExternalToken(token: string, user?: User | null): void {
        this.accessToken = token;
        if (user) {
            this._user.next(user);
        } else {
            // Try to fetch user
            this.getUser().subscribe({
                error: () => {
                    // Silent fail
                },
            });
        }
    }

    /**
     * Update user profile
     * Uses custom endpoint: POST /api/app/app-account/update-profile
     */
    updateProfile(name: string, surname: string): Observable<AbpUser> {
        return this._httpClient.post<AbpUser>(`${API_BASE_URL}/api/app/app-account/update-profile`, {
            name,
            surname,
        }).pipe(
            tap((abpUser) => {
                const user = this._mapAbpUserToUser(abpUser);
                this._user.next(user);
            })
        );
    }

    /**
     * Change password
     * Uses custom endpoint: POST /api/app/app-account/change-password
     */
    changePassword(currentPassword: string, newPassword: string): Observable<void> {
        return this._httpClient.post<void>(`${API_BASE_URL}/api/app/app-account/change-password`, {
            currentPassword,
            newPassword,
        });
    }

    /**
     * Get current user (alias for getUser, kept for backward compatibility)
     * Uses endpoint: GET /api/app/app-account/current-user
     */
    me(): Observable<AbpUser> {
        return this._httpClient.get<AbpUser>(`${API_BASE_URL}/api/app/app-account/current-user`);
    }

    /**
     * Forgot password
     * Note: This is a placeholder - implement with actual ABP endpoint when available
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        // TODO: Implement with actual ABP forgot password endpoint
        return this._httpClient.post(`${API_BASE_URL}/api/account/forgot-password`, { email });
    }

    /**
     * Reset password
     * Note: This is a placeholder - implement with actual ABP endpoint when available
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        // TODO: Implement with actual ABP reset password endpoint
        return this._httpClient.post(`${API_BASE_URL}/api/account/reset-password`, { password });
    }

    /**
     * Unlock session
     * Note: This is a placeholder - implement with actual ABP endpoint when available
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        // TODO: Implement with actual ABP unlock session endpoint
        return this._httpClient.post(`${API_BASE_URL}/api/account/unlock-session`, credentials);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check token and update authentication state
     * Only emits if state actually changes
     */
    private _checkTokenAndUpdateState(): void {
        const token = this.accessToken;
        const currentState = this._authenticated.value;
        let newState: boolean;

        if (!token) {
            newState = false;
        } else if (this._isJwt(token) && AuthUtils.isTokenExpired(token)) {
            newState = false;
        } else {
            newState = true;
        }

        // Only emit if state actually changed
        if (currentState !== newState) {
            this._authenticated.next(newState);
        }
    }

    /**
     * Check if token is JWT format
     */
    private _isJwt(token: string): boolean {
        if (!token) {
            return false;
        }
        return token.split('.').length === 3;
    }

    /**
     * Map ABP User DTO to internal User type
     */
    private _mapAbpUserToUser(abpUser: AbpUser): User {
        return {
            id: abpUser.id || '',
            name: abpUser.name && abpUser.surname ? `${abpUser.name} ${abpUser.surname}`.trim() : abpUser.name || abpUser.userName || '',
            email: abpUser.email,
            phoneNumber: abpUser.phoneNumber,
            avatar: abpUser.avatar,
            status: abpUser.status || 'online',
        };
    }
}
