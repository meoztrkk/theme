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
import { Router } from '@angular/router';
import { AuthPhoneService } from 'app/core/auth/auth-phone.service';
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
        private _authPhoneService: AuthPhoneService,
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
    }

    /**
     * Check authentication status
     */
    private _checkAuthentication(): void {
        this._authService.check().subscribe((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;
            if (isAuthenticated) {
                // Try to get user info
                this._authPhoneService.me().subscribe({
                    next: (userData: any) => {
                        // Map user data to User type
                        const user: User = {
                            id: userData.id || '',
                            name: `${userData.name || ''} ${userData.surname || ''}`.trim() || userData.userName || '',
                            email: userData.email,
                            phoneNumber: userData.phoneNumber,
                            avatar: userData.avatar,
                            status: 'online',
                        };
                        this._userService.user = user;
                        this.user = user;
                        this._changeDetectorRef.markForCheck();
                    },
                    error: (err) => {
                        // If me() fails, user might still be authenticated
                        // Just mark as authenticated without user data
                        console.warn('Could not fetch user info', err);
                        this._changeDetectorRef.markForCheck();
                    },
                });
            } else {
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
            if (result === 'authenticated') {
                // Authentication successful, refresh status
                this._checkAuthentication();
                // Try to get user info from auth phone service
                // Note: This might need to be adjusted based on your API structure
                setTimeout(() => {
                    // Give time for token to be saved
                    this._checkAuthentication();
                }, 100);
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
            // Optionally navigate to home or wizard
            // this._router.navigate(['/wizard']);
        });
    }
}
