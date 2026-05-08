import { TenantPlan } from './common.types';
export interface CreateTenantPayload {
    name: string;
    slug: string;
    country: string;
    currency: string;
    locale: string;
    email: string;
    phone?: string;
    plan?: TenantPlan;
}
export interface UpdateTenantPayload {
    id: string;
    name?: string;
    country?: string;
    currency?: string;
    locale?: string;
    email?: string;
    phone?: string;
    address?: string;
    logo?: string;
    customDomain?: string;
    plan?: TenantPlan;
}
export interface TenantResponse {
    id: string;
    slug: string;
    name: string;
    country: string;
    currency: string;
    locale: string;
    plan: TenantPlan;
    email: string;
    phone?: string;
    address?: string;
    logo?: string;
    customDomain?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
