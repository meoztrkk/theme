import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
    AsyncPipe,
    NgIf,
    DatePipe
} from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar'; // Snackbar eklendi
import { Observable, switchMap, map } from 'rxjs';
import { BlogService, BlogPostDetail } from 'app/core/services/blog.service';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation'; // Onay servisi eklendi
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-blog-detail',
    templateUrl: './blog-detail.component.html',
    standalone: true,
    imports: [
        NgIf,
        AsyncPipe,
        DatePipe,
        RouterLink,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        FuseAlertComponent,
        TranslocoModule
    ],
})
export class BlogDetailComponent implements OnInit {
    blogPost$!: Observable<BlogPostDetail | undefined>;

    constructor(
        private route: ActivatedRoute,
        private blogService: BlogService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.blogPost$ = this.route.paramMap.pipe(
            map(params => params.get('id')),
            switchMap(id => {
                if (id) {
                    return this.blogService.getBlogPostById(id);
                }
                return new Observable<undefined>();
            }),
        );
    }

    /**
     * Blog yazısını silme işlemini başlatır.
     */
    deletePost(id: string): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Blog Yazısını Sil',
            message: 'Bu blog yazısını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            actions: {
                confirm: { label: 'Sil', color: 'warn' },
                cancel: { label: 'İptal' },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.blogService.deleteBlogPost(id).subscribe({
                    next: () => {
                        this._snackBar.open('Blog yazısı başarıyla silindi.', 'Kapat', { duration: 3000, panelClass: ['bg-green-600'] });
                        this._router.navigate(['/blog']);
                    },
                    error: (err) => {
                        this._snackBar.open('Silme işlemi sırasında hata oluştu: ' + (err.error?.message || 'Bilinmeyen hata.'), 'Kapat', { duration: 5000 });
                    }
                });
            }
        });
    }
}
