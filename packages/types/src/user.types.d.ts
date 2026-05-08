import { Role } from './common.types';
export interface CreateUserPayload {
    tenantId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: Role;
}
export interface UpdateUserPayload {
    id: string;
    tenantId: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: Role;
    isActive?: boolean;
}
export interface UserResponse {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface FindUserByEmailPayload {
    email: string;
    tenantId: string;
}
export interface FindUserByIdPayload {
    id: string;
    tenantId: string;
}
