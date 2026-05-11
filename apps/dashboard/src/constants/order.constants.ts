import type { OrderStatus, OrderType } from '@/types';

export const ORDER_TYPES = [
  { value: 'PURCHASE',  label: 'Cash Purchase' },
  { value: 'FINANCING', label: 'Financing' },
  { value: 'LEASE',     label: 'Lease' },
] as const;

export const ORDER_STATUSES = [
  { value: 'PENDING',     label: 'Pending' },
  { value: 'NEGOTIATING', label: 'Negotiating' },
  { value: 'FINANCED',    label: 'Financed' },
  { value: 'COMPLETED',   label: 'Completed' },
  { value: 'CANCELLED',   label: 'Cancelled' },
] as const;

export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  variant: 'info' | 'warning' | 'success' | 'destructive' | 'secondary';
  dot: string;
}> = {
  PENDING:     { label: 'Pending',     variant: 'info',        dot: 'bg-blue-400' },
  NEGOTIATING: { label: 'Negotiating', variant: 'warning',     dot: 'bg-amber-400' },
  FINANCED:    { label: 'Financed',    variant: 'info',        dot: 'bg-violet-400' },
  COMPLETED:   { label: 'Completed',   variant: 'success',     dot: 'bg-emerald-500' },
  CANCELLED:   { label: 'Cancelled',   variant: 'destructive', dot: 'bg-red-500' },
};

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  PURCHASE:  'Cash Purchase',
  FINANCING: 'Financing',
  LEASE:     'Lease',
};

export const CURRENCIES = [
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'USD', label: 'USD — US Dollar' },
] as const;
