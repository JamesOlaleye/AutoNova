export type OrderType = 'PURCHASE' | 'FINANCING' | 'LEASE';
export type OrderStatus = 'PENDING' | 'NEGOTIATING' | 'FINANCED' | 'COMPLETED' | 'CANCELLED';

export interface CreateOrderPayload {
  tenantId: string;
  vehicleId: string;
  customerId: string;
  leadId?: string;
  salesAgentId?: string;
  type: OrderType;
  salePrice: number;
  currency: string;
  downPayment?: number;
  financingTerm?: number;
  notes?: string;
}

export interface UpdateOrderPayload {
  id: string;
  tenantId: string;
  status?: OrderStatus;
  salesAgentId?: string;
  salePrice?: number;
  downPayment?: number;
  financingTerm?: number;
  notes?: string;
}
