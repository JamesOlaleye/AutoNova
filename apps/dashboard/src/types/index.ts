export * from './vehicle.types';
export * from './lead.types';
export * from './user.types';
export * from './order.types';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
