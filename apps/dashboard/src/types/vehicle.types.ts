export type VehicleCondition = 'NEW' | 'USED' | 'CERTIFIED_USED';
export type VehicleStatus = 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'SOLD';
export type Transmission = 'AUTOMATIC' | 'MANUAL' | 'SEMI_AUTOMATIC';
export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'LPG' | 'CNG';
export type DriveType = 'RHD' | 'LHD';
export type MileageUnit = 'KM' | 'MILES';
export type BodyType =
  | 'SEDAN' | 'SUV' | 'HATCHBACK' | 'COUPE' | 'CONVERTIBLE'
  | 'WAGON' | 'PICKUP' | 'VAN' | 'MPV' | 'CROSSOVER' | 'SPORTS';

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
  bodyType: BodyType | null;
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

export interface CreateVehicleInput {
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
  bodyType?: BodyType;
  color: string;
  vin?: string;
  engineSize?: string;
  description?: string;
  features?: string[];
  images?: string[];
}

export interface UpdateVehicleInput extends Partial<CreateVehicleInput> {
  status?: VehicleStatus;
}
