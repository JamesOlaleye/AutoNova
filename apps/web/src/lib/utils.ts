import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string): string {
  const localeMap: Record<string, string> = {
    NGN: 'en-NG', GBP: 'en-GB', USD: 'en-US',
  };
  try {
    return new Intl.NumberFormat(localeMap[currency] ?? 'en-US', {
      style: 'currency', currency, maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatMileage(mileage: number, unit: string): string {
  return `${mileage.toLocaleString()} ${unit === 'KM' ? 'km' : 'mi'}`;
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateString));
}

export function vehicleSlug(vehicle: { id: string; year: number; make: string; model: string }): string {
  return `${vehicle.year}-${vehicle.make}-${vehicle.model}-${vehicle.id}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function idFromSlug(slug: string): string {
  // UUID is always the last 36 characters
  return slug.slice(-36);
}
