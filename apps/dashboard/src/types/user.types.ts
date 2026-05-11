export type UserRole = 'DEALER_ADMIN' | 'SALES_AGENT' | 'FINANCE_MANAGER' | 'PLATFORM_ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
