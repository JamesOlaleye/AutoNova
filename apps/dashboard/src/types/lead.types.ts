export type LeadType = 'INQUIRY' | 'TEST_DRIVE' | 'TRADE_IN' | 'FINANCING';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST' | 'CONVERTED';

export interface Lead {
  id: string;
  tenantId: string;
  vehicleId: string | null;
  customerId: string | null;
  name: string;
  email: string;
  phone: string;
  type: LeadType;
  status: LeadStatus;
  message: string | null;
  assignedTo: string | null;
  notes: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLeadInput {
  status?: LeadStatus;
  assignedTo?: string;
  notes?: string;
  scheduledAt?: string | null;
}
