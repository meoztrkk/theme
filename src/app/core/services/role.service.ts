import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from 'app/const';
import {
    IdentityRoleDto,
    PagedResultDto,
} from 'app/core/user-management/user-management.types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class RoleService {
    private _httpClient = inject(HttpClient);
    private readonly _apiUrl = `${API_BASE_URL}/api/identity/roles`;

    /**
     * Get all roles
     */
    getList(): Observable<IdentityRoleDto[]> {
        return this._httpClient
            .get<PagedResultDto<IdentityRoleDto>>(this._apiUrl)
            .pipe(map((result) => result.items || []));
    }

    /**
     * Get role by ID
     */
    getById(id: string): Observable<IdentityRoleDto> {
        return this._httpClient.get<IdentityRoleDto>(`${this._apiUrl}/${id}`);
    }
}

