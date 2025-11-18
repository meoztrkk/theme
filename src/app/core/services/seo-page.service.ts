import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from 'app/const';
import { Observable } from 'rxjs';
import { CreateUpdateSeoPage, PagedSeoPageResult, SeoPage } from '../seo/seo-page.model';

@Injectable({
    providedIn: 'root',
})
export class SeoPageService {
    private apiUrl = API_BASE_URL + '/api/app/seo-page';

    constructor(private http: HttpClient) {}

    /**
     * Get paged list of SEO pages
     */
    getList(input: {
        skipCount?: number;
        maxResultCount?: number;
        sorting?: string;
    }): Observable<PagedSeoPageResult> {
        let params = new HttpParams();
        if (input.skipCount !== undefined) {
            params = params.set('skipCount', input.skipCount.toString());
        }
        if (input.maxResultCount !== undefined) {
            params = params.set('maxResultCount', input.maxResultCount.toString());
        }
        if (input.sorting) {
            params = params.set('sorting', input.sorting);
        }

        return this.http.get<PagedSeoPageResult>(this.apiUrl, { params });
    }

    /**
     * Get a single SEO page by ID
     */
    get(id: string): Observable<SeoPage> {
        return this.http.get<SeoPage>(`${this.apiUrl}/${id}`);
    }

    /**
     * Create a new SEO page
     */
    create(input: CreateUpdateSeoPage): Observable<SeoPage> {
        return this.http.post<SeoPage>(this.apiUrl, input);
    }

    /**
     * Update an existing SEO page
     */
    update(id: string, input: CreateUpdateSeoPage): Observable<SeoPage> {
        return this.http.put<SeoPage>(`${this.apiUrl}/${id}`, input);
    }

    /**
     * Delete an SEO page
     */
    delete(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}

