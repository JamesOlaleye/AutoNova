export type VehicleCondition = 'NEW' | 'USED' | 'CERTIFIED_USED';
export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DRAFT';
export type Transmission = 'AUTOMATIC' | 'MANUAL' | 'SEMI_AUTOMATIC';
export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'LPG' | 'CNG';
export type DriveType = 'RHD' | 'LHD';
export type MileageUnit = 'KM' | 'MILES';

export interface CreateVehiclePayload {
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
  vin?: string;
  engineSize?: string;
  status?: VehicleStatus;
  description?: string;
  features?: string[];
  images?: string[];
}

export interface UpdateVehiclePayload extends Partial<CreateVehiclePayload> {
  id: string;
  tenantId: string;
}

export interface VehicleSearchPayload {
  tenantId: string;
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  condition?: VehicleCondition;
  transmission?: Transmission;
  fuelType?: FuelType;
  status?: VehicleStatus;
  page?: number;
  limit?: number;
}
