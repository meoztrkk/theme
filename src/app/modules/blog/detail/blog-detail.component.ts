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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, switchMap, map, BehaviorSubject, tap } from 'rxjs';
import { BlogService, BlogPostDetail } from 'app/core/services/blog.service';
import { FileUploadService } from 'app/core/services/file-upload.service';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { SeoService } from 'app/core/seo/seo.service';
import { SeoConfig } from 'app/core/seo/seo-config.model';

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
    isAuthenticated$: Observable<boolean>;

    constructor(
        private route: ActivatedRoute,
        private blogService: BlogService,
        private fileUploadService: FileUploadService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar,
        private _authService: AuthService,
        private _seoService: SeoService
    ) {
        // Check authentication once and create observable
        const authSubject = new BehaviorSubject<boolean>(false);
        this.isAuthenticated$ = authSubject.asObservable();

        this._authService.check().subscribe((isAuth) => {
            authSubject.next(isAuth);
        });

        // Listen to authentication state changes
        this._authService.authenticationStateChanged$.subscribe((isAuth) => {
            authSubject.next(isAuth);
        });
    }

    ngOnInit(): void {
        this.blogPost$ = this.route.paramMap.pipe(
            map(params => params.get('id')),
            switchMap(id => {
                if (id) {
                    return this.blogService.getBlogPostById(id);
                }
                return new Observable<undefined>();
            }),
            map(post => {
                // Transform imageUrl to full URL if needed
                if (post) {
                    return {
                        ...post,
                        imageUrl: this.fileUploadService.getImageUrl(post.imageUrl, 'blogs')
                    };
                }
                return post;
            }),
            tap(post => {
                // Apply SEO when blog post is loaded
                if (post) {
                    this._applySeoForPost(post);
                }
            })
        );
    }

    /**
     * Applies SEO configuration for the blog post with Article JSON-LD schema
     */
    private _applySeoForPost(post: BlogPostDetail): void {
        if (!post) {
            return;
        }

        const title = post.title || 'Blog Yazısı';
        const description =
            post.summary ||
            (post.content ? this._stripHtml(post.content).substring(0, 160) : '') ||
            'Direkt Satış blog yazısı';

        const imageUrl = post.imageUrl || null;
        const authorName = post.author || 'Direkt Satış';
        const publishedDate = post.publishDate ? new Date(post.publishDate).toISOString() : undefined;

        // Build canonical URL from current location (without query string and hash)
        const origin = window.location.origin;
        const fullPath = this._router?.url || '/blog';
        const [pathWithoutQuery] = fullPath.split('?');
        const cleanPath = (pathWithoutQuery || '/blog').split('#')[0] || '/blog';
        const canonical = origin + cleanPath;

        // Build Article JSON-LD schema
        const articleJsonLd: any = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: description,
            author: {
                '@type': 'Person',
                name: authorName
            },
            datePublished: publishedDate,
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': canonical
            }
        };

        if (imageUrl) {
            articleJsonLd.image = [imageUrl];
        }

        // Build SEO config
        const seoConfig: SeoConfig = {
            title,
            description,
            canonicalUrl: canonical,
            ogTitle: title,
            ogDescription: description,
            ogImage: imageUrl || undefined,
            ogType: 'article',
            twitterCard: 'summary_large_image',
            twitterTitle: title,
            twitterDescription: description,
            twitterImage: imageUrl || undefined,
            jsonLd: articleJsonLd
        };

        this._seoService.applySeo(seoConfig);
    }

    /**
     * Strips HTML tags from content for use in meta description
     */
    private _stripHtml(html: string): string {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
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
