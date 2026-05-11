export type OrderType = 'PURCHASE' | 'FINANCING' | 'LEASE';
export type OrderStatus = 'PENDING' | 'NEGOTIATING' | 'FINANCED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  tenantId: string;
  vehicleId: string;
  customerId: string | null;
  leadId: string | null;
  salesAgentId: string | null;
  type: OrderType;
  status: OrderStatus;
  salePrice: number;
  currency: string;
  downPayment: number | null;
  financingTerm: number | null;
  notes: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  vehicleId: string;
  customerId?: string;
  leadId?: string;
  salesAgentId?: string;
  type: OrderType;
  salePrice: number;
  currency: string;
  downPayment?: number;
  financingTerm?: number;
  notes?: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  salesAgentId?: string;
  salePrice?: number;
  downPayment?: number;
  financingTerm?: number;
  notes?: string;
}
