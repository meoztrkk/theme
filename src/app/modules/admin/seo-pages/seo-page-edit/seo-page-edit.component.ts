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
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { SeoPageService } from 'app/core/services/seo-page.service';
import { FileUploadService } from 'app/core/services/file-upload.service';
import { SeoPage, CreateUpdateSeoPage } from 'app/core/seo/seo-page.model';
import { jsonLdTemplates } from 'app/mock-api/apps/seo-pages/data';
import { seoKeys, SeoKeyOption } from 'app/mock-api/apps/seo-pages/seo-keys.data';
import { Observable, switchMap, of, forkJoin } from 'rxjs';

@Component({
    selector: 'app-seo-page-edit',
    templateUrl: './seo-page-edit.component.html',
    styleUrls: ['./seo-page-edit.component.scss'],
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
        MatTabsModule,
        MatCardModule,
        MatTooltipModule,
        MatMenuModule,
        MatSelectModule,
    ],
})
export class SeoPageEditComponent implements OnInit {
    seoForm!: FormGroup;
    isSaving: boolean = false;
    isEditMode: boolean = false;
    pageId: string | null = null;
    isLoading: boolean = false;
    seoKeyOptions: SeoKeyOption[] = seoKeys;

    // File upload properties
    selectedOgImageFile: File | null = null;
    ogImagePreview: string | null = null;
    selectedTwitterImageFile: File | null = null;
    twitterImagePreview: string | null = null;

    constructor(
        private _formBuilder: FormBuilder,
        private _seoPageService: SeoPageService,
        private _fileUploadService: FileUploadService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.seoForm = this._formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(256)]],
            routeName: ['', [Validators.required, Validators.maxLength(256)]],
            title: ['', [Validators.required, Validators.maxLength(256)]],
            description: ['', [Validators.maxLength(1024)]],
            keywords: ['', [Validators.maxLength(512)]],
            canonicalUrl: ['', [Validators.maxLength(1024)]],
            ogTitle: ['', [Validators.maxLength(256)]],
            ogDescription: ['', [Validators.maxLength(1024)]],
            ogImage: ['', [Validators.maxLength(1024)]],
            ogType: ['', [Validators.maxLength(50)]],
            twitterCard: ['', [Validators.maxLength(50)]],
            twitterTitle: ['', [Validators.maxLength(256)]],
            twitterDescription: ['', [Validators.maxLength(1024)]],
            twitterImage: ['', [Validators.maxLength(1024)]],
            jsonLd: [''], // JSON-LD as string (no max length validation, stored as nvarchar(max))
            isActive: [true],
            culture: ['', [Validators.maxLength(10)]],
        });

        // Check if we're editing or creating
        this._route.paramMap.subscribe((params) => {
            this.pageId = params.get('id');
            if (this.pageId && this.pageId !== 'new') {
                this.isEditMode = true;
                this.loadSeoPage(this.pageId);
            } else {
                this.isEditMode = false;
            }
        });
    }

    loadSeoPage(id: string): void {
        this.isLoading = true;
        this._seoPageService.get(id).subscribe({
            next: (page: SeoPage) => {
                this.seoForm.patchValue({
                    name: page.name || '',
                    routeName: page.routeName || '',
                    title: page.title || '',
                    description: page.description || '',
                    keywords: page.keywords || '',
                    canonicalUrl: page.canonicalUrl || '',
                    ogTitle: page.ogTitle || '',
                    ogDescription: page.ogDescription || '',
                    ogImage: page.ogImage || '',
                    ogType: page.ogType || '',
                    twitterCard: page.twitterCard || '',
                    twitterTitle: page.twitterTitle || '',
                    twitterDescription: page.twitterDescription || '',
                    twitterImage: page.twitterImage || '',
                    jsonLd: page.jsonLd || '',
                    isActive: page.isActive !== undefined ? page.isActive : true,
                    culture: page.culture || '',
                });

                // Set image previews if they exist
                if (page.ogImage) {
                    this.ogImagePreview = this._fileUploadService.getImageUrl(page.ogImage, 'seo-pages');
                }
                if (page.twitterImage) {
                    this.twitterImagePreview = this._fileUploadService.getImageUrl(page.twitterImage, 'seo-pages');
                }

                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading SEO page:', err);
                this._snackBar.open('SEO sayfası yüklenirken hata oluştu.', 'Kapat', {
                    duration: 5000,
                });
                this._router.navigate(['/admin/seo-pages']);
                this.isLoading = false;
            },
        });
    }

    save(): void {
        if (this.seoForm.invalid) {
            this.seoForm.markAllAsTouched();
            return;
        }

        const action = this.isEditMode ? 'Güncelle' : 'Kaydet';
        const title = this.isEditMode ? 'SEO Sayfasını Güncelle' : 'Yeni SEO Sayfası Oluştur';
        const message = this.isEditMode
            ? 'Bu SEO sayfasındaki değişiklikleri kaydetmek istediğinizden emin misiniz?'
            : 'Bu SEO sayfasını oluşturmak istediğinizden emin misiniz?';

        const confirmation = this._fuseConfirmationService.open({
            title: title,
            message: message,
            actions: {
                confirm: {
                    label: action,
                    color: 'primary',
                },
                cancel: {
                    label: 'İptal',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.isSaving = true;

                // Prepare SEO page data
                const formData: CreateUpdateSeoPage = this.seoForm.value;

                // Upload files if selected
                const uploadObservables: Observable<any>[] = [];

                if (this.selectedOgImageFile) {
                    uploadObservables.push(
                        this._fileUploadService.uploadFile(this.selectedOgImageFile, 'seo-pages').pipe(
                            switchMap((result) => {
                                formData.ogImage = result.fileUrl;
                                return of(result);
                            })
                        )
                    );
                }

                if (this.selectedTwitterImageFile) {
                    uploadObservables.push(
                        this._fileUploadService.uploadFile(this.selectedTwitterImageFile, 'seo-pages').pipe(
                            switchMap((result) => {
                                formData.twitterImage = result.fileUrl;
                                return of(result);
                            })
                        )
                    );
                }

                // Wait for all uploads to complete (if any), then save
                const uploadObservable = uploadObservables.length > 0
                    ? forkJoin(uploadObservables)
                    : of([]);

                uploadObservable.pipe(
                    switchMap(() => {
                        // Save SEO page with file paths
                        let saveObservable: Observable<SeoPage>;
                        if (this.isEditMode && this.pageId) {
                            saveObservable = this._seoPageService.update(this.pageId, formData);
                        } else {
                            saveObservable = this._seoPageService.create(formData);
                        }
                        return saveObservable;
                    })
                ).subscribe({
                    next: (response) => {
                        this.isSaving = false;
                        this._snackBar.open(
                            `SEO sayfası başarıyla ${this.isEditMode ? 'güncellendi' : 'oluşturuldu'}!`,
                            'Kapat',
                            { duration: 3000 }
                        );
                        this._router.navigate(['/admin/seo-pages']);
                    },
                    error: (err) => {
                        this.isSaving = false;
                        const errorMessage =
                            err.error?.error?.message ||
                            err.error?.message ||
                            'Kayıt/Güncelleme yapılırken hata oluştu.';
                        this._snackBar.open('Hata: ' + errorMessage, 'Kapat', { duration: 5000 });
                        console.error('SEO page save error:', err);
                    },
                });
            }
        });
    }

    /**
     * File input change handler for OG Image
     */
    onOgImageSelected(event: Event): void {
        this.handleFileSelection(event, 'og');
    }

    /**
     * File input change handler for Twitter Image
     */
    onTwitterImageSelected(event: Event): void {
        this.handleFileSelection(event, 'twitter');
    }

    /**
     * Handle file selection for both OG and Twitter images
     */
    private handleFileSelection(event: Event, type: 'og' | 'twitter'): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                this._snackBar.open('Geçersiz dosya formatı. Sadece jpg, jpeg, png, gif ve webp formatları desteklenir.', 'Kapat', { duration: 5000 });
                return;
            }

            // Validate file size (10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                this._snackBar.open('Dosya boyutu çok büyük. Maksimum 10MB olabilir.', 'Kapat', { duration: 5000 });
                return;
            }

            // Store file for upload (path will be set after upload)
            if (type === 'og') {
                this.selectedOgImageFile = file;
                // Don't set path yet, will be set after upload
            } else {
                this.selectedTwitterImageFile = file;
                // Don't set path yet, will be set after upload
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                if (type === 'og') {
                    this.ogImagePreview = e.target.result;
                } else {
                    this.twitterImagePreview = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * Remove selected OG Image file
     */
    removeOgImage(): void {
        this.selectedOgImageFile = null;
        this.ogImagePreview = null;
        this.seoForm.patchValue({ ogImage: '' });
    }

    /**
     * Remove selected Twitter Image file
     */
    removeTwitterImage(): void {
        this.selectedTwitterImageFile = null;
        this.twitterImagePreview = null;
        this.seoForm.patchValue({ twitterImage: '' });
    }

    /**
     * JSON-LD şablonlarını mock-api'den alır
     */
    private getJsonLdTemplate(type: string): any {
        return jsonLdTemplates[type] || null;
    }

    /**
     * Seçilen şablonu JSON-LD form kontrolüne ekler
     */
    insertTemplate(type: string): void {
        const template = this.getJsonLdTemplate(type);
        if (!template) {
            this._snackBar.open('Geçersiz şablon tipi.', 'Kapat', { duration: 3000 });
            return;
        }

        try {
            // Mevcut değeri al
            const currentValue = this.seoForm.get('jsonLd')?.value || '';
            let currentJson: any = null;

            // Mevcut değer varsa parse et
            if (currentValue.trim()) {
                try {
                    currentJson = JSON.parse(currentValue);
                } catch (e) {
                    // Parse edilemezse, yeni şablonu direkt kullan
                    currentJson = null;
                }
            }

            let newJson: any;

            // Eğer mevcut değer bir array ise, yeni şablonu ekle
            if (Array.isArray(currentJson)) {
                newJson = [...currentJson, template];
            } else if (currentJson && typeof currentJson === 'object') {
                // Eğer mevcut değer bir obje ise, array yap ve her ikisini ekle
                newJson = [currentJson, template];
            } else {
                // Mevcut değer yoksa veya geçersizse, sadece yeni şablonu kullan
                newJson = template;
            }

            // JSON'u string'e çevir ve form kontrolüne yaz
            const jsonString = JSON.stringify(newJson, null, 2);
            this.seoForm.patchValue({ jsonLd: jsonString });

            this._snackBar.open(`${type.toUpperCase()} şablonu eklendi.`, 'Kapat', { duration: 3000 });
        } catch (error) {
            console.error('Template insertion error:', error);
            this._snackBar.open('Şablon eklenirken hata oluştu.', 'Kapat', { duration: 5000 });
        }
    }
}

