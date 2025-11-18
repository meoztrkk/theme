import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Third-party/Fuse modules
import { QuillModule } from 'ngx-quill'; // Doğru import
import { FuseConfirmationService } from '@fuse/services/confirmation';

// Application Services
import { BlogService, BlogPostDetail, CreateUpdateBlogPost } from 'app/core/services/blog.service';
import { FileUploadService } from 'app/core/services/file-upload.service';
import { Observable, switchMap, of } from 'rxjs';

@Component({
    selector: 'app-blog-form',
    templateUrl: './blog-form.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NgIf,
        RouterLink,

        // Material Modülleri
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,

        // Rich Text Editor Modülü
        QuillModule,
    ],
})
export class BlogFormComponent implements OnInit {
    blogForm!: FormGroup;
    isSaving: boolean = false;
    isEditMode: boolean = false;
    postId: string | null = null;
    selectedFile: File | null = null;
    imagePreview: string | null = null;
    isUploading: boolean = false;

    // Quill ayarları
    quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['code-block'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{'header': [1, 2, 3, false]}],
            ['link', 'image']
        ]
    };


    constructor(
        private _formBuilder: FormBuilder,
        private _blogService: BlogService,
        private _fileUploadService: FileUploadService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.blogForm = this._formBuilder.group({
            title: ['', Validators.required],
            summary: ['', Validators.required],
            content: ['', Validators.required],
            imageUrl: ['', Validators.required],
            author: ['', Validators.required],
        });

        // URL'deki ID'yi kontrol et
        this._route.paramMap.subscribe(params => {
            this.postId = params.get('id');
            // 'edit' rotasında ise düzenleme modunu aç ve veriyi yükle
            if (this.postId && this._router.url.includes('edit')) {
                this.isEditMode = true;
                this.loadPostData(this.postId);
            }
        });
    }

    /**
     * Düzenleme modunda, mevcut kaydın verilerini yükler.
     */
    loadPostData(id: string): void {
        this._blogService.getBlogPostById(id).subscribe({
            next: (post: BlogPostDetail) => {
                this.blogForm.patchValue(post);
                // Set image preview if imageUrl exists
                if (post.imageUrl) {
                    this.imagePreview = this._fileUploadService.getImageUrl(post.imageUrl, 'blogs');
                }
            },
            error: (err) => {
                this._snackBar.open('Kayıt yüklenirken hata oluştu.', 'Kapat', { duration: 5000 });
                this._router.navigate(['/blog']);
            }
        });
    }

    /**
     * File input change handler
     */
    onFileSelected(event: Event): void {
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

            this.selectedFile = file;

            // Generate file path with GUID
            const filePath = this._fileUploadService.generateFileName(file, 'blogs');
            this.blogForm.patchValue({ imageUrl: filePath });

            // Create preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * Remove selected file
     */
    removeFile(): void {
        this.selectedFile = null;
        this.imagePreview = null;
        this.blogForm.patchValue({ imageUrl: '' });
    }

    /**
     * Blog yazısını kaydetme (Yeni Ekleme veya Güncelleme).
     */
    savePost(): void {
        if (this.blogForm.invalid) {
            this.blogForm.markAllAsTouched();
            return;
        }

        const action = this.isEditMode ? 'Güncelle' : 'Yayınla';
        const title = this.isEditMode ? 'Yazıyı Güncelle' : 'Yeni Yazıyı Kaydet';
        const message = this.isEditMode ? 'Bu blog yazısındaki değişiklikleri kaydetmek istediğinizden emin misiniz?' : 'Bu blog yazısını yayınlamak istediğinizden emin misiniz?';

        const confirmation = this._fuseConfirmationService.open({
            title: title,
            message: message,
            actions: {
                confirm: { label: action, color: 'primary' },
                cancel: { label: 'İptal' },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.isSaving = true;

                // Prepare blog post data
                const postData: CreateUpdateBlogPost = this.blogForm.value;

                // If a new file is selected, upload it first
                const uploadObservable = this.selectedFile
                    ? this._fileUploadService.uploadFile(this.selectedFile, 'blogs')
                    : of(null);

                uploadObservable.pipe(
                    switchMap((uploadResult) => {
                        // If upload was successful, update imageUrl with the returned path
                        if (uploadResult) {
                            postData.imageUrl = uploadResult.fileUrl;
                        }

                        // Save blog post with file path
                        let saveObservable: Observable<BlogPostDetail>;
                        if (this.isEditMode && this.postId) {
                            saveObservable = this._blogService.updateBlogPost(this.postId, postData);
                        } else {
                            saveObservable = this._blogService.createBlogPost(postData);
                        }

                        return saveObservable;
                    })
                ).subscribe({
                    next: (response) => {
                        this.isSaving = false;
                        this._snackBar.open('Blog yazısı başarıyla kaydedildi!', 'Kapat', { duration: 3000 });
                        this._router.navigate(['/blog', response.id]);
                    },
                    error: (err) => {
                        this.isSaving = false;
                        const errorMessage = err.error?.message || 'Kayıt/Güncelleme yapılırken hata oluştu.';
                        this._snackBar.open('Hata oluştu: ' + errorMessage, 'Kapat', { duration: 5000 });
                        console.error('Blog save error:', err);
                    },
                });
            }
        });
    }
}
