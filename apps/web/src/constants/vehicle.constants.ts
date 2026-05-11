export const VEHICLE_CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'USED', label: 'Used' },
  { value: 'CERTIFIED_USED', label: 'Certified Used' },
] as const;

export const VEHICLE_FUEL_TYPES = [
  { value: 'PETROL', label: 'Petrol' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'LPG', label: 'LPG' },
  { value: 'CNG', label: 'CNG' },
] as const;

export const VEHICLE_TRANSMISSIONS = [
  { value: 'AUTOMATIC', label: 'Automatic' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'SEMI_AUTOMATIC', label: 'Semi-Automatic' },
] as const;

export const CONDITION_LABEL: Record<string, string> = {
  NEW: 'New',
  USED: 'Used',
  CERTIFIED_USED: 'Certified Used',
};

export const FUEL_LABEL: Record<string, string> = {
  PETROL: 'Petrol', DIESEL: 'Diesel', HYBRID: 'Hybrid',
  ELECTRIC: 'Electric', LPG: 'LPG', CNG: 'CNG',
};

export const TRANSMISSION_LABEL: Record<string, string> = {
  AUTOMATIC: 'Automatic', MANUAL: 'Manual', SEMI_AUTOMATIC: 'Semi-Auto',
};
