import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { GlobalSeoSettingService } from 'app/core/services/global-seo-setting.service';

@Component({
    selector: 'app-seo-global-settings',
    templateUrl: './seo-global-settings.component.html',
    styleUrls: ['./seo-global-settings.component.scss'],
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NgIf,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatIconModule,
    ],
})
export class SeoGlobalSettingsComponent implements OnInit {
    form: FormGroup;
    loading = false;

    constructor(
        private _fb: FormBuilder,
        private _globalSeoSettingService: GlobalSeoSettingService,
        private _snackBar: MatSnackBar
    ) {
        this.form = this._fb.group({
            headCode: [null],
        });
    }

    ngOnInit(): void {
        this.loading = true;
        this._globalSeoSettingService.get().subscribe({
            next: (setting) => {
                this.form.patchValue({
                    headCode: setting?.headCode ?? null,
                });
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this._snackBar.open('Ayarlar yüklenirken bir hata oluştu.', 'Kapat', {
                    duration: 3000,
                });
            },
        });
    }

    save(): void {
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this._globalSeoSettingService.update(this.form.value).subscribe({
            next: () => {
                this.loading = false;
                this._snackBar.open('Ayarlar başarıyla kaydedildi.', 'Kapat', {
                    duration: 3000,
                });
            },
            error: () => {
                this.loading = false;
                this._snackBar.open('Ayarlar kaydedilirken bir hata oluştu.', 'Kapat', {
                    duration: 3000,
                });
            },
        });
    }
}

