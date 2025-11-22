import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from 'app/const';
import {
    CreateIdentityUserInput,
    GetIdentityUsersInput,
    IdentityRoleDto,
    IdentityUserDto,
    PagedResultDto,
    UpdateIdentityUserInput,
    UpdateUserRolesInput,
} from 'app/core/user-management/user-management.types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class UserManagementService {
    private _httpClient = inject(HttpClient);
    // Standart ABP Identity endpoint'leri
    private readonly _usersApiUrl = `${API_BASE_URL}/api/identity/users`;
    private readonly _rolesApiUrl = `${API_BASE_URL}/api/identity/roles`;

    /**
     * Get paginated list of users
     */
    getList(input: GetIdentityUsersInput): Observable<PagedResultDto<IdentityUserDto>> {
        let params = new HttpParams();

        // PagedAndSortedResultRequestDto parametreleri
        if (input.skipCount !== undefined) {
            params = params.set('skipCount', input.skipCount.toString());
        }
        if (input.maxResultCount !== undefined) {
            params = params.set('maxResultCount', input.maxResultCount.toString());
        }
        if (input.sorting) {
            params = params.set('sorting', input.sorting);
        }

        // Filter parametreleri
        if (input.filter) {
            params = params.set('filter', input.filter);
        }
        if (input.roleId) {
            params = params.set('roleId', input.roleId);
        }
        if (input.organizationUnitId) {
            params = params.set('organizationUnitId', input.organizationUnitId);
        }

        return this._httpClient.get<PagedResultDto<IdentityUserDto>>(this._usersApiUrl, { params });
    }

    /**
     * Get user by ID
     */
    getById(id: string): Observable<IdentityUserDto> {
        return this._httpClient.get<IdentityUserDto>(`${this._usersApiUrl}/${id}`);
    }

    /**
     * Create a new user
     */
    create(input: CreateIdentityUserInput): Observable<IdentityUserDto> {
        return this._httpClient.post<IdentityUserDto>(this._usersApiUrl, input);
    }

    /**
     * Update an existing user
     */
    update(id: string, input: UpdateIdentityUserInput): Observable<IdentityUserDto> {
        return this._httpClient.put<IdentityUserDto>(`${this._usersApiUrl}/${id}`, input);
    }

    /**
     * Delete a user
     */
    delete(id: string): Observable<void> {
        return this._httpClient.delete<void>(`${this._usersApiUrl}/${id}`);
    }

    /**
     * Get all roles
     */
    getRoles(): Observable<IdentityRoleDto[]> {
        return this._httpClient.get<{ items: IdentityRoleDto[] }>(this._rolesApiUrl).pipe(
            map(response => response.items || [])
        );
    }

    /**
     * Get roles for a specific user
     */
    getUserRoles(id: string): Observable<IdentityRoleDto[]> {
        return this._httpClient.get<{ items: IdentityRoleDto[] }>(`${this._usersApiUrl}/${id}/roles`).pipe(
            map(response => response.items || [])
        );
    }

    /**
     * Update user roles
     */
    updateUserRoles(id: string, roleNames: string[]): Observable<void> {
        const input: UpdateUserRolesInput = { roleNames };
        return this._httpClient.put<void>(`${this._usersApiUrl}/${id}/roles`, input);
    }
}

