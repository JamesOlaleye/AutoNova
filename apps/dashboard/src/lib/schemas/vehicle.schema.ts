import { z } from 'zod';

const BODY_TYPES = ['SEDAN', 'SUV', 'HATCHBACK', 'COUPE', 'CONVERTIBLE', 'WAGON', 'PICKUP', 'VAN', 'MPV', 'CROSSOVER', 'SPORTS'] as const;

export const createVehicleSchema = z.object({
  make:         z.string().min(1, 'Make is required'),
  model:        z.string().min(1, 'Model is required'),
  year:         z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price:        z.coerce.number().min(0, 'Price must be a positive number'),
  currency:     z.enum(['NGN', 'GBP', 'USD']),
  mileage:      z.coerce.number().min(0),
  mileageUnit:  z.enum(['KM', 'MILES']),
  condition:    z.enum(['NEW', 'USED', 'CERTIFIED_USED']),
  transmission: z.enum(['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC']),
  fuelType:     z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'CNG']),
  driveType:    z.enum(['RHD', 'LHD']),
  bodyType:     z.enum(BODY_TYPES).optional(),
  color:        z.string().min(1, 'Colour is required'),
  description:  z.string().optional(),
});

export type CreateVehicleSchema = z.infer<typeof createVehicleSchema>;
