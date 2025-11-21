/**
 * Identity User DTO matching ABP Framework IdentityUserDto
 */
export interface IdentityUserDto {
    id: string;
    tenantId?: string;
    userName: string;
    name?: string;
    surname?: string;
    email?: string;
    emailConfirmed: boolean;
    phoneNumber?: string;
    phoneNumberConfirmed: boolean;
    lockoutEnabled: boolean;
    lockoutEnd?: string;
    concurrencyStamp?: string;
    isActive: boolean;
    shouldChangePasswordOnNextLogin: boolean;
    entityVersion: number;
    lastPasswordChangeTime?: string;
    creationTime: string;
    creatorId?: string;
    lastModificationTime?: string;
    lastModifierId?: string;
    roles?: IdentityRoleDto[];
    extraProperties?: { [key: string]: unknown };
}

/**
 * Identity Role DTO matching ABP Framework IdentityRoleDto
 */
export interface IdentityRoleDto {
    id: string;
    name: string;
    isDefault: boolean;
    isStatic: boolean;
    isPublic: boolean;
    concurrencyStamp?: string;
    extraProperties?: { [key: string]: unknown };
}

/**
 * Input for getting paginated list of users
 */
export interface GetIdentityUsersInput {
    filter?: string;
    sorting?: string;
    skipCount?: number;
    maxResultCount?: number;
    roleId?: string;
    organizationUnitId?: string;
}

/**
 * Input for creating a new user
 */
export interface CreateIdentityUserInput {
    userName: string;
    name?: string;
    surname?: string;
    email: string;
    phoneNumber?: string;
    password: string;
    lockoutEnabled?: boolean;
    roleNames?: string[];
    shouldChangePasswordOnNextLogin?: boolean;
    isActive?: boolean;
    extraProperties?: { [key: string]: unknown };
}

/**
 * Input for updating an existing user
 */
export interface UpdateIdentityUserInput {
    userName: string;
    name?: string;
    surname?: string;
    email: string;
    phoneNumber?: string;
    lockoutEnabled?: boolean;
    roleNames?: string[];
    shouldChangePasswordOnNextLogin?: boolean;
    isActive?: boolean;
    concurrencyStamp?: string;
    extraProperties?: { [key: string]: unknown };
}

/**
 * Input for updating user roles
 */
export interface UpdateUserRolesInput {
    roleNames: string[];
}

/**
 * Generic paged result DTO
 */
export interface PagedResultDto<T> {
    items: T[];
    totalCount: number;
}

