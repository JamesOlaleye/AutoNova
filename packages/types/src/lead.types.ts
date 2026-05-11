export type LeadType = 'INQUIRY' | 'TEST_DRIVE' | 'TRADE_IN' | 'FINANCING';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST' | 'CONVERTED';

export interface CreateLeadPayload {
  tenantId: string;
  vehicleId?: string;
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  type: LeadType;
  message?: string;
  scheduledAt?: Date;
}

export interface NotifyLeadAssignedPayload {
  tenantId: string;
  leadId: string;
  assignedToUserId: string;
  customerName: string;
  enquiryType: LeadType;
}

export interface NotifyNewLeadPayload {
  tenantId: string;
  leadId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  enquiryType: LeadType;
  message?: string;
  vehicleId?: string;
}

export interface UpdateLeadPayload {
  id: string;
  tenantId: string;
  status?: LeadStatus;
  assignedTo?: string;
  notes?: string;
  scheduledAt?: Date;
}
