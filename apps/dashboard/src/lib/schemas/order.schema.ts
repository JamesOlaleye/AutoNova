import { z } from 'zod';

export const createOrderSchema = z.object({
  vehicleId:     z.string().uuid('Invalid vehicle ID'),
  leadId:        z.string().uuid().optional().or(z.literal('')),
  salesAgentId:  z.string().uuid().optional().or(z.literal('')),
  type:          z.enum(['PURCHASE', 'FINANCING', 'LEASE']),
  salePrice:     z.coerce.number().min(1, 'Sale price is required'),
  currency:      z.enum(['NGN', 'GBP', 'USD']),
  downPayment:   z.coerce.number().min(0).optional(),
  financingTerm: z.coerce.number().min(1).max(120).optional(),
  notes:         z.string().optional(),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
