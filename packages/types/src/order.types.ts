export type OrderType = 'PURCHASE' | 'FINANCING' | 'LEASE';
export type OrderStatus = 'PENDING' | 'NEGOTIATING' | 'FINANCED' | 'COMPLETED' | 'CANCELLED';
export type OrderDocType = 'CONTRACT' | 'TITLE' | 'ID' | 'INSURANCE' | 'OTHER';

export interface OrderDocument {
  url: string;
  publicId: string;
  name: string;
  docType: OrderDocType;
  uploadedAt: string;
}

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

export interface AddOrderDocumentPayload {
  id: string;
  tenantId: string;
  url: string;
  publicId: string;
  name: string;
  docType: OrderDocType;
}

export interface RemoveOrderDocumentPayload {
  id: string;
  tenantId: string;
  publicId: string;
}
