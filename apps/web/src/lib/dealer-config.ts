import type { DealerProfile } from '@/types';
import { getPublicTenant } from './api/tenants';

const SLUG = process.env.NEXT_PUBLIC_DEALER_SLUG ?? 'autonova';

const envFallback: DealerProfile = {
  name:     process.env.NEXT_PUBLIC_DEALER_NAME    ?? 'AutoNova',
  slug:     SLUG,
  email:    process.env.NEXT_PUBLIC_DEALER_EMAIL   ?? '',
  phone:    process.env.NEXT_PUBLIC_DEALER_PHONE   ?? null,
  address:  null,
  city:     process.env.NEXT_PUBLIC_DEALER_CITY    ?? null,
  logo:     null,
  tagline:  process.env.NEXT_PUBLIC_DEALER_TAGLINE ?? 'Find your perfect vehicle',
  country:  process.env.NEXT_PUBLIC_DEALER_COUNTRY ?? '',
  currency: 'USD',
  locale:   'en',
};

export async function getDealerConfig(): Promise<DealerProfile> {
  const profile = await getPublicTenant(SLUG);
  return profile ?? envFallback;
}

export { envFallback as dealerConfig };
