import { apiRequest } from '../api';
import type { CreateLeadInput } from '@/types';

export async function createLead(data: CreateLeadInput): Promise<void> {
  await apiRequest('/leads', { method: 'POST', body: data });
}
