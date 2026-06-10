export type Role =
  | 'CUSTOMER'
  | 'SALES_AGENT'
  | 'FINANCE_MANAGER'
  | 'DEALER_ADMIN'
  | 'PLATFORM_ADMIN';

export type TenantPlan = 'STARTER' | 'GROWTH' | 'PRO';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface TenantPlanLimits {
  plan: TenantPlan;
  listingLimit: number; // -1 = unlimited
  staffLimit: number;   // -1 = unlimited
}
