import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { UserManagementService } from 'app/core/services/user-management.service';
import { RoleService } from 'app/core/services/role.service';
import {
    CreateIdentityUserInput,
    IdentityRoleDto,
    IdentityUserDto,
    UpdateIdentityUserInput,
} from 'app/core/user-management/user-management.types';
import { forkJoin } from 'rxjs';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.scss'],
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NgIf,
        NgFor,
        RouterLink,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatSelectModule,
        MatCardModule,
        MatDividerModule,
    ],
})
export class UserFormComponent implements OnInit {
    userForm!: FormGroup;
    isSaving: boolean = false;
    isEditMode: boolean = false;
    userId: string | null = null;
    isLoading: boolean = false;
    roles: IdentityRoleDto[] = [];
    selectedRoles: string[] = [];

    constructor(
        private _formBuilder: FormBuilder,
        private _userManagementService: UserManagementService,
        private _roleService: RoleService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.userForm = this._formBuilder.group(
            {
                userName: ['', [Validators.required, Validators.maxLength(256)]],
                name: ['', [Validators.maxLength(64)]],
                surname: ['', [Validators.maxLength(64)]],
                email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
                phoneNumber: ['', [Validators.maxLength(16)]],
                password: ['', []], // Required only for create
                confirmPassword: ['', []],
                isActive: [true],
                lockoutEnabled: [true],
                shouldChangePasswordOnNextLogin: [false],
                roleNames: [[]],
            },
            { validators: this._passwordMatchValidator }
        );

        // Load roles first
        this.loadRoles();

        // Check if we're editing or creating
        this._route.paramMap.subscribe((params) => {
            this.userId = params.get('id');
            if (this.userId && this.userId !== 'new') {
                this.isEditMode = true;
                // Password not required in edit mode
                this.userForm.get('password')?.clearValidators();
                this.userForm.get('confirmPassword')?.clearValidators();
                this.userForm.get('password')?.updateValueAndValidity();
                this.userForm.get('confirmPassword')?.updateValueAndValidity();
                this.loadUser(this.userId);
            } else {
                this.isEditMode = false;
                // Password required in create mode
                this.userForm
                    .get('password')
                    ?.setValidators([Validators.required, Validators.minLength(6)]);
                this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
                this.userForm.get('password')?.updateValueAndValidity();
                this.userForm.get('confirmPassword')?.updateValueAndValidity();
            }
        });
    }

    loadRoles(): void {
        this._roleService.getList().subscribe({
            next: (roles) => {
                this.roles = roles;
            },
            error: (err) => {
                console.error('Error loading roles:', err);
                let errorMessage = 'Roller yüklenirken hata oluştu.';
                
                if (err?.status === 401 || err?.status === 403) {
                    errorMessage = 'Rol listesine erişim yetkiniz bulunmamaktadır. Lütfen yönetici ile iletişime geçin.';
                } else if (err?.error?.error?.message) {
                    errorMessage = err.error.error.message;
                } else if (err?.error?.message) {
                    errorMessage = err.error.message;
                }
                
                this._snackBar.open(errorMessage, 'Kapat', {
                    duration: 7000,
                    panelClass: ['error-snackbar'],
                });
            },
        });
    }

    loadUser(id: string): void {
        this.isLoading = true;
        forkJoin({
            user: this._userManagementService.getById(id),
            userRoles: this._userManagementService.getUserRoles(id),
        }).subscribe({
            next: ({ user, userRoles }) => {
                this.selectedRoles = userRoles.map((r) => r.name);
                this.userForm.patchValue({
                    userName: user.userName || '',
                    name: user.name || '',
                    surname: user.surname || '',
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    isActive: user.isActive !== undefined ? user.isActive : true,
                    lockoutEnabled: user.lockoutEnabled !== undefined ? user.lockoutEnabled : true,
                    shouldChangePasswordOnNextLogin:
                        user.shouldChangePasswordOnNextLogin !== undefined
                            ? user.shouldChangePasswordOnNextLogin
                            : false,
                    roleNames: this.selectedRoles,
                });
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading user:', err);
                this._snackBar.open('Kullanıcı yüklenirken hata oluştu.', 'Kapat', {
                    duration: 5000,
                });
                this._router.navigate(['/admin/users']);
                this.isLoading = false;
            },
        });
    }

    save(): void {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        // Validate password match in create mode
        if (!this.isEditMode && this.userForm.hasError('passwordMismatch')) {
            this._snackBar.open('Şifreler eşleşmiyor.', 'Kapat', {
                duration: 3000,
            });
            return;
        }

        this.isSaving = true;
        const formValue = this.userForm.value;

        if (this.isEditMode && this.userId) {
            // Update existing user
            const updateInput: UpdateIdentityUserInput = {
                userName: formValue.userName,
                name: formValue.name,
                surname: formValue.surname,
                email: formValue.email,
                phoneNumber: formValue.phoneNumber,
                isActive: formValue.isActive,
                lockoutEnabled: formValue.lockoutEnabled,
                shouldChangePasswordOnNextLogin: formValue.shouldChangePasswordOnNextLogin,
                roleNames: formValue.roleNames || [],
            };

            // Update user first, then update roles
            this._userManagementService.update(this.userId, updateInput).subscribe({
                next: () => {
                    // Update roles separately
                    this._userManagementService
                        .updateUserRoles(this.userId!, formValue.roleNames || [])
                        .subscribe({
                            next: () => {
                                this._snackBar.open('Kullanıcı başarıyla güncellendi.', 'Kapat', {
                                    duration: 3000,
                                });
                                this._router.navigate(['/admin/users']);
                            },
                            error: (err) => {
                                console.error('Error updating user roles:', err);
                                let errorMessage = 'Kullanıcı rolleri güncellenirken hata oluştu.';
                                
                                if (err?.status === 401 || err?.status === 403) {
                                    errorMessage = 'Kullanıcı rolleri güncelleme yetkiniz bulunmamaktadır. Lütfen yönetici ile iletişime geçin.';
                                } else if (err?.error?.error?.message) {
                                    errorMessage = err.error.error.message;
                                } else if (err?.error?.message) {
                                    errorMessage = err.error.message;
                                }
                                
                                this._snackBar.open(errorMessage, 'Kapat', {
                                    duration: 7000,
                                    panelClass: ['error-snackbar'],
                                });
                                this.isSaving = false;
                            },
                        });
                },
                error: (err) => {
                    console.error('Error updating user:', err);
                    let errorMessage = 'Kullanıcı güncellenirken hata oluştu.';
                    
                    if (err?.status === 401 || err?.status === 403) {
                        errorMessage = 'Kullanıcı güncelleme yetkiniz bulunmamaktadır. Lütfen yönetici ile iletişime geçin.';
                    } else if (err?.error?.error?.message) {
                        errorMessage = err.error.error.message;
                    } else if (err?.error?.message) {
                        errorMessage = err.error.message;
                    }
                    
                    this._snackBar.open(errorMessage, 'Kapat', {
                        duration: 7000,
                        panelClass: ['error-snackbar'],
                    });
                    this.isSaving = false;
                },
            });
        } else {
            // Create new user
            const createInput: CreateIdentityUserInput = {
                userName: formValue.userName,
                name: formValue.name,
                surname: formValue.surname,
                email: formValue.email,
                phoneNumber: formValue.phoneNumber,
                password: formValue.password,
                isActive: formValue.isActive,
                lockoutEnabled: formValue.lockoutEnabled,
                shouldChangePasswordOnNextLogin: formValue.shouldChangePasswordOnNextLogin,
                roleNames: formValue.roleNames || [],
            };

            this._userManagementService.create(createInput).subscribe({
                next: () => {
                    this._snackBar.open('Kullanıcı başarıyla oluşturuldu.', 'Kapat', {
                        duration: 3000,
                    });
                    this._router.navigate(['/admin/users']);
                },
                error: (err) => {
                    console.error('Error creating user:', err);
                    let errorMessage = 'Kullanıcı oluşturulurken hata oluştu.';
                    
                    if (err?.status === 401 || err?.status === 403) {
                        errorMessage = 'Kullanıcı oluşturma yetkiniz bulunmamaktadır. Lütfen yönetici ile iletişime geçin.';
                    } else if (err?.error?.error?.message) {
                        errorMessage = err.error.error.message;
                    } else if (err?.error?.message) {
                        errorMessage = err.error.message;
                    }
                    
                    this._snackBar.open(errorMessage, 'Kapat', {
                        duration: 7000,
                        panelClass: ['error-snackbar'],
                    });
                    this.isSaving = false;
                },
            });
        }
    }

    cancel(): void {
        this._router.navigate(['/admin/users']);
    }

    /**
     * Custom validator for password match
     */
    private _passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        // Only validate if we're in create mode (password is required)
        if (!password || !confirmPassword) {
            return null;
        }

        // If password is empty, don't validate (handled by required validator)
        if (!password.value) {
            return null;
        }

        return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
}

