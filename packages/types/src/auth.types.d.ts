export interface LoginPayload {
    email: string;
    password: string;
    tenantId: string;
}
export interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    tenantId: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface AuthResponse extends AuthTokens {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}
export interface RefreshPayload {
    refreshToken: string;
    tenantId: string;
}
export interface LogoutPayload {
    userId: string;
    tenantId: string;
}
