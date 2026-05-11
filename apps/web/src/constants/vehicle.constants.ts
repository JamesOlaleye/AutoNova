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

export const VEHICLE_BODY_TYPES = [
  { value: 'SEDAN',       label: 'Sedan / Saloon' },
  { value: 'SUV',         label: 'SUV / 4x4' },
  { value: 'HATCHBACK',   label: 'Hatchback' },
  { value: 'COUPE',       label: 'Coupe' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
  { value: 'WAGON',       label: 'Wagon / Estate' },
  { value: 'PICKUP',      label: 'Pickup / Truck' },
  { value: 'VAN',         label: 'Van' },
  { value: 'MPV',         label: 'MPV / Minivan' },
  { value: 'CROSSOVER',   label: 'Crossover' },
  { value: 'SPORTS',      label: 'Sports Car' },
] as const;

export const CONDITION_LABEL: Record<string, string> = {
  NEW: 'New', USED: 'Used', CERTIFIED_USED: 'Certified Used',
};

export const FUEL_LABEL: Record<string, string> = {
  PETROL: 'Petrol', DIESEL: 'Diesel', HYBRID: 'Hybrid',
  ELECTRIC: 'Electric', LPG: 'LPG', CNG: 'CNG',
};

export const TRANSMISSION_LABEL: Record<string, string> = {
  AUTOMATIC: 'Automatic', MANUAL: 'Manual', SEMI_AUTOMATIC: 'Semi-Auto',
};

export const BODY_TYPE_LABEL: Record<string, string> = {
  SEDAN: 'Sedan / Saloon', SUV: 'SUV / 4x4', HATCHBACK: 'Hatchback',
  COUPE: 'Coupe', CONVERTIBLE: 'Convertible', WAGON: 'Wagon / Estate',
  PICKUP: 'Pickup / Truck', VAN: 'Van', MPV: 'MPV / Minivan',
  CROSSOVER: 'Crossover', SPORTS: 'Sports Car',
};
