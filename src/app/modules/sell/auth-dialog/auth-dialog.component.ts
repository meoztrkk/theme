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
import { MatInputModule } from '@angular/material/input';
import { AuthPhoneService } from 'app/core/auth/auth-phone.service';
import { AuthService } from 'app/core/auth/auth.service';

type AuthView = 'login' | 'register' | 'verify';

@Component({
    selector: 'app-auth-dialog',
    templateUrl: './auth-dialog.component.html',
    styleUrls: ['./auth-dialog.component.css'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatInputModule],
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
    verifyForm = this.fb.group({
        code1: ['', [Validators.required]],
        code2: ['', [Validators.required]],
        code3: ['', [Validators.required]],
        code4: ['', [Validators.required]],
    });

    countdown = 120;
    isSending = false;

    // örnek test kodları (backend hazır değilken)
    private testCodes = ['1234', '0000'];

    constructor(
        private dialogRef: MatDialogRef<AuthDialogComponent>,
        private fb: FormBuilder,
        private authPhone: AuthPhoneService,
        private appAuth: AuthService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.registerForm = this.fb.group({
            phone: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
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
                    this.switchTo('verify');
                },
                error: (err) => {
                    this.isSending = false;
                    console.error('Register failed', err);
                },
            });
    }

    /* --------------------- GİRİŞ --------------------- */
    submitLogin() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const raw = this.loginForm.getRawValue();
        const phone = (raw.phone || '').trim();
        const password = (raw.password || '').trim();
        const normalizedPhone = this.normalizePhone(phone);

        this.isSending = true;

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
                        console.error('Login failed - no token received');
                        return;
                    }

                    const isJwt = token && token.split('.').length === 3;

                    // Token'ı önce kaydet
                    this.appAuth.accessToken = token;

                    if (isJwt) {
                        // JWT token ise kullanıcı bilgisini almayı dene (token'ı parametre olarak gönder)
                        this.authPhone.me(token).subscribe({
                            next: (profile) => {
                                this.appAuth.signInWithExternalToken(token, profile);
                                this.dialogRef.close('authenticated');
                            },
                            error: (err) => {
                                // me() başarısız olsa bile token kaydedildi, giriş başarılı sayılabilir
                                console.warn('Could not fetch user profile, but login successful', err);
                                this.appAuth.signInWithExternalToken(token, null);
                                this.dialogRef.close('authenticated');
                            },
                        });
                    } else {
                        // JWT değilse direkt token ile giriş yap
                        this.appAuth.signInWithExternalToken(token, null);
                        this.dialogRef.close('authenticated');
                    }
                },
                error: (err) => {
                    this.isSending = false;
                    console.error('Login failed', err);
                    // Hata mesajını kullanıcıya göster (isteğe bağlı)
                    // Şimdilik sadece console'da logluyoruz
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
        this.authPhone.verifySms(this.phoneForVerify, code).subscribe({
            next: () => {
                this.dialogRef.close('authenticated');
            },
            error: (err) => {
                console.error('Verify failed', err);
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
        const timer = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    }

    switchTo(view: AuthView) {
        this.view = view;

        // verify'e geçtiysek ilk kutuya odaklan
        if (view === 'verify') {
            setTimeout(() => {
                const arr = this.codeInputs?.toArray() ?? [];
                if (arr.length > 0) {
                    arr[0].nativeElement.focus();
                    arr[0].nativeElement.select?.();
                }
            }, 0);
        }
    }

    close() {
        console.log('auth dialog closing');
        this.dialogRef.close();
    }
}
