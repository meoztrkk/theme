import { inject, Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from 'app/core/user/user.types';
import { Observable } from 'rxjs';

/**
 * User Service
 * Delegates to AuthService for user state management
 * Provides a single source of truth for user data
 */
@Injectable({ providedIn: 'root' })
export class UserService {
    private _authService = inject(AuthService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter for user (delegates to AuthService)
     * @param value
     */
    set user(value: User) {
        // Note: This is kept for backward compatibility
        // The AuthService manages user state internally
        // If needed, we can emit to a local subject, but it's better to use AuthService.user$ directly
    }

    /**
     * Getter for user observable (delegates to AuthService)
     */
    get user$(): Observable<User | null> {
        return this._authService.user$;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     * Delegates to AuthService.getUser()
     */
    get(): Observable<User> {
        return this._authService.getUser();
    }

    /**
     * Update the user
     * Note: This method is kept for backward compatibility
     * In a real implementation, you would call an update endpoint
     * @param user
     */
    update(user: User): Observable<User> {
        // This would typically call an API endpoint to update user
        // For now, we'll just return the user as-is
        // TODO: Implement actual update endpoint call
        return new Observable((subscriber) => {
            subscriber.next(user);
            subscriber.complete();
        });
    }
}
