import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    Inject,
    QueryList,
    ViewChildren,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { AuthPhoneService } from 'app/core/auth/auth-phone.service';
import { AuthService } from 'app/core/auth/auth.service';

type AuthView = 'login' | 'register' | 'verify' | 'forgot-password';

@Component({
    selector: 'app-auth-dialog',
    templateUrl: './auth-dialog.component.html',
    styleUrls: ['./auth-dialog.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        RouterModule,
    ],
})
export class AuthDialogComponent {
    view: AuthView = 'register';
    phoneForVerify = '';

    // verify inputlarını yakalamak için
    @ViewChildren('codeInput')
    codeInputs!: QueryList<ElementRef<HTMLInputElement>>;

    registerForm: FormGroup;
    loginForm = this.fb.group({
        phone: ['', [Validators.required]],
        password: ['', [Validators.required]],
    });
    forgotPasswordForm = this.fb.group({
        phone: ['', [Validators.required]],
    });
    verifyForm = this.fb.group({
        code1: ['', [Validators.required]],
        code2: ['', [Validators.required]],
        code3: ['', [Validators.required]],
        code4: ['', [Validators.required]],
    });

    countdown = 120;
    isSending = false;
    errorMessage: string | null = null;
    private countdownTimer: any = null;

    // örnek test kodları (backend hazır değilken)
    private testCodes = ['1234', '0000'];

    constructor(
        private dialogRef: MatDialogRef<AuthDialogComponent>,
        private fb: FormBuilder,
        private authPhone: AuthPhoneService,
        private appAuth: AuthService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        console.log('[AuthDialog.constructor] Dialog initialized with data:', data);
        // Initial view'ı data'dan al, yoksa default 'register'
        if (data?.initialView) {
            this.view = data.initialView;
            console.log('[AuthDialog.constructor] Initial view set to:', this.view);
        } else {
            console.log('[AuthDialog.constructor] No initial view provided, using default:', this.view);
        }

        this.registerForm = this.fb.group({
            phone: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            consentCommercial: [false, [Validators.requiredTrue]],
            consentTerms: [false, [Validators.requiredTrue]],
        });
    }

    // +905xx ... formatına sokmak istersen
    private normalizePhone(raw: string): string {
        let p = raw.replace(/[^\d]/g, '');
        if (p.startsWith('0')) {
            p = p.substring(1);
        }
        if (!p.startsWith('90')) {
            p = '90' + p;
        }
        return '+' + p;
    }

    /* --------------------- KAYIT --------------------- */
    submitRegister() {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        const raw = this.registerForm.getRawValue();
        const phone = (raw.phone || '').trim();
        const normalizedPhone = this.normalizePhone(phone);
        const firstName = raw.firstName?.trim() || '';
        const lastName = raw.lastName?.trim() || '';
        const email = raw.email?.trim() || '';
        const password = raw.password;

        this.isSending = true;

        this.errorMessage = null;
        this.authPhone
            .registerByPhone({
                phoneNumber: normalizedPhone,
                password: password!,
                firstName: firstName,
                lastName: lastName,
                emailAddress: email,
            })
            .subscribe({
                next: () => {
                    this.isSending = false;
                    this.phoneForVerify = normalizedPhone;
                    // SMS gönder
                    this.authPhone.sendSms(normalizedPhone).subscribe({
                        next: () => {
                            this.countdown = 120;
                            this.startCountdown();
                        },
                        error: (err) => {
                            console.error('SMS send failed', err);
                            // SMS gönderilemese bile verify ekranına geç
                        },
                    });
                    this.switchTo('verify');
                },
                error: (err) => {
                    this.isSending = false;
                    console.error('Register failed', err);
                    // Hata mesajını kullanıcıya göster
                    if (err?.error?.error?.message) {
                        this.errorMessage = err.error.error.message;
                    } else if (err?.error?.message) {
                        this.errorMessage = err.error.message;
                    } else if (err?.message) {
                        this.errorMessage = err.message;
                    } else {
                        this.errorMessage = 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.';
                    }
                },
            });
    }

    /* --------------------- GİRİŞ --------------------- */
    submitLogin(event?: Event) {
        if (event) {
            event.preventDefault();
        }
        console.log('[AuthDialog.submitLogin] Login form submitted');
        console.log('[AuthDialog.submitLogin] Form value:', this.loginForm.value);
        console.log('[AuthDialog.submitLogin] Form valid:', this.loginForm.valid);
        if (this.loginForm.invalid) {
            console.log('[AuthDialog.submitLogin] Form is invalid, errors:', this.loginForm.errors);
            this.loginForm.markAllAsTouched();
            return;
        }

        const raw = this.loginForm.getRawValue();
        const phone = (raw.phone || '').trim();
        const password = (raw.password || '').trim();
        const normalizedPhone = this.normalizePhone(phone);

        console.log('[AuthDialog.submitLogin] Calling loginByPhone with phone:', normalizedPhone);
        this.isSending = true;

        this.errorMessage = null;
        this.authPhone
            .loginByPhone({
                phoneNumber: normalizedPhone,
                password: password,
            })
            .subscribe({
                next: (res: any) => {
                    this.isSending = false;
                    const token = res?.accessToken || res?.access_token;

                    if (!token) {
                        this.errorMessage = 'Giriş başarısız oldu. Token alınamadı.';
                        console.error('Login failed - no token received');
                        return;
                    }

                    console.log('[AuthDialog] Login successful, token received:', token.substring(0, 20) + '...');
                    const isJwt = token && token.split('.').length === 3;

                    // Token'ı önce kaydet
                    this.appAuth.accessToken = token;
                    console.log('[AuthDialog] Token saved to localStorage');

                    if (isJwt) {
                        // JWT token ise kullanıcı bilgisini almayı dene
                        // Token kaydedildi, interceptor otomatik header'a ekleyecek
                        console.log('[AuthDialog] JWT token detected, fetching user profile...');
                        this.authPhone.me().subscribe({
                            next: (profile) => {
                                console.log('[AuthDialog] User profile fetched successfully:', profile);
                                this.appAuth.signInWithExternalToken(token, profile);
                                this.dialogRef.close('authenticated');
                            },
                            error: (err) => {
                                // me() başarısız olsa bile token kaydedildi, giriş başarılı sayılabilir
                                // 403 hatası gelirse bile token geçerli olabilir (endpoint yetkilendirme sorunu olabilir)
                                console.warn('[AuthDialog] Could not fetch user profile, but login successful. Error:', err);
                                console.log('[AuthDialog] Proceeding with login without user profile');
                                this.appAuth.signInWithExternalToken(token, null);
                                this.dialogRef.close('authenticated');
                            },
                        });
                    } else {
                        // JWT değilse direkt token ile giriş yap
                        console.log('[AuthDialog] Non-JWT token, proceeding with login');
                        this.appAuth.signInWithExternalToken(token, null);
                        this.dialogRef.close('authenticated');
                    }
                },
                error: (err) => {
                    this.isSending = false;
                    console.error('Login failed', err);
                    // Hata mesajını kullanıcıya göster
                    if (err?.error?.error?.message) {
                        this.errorMessage = err.error.error.message;
                    } else if (err?.error?.message) {
                        this.errorMessage = err.error.message;
                    } else if (err?.message) {
                        this.errorMessage = err.message;
                    } else {
                        this.errorMessage = 'Giriş başarısız oldu. Telefon numarası veya şifre hatalı.';
                    }
                },
            });
    }

    /* --------------------- DOĞRULAMA --------------------- */
    submitVerify() {
        if (this.verifyForm.invalid) return;

        const code = [
            this.verifyForm.value.code1,
            this.verifyForm.value.code2,
            this.verifyForm.value.code3,
            this.verifyForm.value.code4,
        ].join('');

        // 1) önce test kodlarıyla deneriz
        if (this.testCodes.includes(code)) {
            this.dialogRef.close('authenticated');
            return;
        }

        // 2) gerçek endpoint
        this.isSending = true;
        this.errorMessage = null;
        this.authPhone.verifySms(this.phoneForVerify, code).subscribe({
            next: () => {
                this.isSending = false;
                this.dialogRef.close('authenticated');
            },
            error: (err) => {
                this.isSending = false;
                console.error('Verify failed', err);
                // Hata mesajını kullanıcıya göster
                if (err?.error?.error?.message) {
                    this.errorMessage = err.error.error.message;
                } else if (err?.error?.message) {
                    this.errorMessage = err.error.message;
                } else if (err?.message) {
                    this.errorMessage = err.message;
                } else {
                    this.errorMessage = 'Doğrulama kodu hatalı. Lütfen tekrar deneyin.';
                }
            },
        });
    }

    // inputlara yazdıkça ilerlesin
    onCodeInput(idx: number, event: any) {
        const value: string = event.target.value;
        const inputs = this.codeInputs?.toArray() ?? [];

        if (value && value.length === 1) {
            const nextIdx = idx + 1;
            if (nextIdx < inputs.length) {
                inputs[nextIdx].nativeElement.focus();
                inputs[nextIdx].nativeElement.select?.();
            } else {
                // son kutu da dolduysa submit etmeyi deneyelim
                if (this.verifyForm.valid) {
                    this.submitVerify();
                }
            }
        } else if (!value && event.inputType === 'deleteContentBackward') {
            const prevIdx = idx - 1;
            if (prevIdx >= 0 && prevIdx < inputs.length) {
                inputs[prevIdx].nativeElement.focus();
                inputs[prevIdx].nativeElement.select?.();
            }
        }
    }

    resendCode() {
        if (!this.phoneForVerify) return;
        this.authPhone.sendSms(this.phoneForVerify).subscribe(() => {
            this.countdown = 120;
            this.startCountdown();
        });
    }

    startCountdown() {
        // Önceki timer'ı temizle
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        this.countdownTimer = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(this.countdownTimer);
                this.countdownTimer = null;
            }
        }, 1000);
    }

    switchTo(view: AuthView) {
        this.view = view;
        this.errorMessage = null; // View değiştiğinde hata mesajını temizle

        // verify'e geçtiysek ilk kutuya odaklan
        if (view === 'verify') {
            // Countdown başlamadıysa başlat
            if (this.countdown === 120 && !this.countdownTimer) {
                this.startCountdown();
            }
            setTimeout(() => {
                const arr = this.codeInputs?.toArray() ?? [];
                if (arr.length > 0) {
                    arr[0].nativeElement.focus();
                    arr[0].nativeElement.select?.();
                }
            }, 0);
        }
    }

    /* --------------------- ŞİFREMİ UNUTTUM --------------------- */
    submitForgotPassword() {
        if (this.forgotPasswordForm.invalid) {
            this.forgotPasswordForm.markAllAsTouched();
            return;
        }

        const raw = this.forgotPasswordForm.getRawValue();
        const phone = (raw.phone || '').trim();
        const normalizedPhone = this.normalizePhone(phone);

        this.isSending = true;
        this.errorMessage = null;

        // SMS gönder ve verify ekranına yönlendir
        this.authPhone.sendSms(normalizedPhone).subscribe({
            next: () => {
                this.isSending = false;
                this.phoneForVerify = normalizedPhone;
                this.countdown = 120;
                this.startCountdown();
                this.switchTo('verify');
            },
            error: (err) => {
                this.isSending = false;
                console.error('Forgot password failed', err);
                if (err?.error?.error?.message) {
                    this.errorMessage = err.error.error.message;
                } else if (err?.error?.message) {
                    this.errorMessage = err.error.message;
                } else if (err?.message) {
                    this.errorMessage = err.message;
                } else {
                    this.errorMessage = 'İşlem başarısız oldu. Lütfen tekrar deneyin.';
                }
            },
        });
    }

    close() {
        // Timer'ı temizle
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        console.log('auth dialog closing');
        this.dialogRef.close();
    }
}
