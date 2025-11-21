import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from 'app/core/auth/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

interface UserProfile {
    id: string;
    name?: string;
    surname?: string;
    email?: string;
    phoneNumber?: string;
    userName?: string;
}

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatTabsModule,
    ],
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    passwordForm: FormGroup;
    userProfile: UserProfile | null = null;
    loading = true;
    savingProfile = false;
    changingPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {
        this.profileForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(64)]],
            surname: ['', [Validators.required, Validators.maxLength(64)]],
            email: [{ value: '', disabled: true }],
            phoneNumber: [{ value: '', disabled: true }],
        });

        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
        }, { validators: this.passwordMatchValidator.bind(this) });
    }

    ngOnInit(): void {
        this.loadUserProfile();
    }

    loadUserProfile(): void {
        this.loading = true;
        this.authService.me().pipe(
            catchError((err) => {
                console.error('Error loading user profile:', err);
                this.snackBar.open('Profil bilgileri yüklenirken bir hata oluştu.', 'Kapat', { duration: 5000 });
                return of(null);
            }),
            finalize(() => {
                this.loading = false;
            })
        ).subscribe((userData: any) => {
            if (userData) {
                this.userProfile = {
                    id: userData.id,
                    name: userData.name,
                    surname: userData.surname,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    userName: userData.userName,
                };

                this.profileForm.patchValue({
                    name: userData.name || '',
                    surname: userData.surname || '',
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || '',
                });
            }
        });
    }

    passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
        const newPassword = form.get('newPassword');
        const confirmPassword = form.get('confirmPassword');

        if (!newPassword || !confirmPassword) {
            return null;
        }

        if (newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        if (confirmPassword.hasError('passwordMismatch') && newPassword.value === confirmPassword.value) {
            const errors = { ...confirmPassword.errors };
            delete errors['passwordMismatch'];
            confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }

        return null;
    }

    saveProfile(): void {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }

        this.savingProfile = true;
        const { name, surname } = this.profileForm.value;

        this.authService.updateProfile(name, surname).pipe(
            catchError((err) => {
                console.error('Error updating profile:', err);
                const errorMessage = err.error?.message || 'Profil güncellenirken bir hata oluştu.';
                this.snackBar.open(errorMessage, 'Kapat', { duration: 5000 });
                return of(null);
            }),
            finalize(() => {
                this.savingProfile = false;
            })
        ).subscribe((result) => {
            if (result) {
                this.snackBar.open('Profil bilgileri başarıyla güncellendi.', 'Kapat', {
                    duration: 3000,
                    panelClass: ['bg-green-600']
                });
                this.loadUserProfile(); // Refresh profile data
            }
        });
    }

    changePassword(): void {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }

        this.changingPassword = true;
        const { currentPassword, newPassword } = this.passwordForm.value;

        this.authService.changePassword(currentPassword, newPassword).pipe(
            catchError((err) => {
                console.error('Error changing password:', err);
                const errorMessage = err.error?.message || 'Şifre değiştirilirken bir hata oluştu.';
                this.snackBar.open(errorMessage, 'Kapat', { duration: 5000 });
                return throwError(() => err);
            }),
            finalize(() => {
                this.changingPassword = false;
            })
        ).subscribe({
            next: () => {
                // Başarılı durumda mesaj göster
                this.snackBar.open('Şifre başarıyla değiştirildi.', 'Kapat', {
                    duration: 3000,
                    panelClass: ['bg-green-600']
                });
                // Form'u reset et ve state'ini temizle
                this.passwordForm.reset();
                this.passwordForm.markAsUntouched();
                this.passwordForm.markAsPristine();
                // Tüm kontrollerin state'ini de temizle
                Object.keys(this.passwordForm.controls).forEach(key => {
                    this.passwordForm.get(key)?.markAsUntouched();
                    this.passwordForm.get(key)?.markAsPristine();
                });
            },
            error: () => {
                // Hata durumu catchError içinde zaten handle ediliyor
            }
        });
    }

    getErrorMessage(fieldName: string): string {
        const field = this.profileForm.get(fieldName);
        if (field?.hasError('required')) {
            return 'Bu alan zorunludur';
        }
        if (field?.hasError('maxlength')) {
            return `Maksimum ${field.errors?.['maxlength'].requiredLength} karakter olmalıdır`;
        }
        return '';
    }

    getPasswordErrorMessage(fieldName: string): string {
        const field = this.passwordForm.get(fieldName);
        if (field?.hasError('required')) {
            return 'Bu alan zorunludur';
        }
        if (field?.hasError('minlength')) {
            return `Minimum ${field.errors?.['minlength'].requiredLength} karakter olmalıdır`;
        }
        if (field?.hasError('passwordMismatch')) {
            return 'Şifreler eşleşmiyor';
        }
        return '';
    }
}

