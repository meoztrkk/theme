import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { AuthDialogComponent } from 'app/modules/sell/auth-dialog/auth-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
    imports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        NgClass,
        MatDividerModule,
        MatDialogModule,
        RouterModule,
    ],
})
export class UserComponent implements OnInit, OnDestroy {
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = false;
    user: User;
    isAuthenticated: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        private _authService: AuthService,
        private _dialog: MatDialog
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Check authentication status
        this._checkAuthentication();

        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to authentication state changes
        this._authService.authenticated$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((isAuthenticated) => {
                console.log('[UserComponent] Authentication state changed, isAuthenticated:', isAuthenticated);
                // Authentication state değiştiğinde kontrol et
                this._checkAuthentication();
            });
    }

    /**
     * Check authentication status
     */
    private _checkAuthentication(): void {
        console.log('[UserComponent._checkAuthentication] Checking authentication status...');
        this._authService.check().subscribe((isAuthenticated) => {
            console.log('[UserComponent._checkAuthentication] Auth check result:', isAuthenticated);
            this.isAuthenticated = isAuthenticated;
            if (isAuthenticated) {
                console.log('[UserComponent._checkAuthentication] User is authenticated, fetching user info...');
                // Try to get user info
                this._authService.getUser().subscribe({
                    next: (user: User) => {
                        console.log('[UserComponent._checkAuthentication] User info fetched:', user);
                        this.user = user;
                        this._changeDetectorRef.markForCheck();
                    },
                    error: (err) => {
                        // If getUser() fails, user might still be authenticated
                        // Just mark as authenticated without user data
                        console.warn('[UserComponent._checkAuthentication] Could not fetch user info, but user is authenticated. Error:', err);
                        // User authenticated ama bilgisi alınamadı, yine de authenticated olarak işaretle
                        this._changeDetectorRef.markForCheck();
                    },
                });
            } else {
                console.log('[UserComponent._checkAuthentication] User is not authenticated');
                this.user = null;
            }
            this._changeDetectorRef.markForCheck();
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
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the user status
     *
     * @param status
     */
    updateUserStatus(status: string): void {
        // Return if user is not available
        if (!this.user) {
            return;
        }

        // Update the user
        this._userService
            .update({
                ...this.user,
                status,
            })
            .subscribe();
    }

    /**
     * Sign in
     */
    signIn(): void {
        const dialogRef = this._dialog.open(AuthDialogComponent, {
            width: '420px',
            panelClass: 'auth-dialog',
            data: { initialView: 'login' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('[UserComponent.signIn] Dialog closed with result:', result);
            if (result === 'authenticated') {
                console.log('[UserComponent.signIn] Authentication successful, checking auth status...');
                // Authentication successful, refresh status
                // Token zaten kaydedildi, direkt check yap
                this._checkAuthentication();
            }
        });
    }

    /**
     * Sign out
     */
    signOut(): void {
        this._authService.signOut().subscribe(() => {
            this.isAuthenticated = false;
            this.user = null;
            this._changeDetectorRef.markForCheck();
            // Navigate to home page after sign out
            this._router.navigate(['/home']);
        });
    }
}
