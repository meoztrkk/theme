import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from 'app/const';
import { Observable } from 'rxjs';

export interface BlogPostList {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    publishDate: string;
    author: string;
}

export interface BlogPostDetail extends BlogPostList {
    content: string;
}


export interface CreateUpdateBlogPost {
    title: string;
    summary: string;
    content: string;
    imageUrl: string;
    author: string;
}

@Injectable({
    providedIn: 'root',
})
export class BlogService {
    private apiUrl = API_BASE_URL+'/api/app/blog-post';

    constructor(private http: HttpClient) {}

    getBlogPosts(): Observable<BlogPostList[]> {
        // ABP: GET /api/app/blog-post
        return this.http.get<BlogPostList[]>(this.apiUrl);
    }

    getBlogPostById(id: string): Observable<BlogPostDetail> {
        // ABP: GET /api/app/blog-post/{id}
        return this.http.get<BlogPostDetail>(`${this.apiUrl}/${id}`);
    }

    createBlogPost(post: CreateUpdateBlogPost): Observable<BlogPostDetail> {
        // ABP: POST /api/app/blog-post
        return this.http.post<BlogPostDetail>(this.apiUrl, post);
    }

    updateBlogPost(id: string, post: CreateUpdateBlogPost): Observable<BlogPostDetail> {
        // ABP: PUT /api/app/blog-post/{id}
        return this.http.put<BlogPostDetail>(`${this.apiUrl}/${id}`, post);
    }

    deleteBlogPost(id: string): Observable<any> {
        // ABP: DELETE /api/app/blog-post/{id}
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
