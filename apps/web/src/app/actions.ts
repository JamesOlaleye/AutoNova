'use server';

import { z } from 'zod';
import { createLead } from '@/lib/api/leads';
import { ApiError } from '@/lib/api';
import type { CreateLeadInput } from '@/types';

const enquirySchema = z.object({
  vehicleId: z.string().optional(),
  type: z.enum(['INQUIRY', 'TEST_DRIVE', 'TRADE_IN', 'FINANCING']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export async function submitEnquiryAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  try {
    await createLead(parsed.data as CreateLeadInput);
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to send enquiry. Please try again.' };
  }
}
