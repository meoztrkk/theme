import { Component, OnInit } from '@angular/core';
import {
    AsyncPipe,
    NgFor,
    NgIf,
    DatePipe
} from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { BlogService, BlogPostList } from 'app/core/services/blog.service';
import { FuseCardComponent } from '@fuse/components/card';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-blog-list',
    templateUrl: './blog-list.component.html',
    standalone: true,

    imports: [
        NgIf,
        NgFor,
        AsyncPipe,
        DatePipe, // Zorunlu eklenti
        MatIconModule,
        MatButtonModule,
        RouterLink,
        FuseCardComponent,
        TranslocoModule
    ],
})
export class BlogListComponent implements OnInit {
    blogPosts$!: Observable<BlogPostList[]>;

    constructor(private blogService: BlogService) {}

    ngOnInit(): void {
        // Service metodu çağrılıyor
        this.blogPosts$ = this.blogService.getBlogPosts();
    }
}
