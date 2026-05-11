export const VEHICLE_CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'USED', label: 'Used' },
  { value: 'CERTIFIED_USED', label: 'Certified Used' },
] as const;

export const VEHICLE_TRANSMISSIONS = [
  { value: 'AUTOMATIC', label: 'Automatic' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'SEMI_AUTOMATIC', label: 'Semi-Automatic' },
] as const;

export const VEHICLE_FUEL_TYPES = [
  { value: 'PETROL', label: 'Petrol' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'LPG', label: 'LPG' },
  { value: 'CNG', label: 'CNG' },
] as const;

export const VEHICLE_DRIVE_TYPES = [
  { value: 'RHD', label: 'Right-Hand Drive (RHD)' },
  { value: 'LHD', label: 'Left-Hand Drive (LHD)' },
] as const;

export const VEHICLE_MILEAGE_UNITS = [
  { value: 'KM', label: 'Kilometres (KM)' },
  { value: 'MILES', label: 'Miles' },
] as const;

export const VEHICLE_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
] as const;

export const CURRENCIES = [
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'USD', label: 'USD — US Dollar' },
] as const;
