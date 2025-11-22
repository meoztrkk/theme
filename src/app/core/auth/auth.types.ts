import { User } from 'app/core/user/user.types';

/**
 * Login request with email and password
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Phone-based login request
 */
export interface PhoneLoginRequest {
    phoneNumber: string;
    password: string;
}

/**
 * Request to send phone verification code
 */
export interface PhoneCodeRequest {
    phoneNumber: string;
}

/**
 * Request to verify phone code
 */
export interface VerifyPhoneCodeRequest {
    phoneNumber: string;
    code: string;
}

/**
 * Standard ABP register request
 */
export interface RegisterRequest {
    userName: string;
    emailAddress: string;
    password: string;
    phoneNumber: string;
}

/**
 * Phone-based register request
 */
export interface RegisterByPhoneRequest {
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
}

/**
 * Authentication response containing access token
 */
export interface AuthResponse {
    accessToken: string;
    tokenType?: string;
    expiresIn?: number;
}

/**
 * Extended User interface matching ABP IdentityUserDto
 * Note: Does not extend User directly to avoid property conflicts
 */
export interface AbpUser {
    id: string;
    userName?: string;
    name?: string;
    surname?: string;
    email?: string;
    emailConfirmed?: boolean;
    phoneNumber?: string;
    phoneNumberConfirmed?: boolean;
    avatar?: string;
    status?: string;
}

