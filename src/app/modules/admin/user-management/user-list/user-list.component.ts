import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from 'app/core/services/user-management.service';
import { IdentityUserDto } from 'app/core/user-management/user-management.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        RouterLink,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatSnackBarModule,
    ],
})
export class UserListComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['name', 'email', 'phone', 'roles', 'status', 'actions'];
    users: IdentityUserDto[] = [];
    totalCount: number = 0;
    isLoading: boolean = false;
    hasPermissionError: boolean = false;

    // Pagination
    pageSize: number = 10;
    pageIndex: number = 0;
    pageSizeOptions: number[] = [5, 10, 25, 50, 100];

    // Search
    searchTerm: string = '';
    private _searchSubject = new Subject<string>();
    private _destroy$ = new Subject<void>();

    constructor(
        private _userManagementService: UserManagementService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar
    ) {
        // Setup search debounce
        this._searchSubject
            .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this._destroy$))
            .subscribe(() => {
                this.pageIndex = 0;
                this.loadUsers();
            });
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    loadUsers(): void {
        this.isLoading = true;
        this._userManagementService
            .getList({
                filter: this.searchTerm || undefined,
                skipCount: this.pageIndex * this.pageSize,
                maxResultCount: this.pageSize,
                sorting: 'creationTime DESC',
            })
            .subscribe({
                next: (result) => {
                    this.users = result.items || [];
                    this.totalCount = result.totalCount || 0;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading users:', err);
                    let errorMessage = 'Kullanıcılar yüklenirken hata oluştu.';

                    if (err?.status === 401 || err?.status === 403) {
                        this.hasPermissionError = true;
                        errorMessage = 'Bu işlem için yetkiniz bulunmamaktadır. Lütfen yönetici ile iletişime geçin.';
                    } else if (err?.error?.error?.message) {
                        errorMessage = err.error.error.message;
                    } else if (err?.error?.message) {
                        errorMessage = err.error.message;
                    }

                    this._snackBar.open(errorMessage, 'Kapat', {
                        duration: 7000,
                        panelClass: ['error-snackbar'],
                    });
                    this.isLoading = false;
                },
            });
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadUsers();
    }

    onSearchChange(): void {
        this._searchSubject.next(this.searchTerm);
    }

    createNew(): void {
        this._router.navigate(['/admin/users/new']);
    }

    edit(id: string): void {
        this._router.navigate(['/admin/users', id]);
    }

    delete(id: string, userName: string): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Kullanıcıyı Sil',
            message: `"${userName}" adlı kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
            actions: {
                confirm: {
                    label: 'Sil',
                    color: 'warn',
                },
                cancel: {
                    label: 'İptal',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._userManagementService.delete(id).subscribe({
                    next: () => {
                        this._snackBar.open('Kullanıcı başarıyla silindi.', 'Kapat', {
                            duration: 3000,
                        });
                        this.loadUsers();
                    },
                    error: (err) => {
                        console.error('Error deleting user:', err);
                        const errorMessage =
                            err?.error?.error?.message ||
                            err?.error?.message ||
                            'Kullanıcı silinirken hata oluştu.';
                        this._snackBar.open(errorMessage, 'Kapat', {
                            duration: 5000,
                        });
                    },
                });
            }
        });
    }

    getDisplayName(user: IdentityUserDto): string {
        if (user.name && user.surname) {
            return `${user.name} ${user.surname}`;
        }
        if (user.name) {
            return user.name;
        }
        return user.userName || '';
    }

    getRolesDisplay(user: IdentityUserDto): string {
        if (!user.roles || user.roles.length === 0) {
            return '-';
        }
        return user.roles.map((r) => r.name).join(', ');
    }
}

