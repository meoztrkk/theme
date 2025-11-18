import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, NgFor } from '@angular/common';
import { SeoPageService } from 'app/core/services/seo-page.service';
import { SeoPage } from 'app/core/seo/seo-page.model';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-seo-page-list',
    templateUrl: './seo-page-list.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        RouterLink,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
    ],
})
export class SeoPageListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'routeName', 'title', 'culture', 'isActive', 'actions'];
    seoPages: SeoPage[] = [];
    totalCount: number = 0;
    isLoading: boolean = false;

    // Pagination
    pageSize: number = 10;
    pageIndex: number = 0;
    pageSizeOptions: number[] = [5, 10, 25, 50];

    constructor(
        private _seoPageService: SeoPageService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.loadSeoPages();
    }

    loadSeoPages(): void {
        this.isLoading = true;
        this._seoPageService
            .getList({
                skipCount: this.pageIndex * this.pageSize,
                maxResultCount: this.pageSize,
                sorting: 'name',
            })
            .subscribe({
                next: (result) => {
                    this.seoPages = result.items || [];
                    this.totalCount = result.totalCount || 0;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading SEO pages:', err);
                    this._snackBar.open('SEO sayfaları yüklenirken hata oluştu.', 'Kapat', {
                        duration: 5000,
                    });
                    this.isLoading = false;
                },
            });
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadSeoPages();
    }

    createNew(): void {
        this._router.navigate(['/admin/seo-pages/new']);
    }

    edit(id: string): void {
        this._router.navigate(['/admin/seo-pages', id]);
    }

    delete(id: string, name: string): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'SEO Sayfasını Sil',
            message: `"${name}" adlı SEO sayfasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
            actions: {
                confirm: {
                    label: 'Sil',
                    color: 'warn',
                },
                cancel: {
                    label: 'İptal',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._seoPageService.delete(id).subscribe({
                    next: () => {
                        this._snackBar.open('SEO sayfası başarıyla silindi.', 'Kapat', {
                            duration: 3000,
                        });
                        this.loadSeoPages();
                    },
                    error: (err) => {
                        console.error('Error deleting SEO page:', err);
                        this._snackBar.open('SEO sayfası silinirken hata oluştu.', 'Kapat', {
                            duration: 5000,
                        });
                    },
                });
            }
        });
    }
}

