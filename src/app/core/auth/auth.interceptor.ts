import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * HTTP Interceptor for authentication
 * Adds Authorization header with Bearer token to all API requests
 * Handles 401 Unauthorized errors by logging out the user
 */
export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    // Get token from localStorage
    const token = localStorage.getItem('accessToken');

    // Clone the request and add Authorization header if token exists
    let newReq = req.clone();

    if (token) {
        newReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
    }

    // Handle response and errors
    return next(newReq).pipe(
        catchError((error: unknown) => {
            // Handle 401 Unauthorized responses
            if (error instanceof HttpErrorResponse && error.status === 401) {
                // Only logout on authentication-related endpoints
                // Don't logout on API endpoints that might return 401 for permission issues
                const url = error.url || '';
                const isAuthEndpoint =
                    url.includes('/connect/token') ||
                    url.includes('/api/account/') ||
                    url.includes('/api/app/app-account/current-user') ||
                    url.includes('/api/identity/my-profile');

                // If it's an auth endpoint, the token is invalid - logout
                if (isAuthEndpoint) {
                    // Clear authentication state
                    authService.signOut();
                    // Reload the page to reset application state
                    location.reload();
                }
                // For other endpoints, 401 might be a permission issue, not authentication
                // Just throw the error without logging out
            }
            return throwError(() => error);
        })
    );
};
