/**
 * Dealer branding config — sourced from env vars in Phase 2.
 *
 * Phase 3 upgrade path: replace with `GET /api/v1/tenants/public/:slug`
 * once a public tenant profile endpoint is added to the api-gateway.
 * At that point, call it in the root layout server component and pass
 * the result via props to Navbar and Footer.
 */
export const dealerConfig = {
  name:     process.env.NEXT_PUBLIC_DEALER_NAME    ?? 'AutoNova',
  slug:     process.env.NEXT_PUBLIC_DEALER_SLUG    ?? 'autonova',
  email:    process.env.NEXT_PUBLIC_DEALER_EMAIL   ?? '',
  phone:    process.env.NEXT_PUBLIC_DEALER_PHONE   ?? '',
  city:     process.env.NEXT_PUBLIC_DEALER_CITY    ?? '',
  country:  process.env.NEXT_PUBLIC_DEALER_COUNTRY ?? '',
  tagline:  process.env.NEXT_PUBLIC_DEALER_TAGLINE ?? 'Find your perfect vehicle',
} as const;
