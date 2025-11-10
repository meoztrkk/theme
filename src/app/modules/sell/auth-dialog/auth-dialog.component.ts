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
            name: ['', [Validators.required]],
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
        const name = raw.name?.trim();
        const password = raw.password;

        this.isSending = true;

        this.authPhone
            .registerByPhone({
                phoneNumber: normalizedPhone,
                password: password!,
                name: name,
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

        this.authPhone
            .loginByPhone({
                phoneNumber: normalizedPhone,
                password: password,
            })
            .subscribe({
                next: (res: any) => {
                    // backend senin örneğinde accessToken ya da access_token dönebilir
                    const token = res?.accessToken || res?.access_token;
                    if (token) {
                        this.appAuth.signInWithExternalToken(token);
                    }

                    const isJwt = token && token.split('.').length === 3;

                    if (isJwt) {
                        // token JWT ise profili de çekelim
                        this.authPhone.me().subscribe({
                            next: (profile) => {
                                localStorage.setItem(
                                    'user_profile',
                                    JSON.stringify(profile)
                                );
                                this.dialogRef.close('authenticated');
                            },
                            error: () => {
                                this.dialogRef.close('authenticated');
                            },
                        });
                    } else {
                        // JWT değilse me çağırmayalım, direkt kapatalım
                        this.dialogRef.close('authenticated');
                    }
                },
                error: (err) => {
                    console.error('Login failed', err);
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
        this.dialogRef.close();
    }
}
