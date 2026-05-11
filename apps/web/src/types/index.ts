export type VehicleCondition = 'NEW' | 'USED' | 'CERTIFIED_USED';
export type VehicleStatus = 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'SOLD';
export type Transmission = 'AUTOMATIC' | 'MANUAL' | 'SEMI_AUTOMATIC';
export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'LPG' | 'CNG';
export type DriveType = 'RHD' | 'LHD';
export type MileageUnit = 'KM' | 'MILES';
export type LeadType = 'INQUIRY' | 'TEST_DRIVE' | 'TRADE_IN' | 'FINANCING';

export interface Vehicle {
  id: string;
  tenantId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  mileageUnit: MileageUnit;
  condition: VehicleCondition;
  transmission: Transmission;
  fuelType: FuelType;
  driveType: DriveType;
  color: string;
  vin: string | null;
  engineSize: string | null;
  status: VehicleStatus;
  description: string | null;
  features: string[] | null;
  images: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadInput {
  name: string;
  email: string;
  phone?: string;
  type: LeadType;
  message?: string;
  vehicleId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VehicleFilters {
  page?: number;
  limit?: number;
  make?: string;
  model?: string;
  condition?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}
