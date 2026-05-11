# AutoNova Customer Storefront — App Bible

> This file covers `apps/web` specifically.
> Global rules (business logic, API contracts, multi-tenancy, microservices) live in the root `CLAUDE.md`.
> Frontend quality standards (responsive design, accessibility, WCAG, i18n) live in root `CLAUDE.md` Section 14.
> This file covers: SSR strategy, SEO requirements, public routing, component patterns, and build plan.

---

## 1. What This App Is

`apps/web` is the **customer-facing storefront** — the public website that end customers
(car buyers) see when they visit a dealership's URL. It runs on port **3100** in development.

This app is **NOT behind a login wall** — it is indexed by Google and shared as links.
SSR (Server-Side Rendering) is non-negotiable here. Every vehicle listing page must be
server-rendered so Google can index its content.

**Who uses it:**
- Potential car buyers browsing inventory
- Customers submitting enquiries (no account needed)
- Customers booking test drives (no account needed for the form)
- Registered customers checking their saved vehicles / order status

**The dealership does NOT use this app.** They use `apps/dashboard`.

---

## 2. Tech Stack

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | Next.js 15 App Router | SSR mandatory for all public pages |
| Styling | Tailwind CSS v3 | Same design tokens as dashboard |
| Icons | `lucide-react` only | Consistent with dashboard |
| State | Zustand (minimal) | Only for wishlist, comparison, UI state |
| Forms | Server Actions + Zod | Lead creation, test drive booking |
| Auth (optional) | httpOnly cookies | Only for registered customers |
| Images | Next.js `<Image>` | Required — auto WebP, CLS prevention |
| SEO | Next.js Metadata API | Per-page title, description, OG tags |
| Structured data | `schema.org/Car` | JSON-LD on every vehicle detail page |

---

## 3. Route Structure (Planned)

| URL | Page | SSR | Auth |
|-----|------|-----|------|
| `/` | Homepage — featured vehicles, search bar | SSR | Public |
| `/vehicles` | Vehicle listing with filters | SSR | Public |
| `/vehicles/[slug]` | Vehicle detail page | SSR | Public |
| `/vehicles/compare` | Side-by-side comparison (up to 3) | CSR | Public |
| `/enquiry` | Enquiry form → POST /leads | Server Action | Public |
| `/test-drive` | Test drive booking form | Server Action | Public |
| `/wishlist` | Saved vehicles | CSR | Optional auth |
| `/financing` | Financing calculator | CSR | Public |
| `/about` | Dealer info, hours, map | SSR | Public |
| `/account` | Customer account | SSR | Required |
| `/account/orders` | Customer's orders | SSR | Required |

### Slug format for vehicle pages
`/vehicles/[year]-[make]-[model]-[last-6-of-vin]`
Example: `/vehicles/2022-toyota-camry-abc123`

Slugs are generated from vehicle data — **not stored in the database**.
Construct: `${year}-${make}-${model}-${id.slice(-6)}`.toLowerCase().replace(/\s+/g, '-')

---

## 4. SSR Strategy

**Rule: Every public page that Google should index MUST be a Server Component.**

```typescript
// ✓ CORRECT — Server Component fetches data server-side
export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: { page?: string; make?: string; status?: string };
}) {
  const vehicles = await getVehicles(tenantId, searchParams);
  return <VehicleGrid vehicles={vehicles} />;
}

// ✗ WRONG — never fetch in useEffect for public pages
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  useEffect(() => { fetch('/api/vehicles').then(...) }, []);
  // Google cannot index this content
}
```

**Tenant resolution** in `apps/web`:
- In development: `X-Tenant-ID` from `NEXT_PUBLIC_TENANT_ID` env var
- In production: parsed from subdomain (`freshautosworld.autonova.io` → slug `freshautosworld` → tenantId)
- The web app needs a server-side utility that resolves tenantId from the request headers

---

## 5. SEO Requirements (Non-Negotiable)

Every page must export `metadata` or `generateMetadata`:

```typescript
// Static metadata
export const metadata: Metadata = {
  title: 'Browse Our Vehicles',
  description: 'Find your next car from our certified inventory.',
};

// Dynamic metadata (vehicle detail pages)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vehicle = await getVehicleBySlug(params.slug);
  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} — ${formatCurrency(vehicle.price, vehicle.currency)}`,
    description: vehicle.description ?? `${vehicle.condition} ${vehicle.fuelType} ${vehicle.transmission}`,
    openGraph: {
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      images: vehicle.images?.[0] ? [{ url: vehicle.images[0] }] : [],
    },
  };
}
```

### Structured data (JSON-LD) on vehicle detail pages

Every vehicle detail page must include `schema.org/Car` structured data:

```typescript
// In the vehicle detail page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Car',
  name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
  color: vehicle.color,
  fuelType: vehicle.fuelType,
  vehicleTransmission: vehicle.transmission,
  mileageFromOdometer: {
    '@type': 'QuantitativeValue',
    value: vehicle.mileage,
    unitCode: vehicle.mileageUnit === 'KM' ? 'KMT' : 'SMI',
  },
  offers: {
    '@type': 'Offer',
    price: vehicle.price,
    priceCurrency: vehicle.currency,
    availability: vehicle.status === 'AVAILABLE'
      ? 'https://schema.org/InStock'
      : 'https://schema.org/SoldOut',
  },
};

// Inject as:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

### Sitemaps
`app/sitemap.ts` must generate a sitemap that includes all `AVAILABLE` vehicles.
Regenerate on ISR (revalidate every 24 hours).

---

## 6. Lead Creation (Public Enquiry Form)

Submitting an enquiry is the most important user action on the web app.
It calls `POST /api/v1/leads` — **no auth required**.

```typescript
// Server Action (apps/web/src/app/actions.ts)
export async function submitEnquiryAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await createLead({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    type: parsed.data.type,
    message: parsed.data.message,
    vehicleId: parsed.data.vehicleId,
    tenantId: getTenantId(),  // from env or subdomain resolution
  });

  return { success: true };
}
```

The enquiry form must work without JavaScript (progressive enhancement).
Use `useActionState` in the form component — Server Actions support no-JS fallback.

---

## 7. Image Handling

**Always use Next.js `<Image>` component** — never raw `<img>` for vehicle images.

```typescript
import Image from 'next/image';

// Vehicle listing card
<Image
  src={vehicle.images?.[0] ?? '/placeholder-car.jpg'}
  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} in ${vehicle.color}`}
  width={400}
  height={280}
  className="h-52 w-full object-cover"
  loading="lazy"          // below-fold images
  // priority             // above-fold hero image only
/>
```

**Cloudinary integration** (Phase 2):
- Images are stored as Cloudinary URLs in the vehicle's `images` array
- Use Cloudinary's URL transform API for auto-resize: `?w=400&h=280&c=fill&f=webp`
- Placeholder: `/public/placeholder-car.jpg` (generic car silhouette)

---

## 8. Financing Calculator

Client-side only (no API call needed). Formula:

```typescript
function calculateMonthlyPayment(
  price: number,
  downPayment: number,
  annualRatePercent: number,
  termMonths: number,
): number {
  const principal = price - downPayment;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths))
       / (Math.pow(1 + monthlyRate, termMonths) - 1);
}
```

Display as a client component (`'use client'`) with sliders for down payment and term.
Always show the currency correctly using `formatCurrency(amount, vehicle.currency)`.

---

## 9. Vehicle Filtering (URL-Based State)

Filters must live in URL search params — not in component state.
This makes filtered URLs shareable and bookmarkable.

```
/vehicles?make=Toyota&condition=USED&minPrice=5000000&maxPrice=20000000&page=2
```

```typescript
// Reading filters in Server Component
export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: {
    make?: string; model?: string; condition?: string;
    minPrice?: string; maxPrice?: string; page?: string;
  };
}) {
  const filters = {
    make: searchParams.make,
    condition: searchParams.condition,
    page: Number(searchParams.page ?? 1),
    limit: 12,
  };
  const result = await getVehicles(tenantId, filters);
  // ...
}
```

**Filter UI** must use `router.push` to update URL — never `useState` for filter values.

---

## 10. WhatsApp Button

Every vehicle detail page and the dealer info page must have a WhatsApp CTA.

```typescript
function WhatsAppButton({ phone, message }: { phone: string; message: string }) {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encoded}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="..."
      aria-label="Contact dealer on WhatsApp"
    >
      <WhatsappIcon /> Chat on WhatsApp
    </a>
  );
}
```

Phone number format: E.164 without `+` (e.g., `2348012345678` for a Nigerian number).

---

## 11. Performance Requirements

The web app is customer-facing — performance directly affects conversion rates.

- **LCP < 2.5s**: hero vehicle images must use `priority` prop on Next.js `<Image>`
- **CLS < 0.1**: every `<Image>` must have explicit `width` and `height`
- **Vehicle listing page**: use `loading="lazy"` for below-fold images
- **Fonts**: Inter with `display: 'swap'`, subset `latin` only
- **Dynamic imports**: financing calculator, comparison tool, and any charting library must use `next/dynamic`
- **ISR for vehicle listings**: `export const revalidate = 60` (re-render every 60 seconds without a full rebuild)
- **Static generation for detail pages**: `generateStaticParams` for popular vehicles

---

## 12. Status — What Is Built

**As of 2026-05-11: Phase 1 complete.**

- [x] Tailwind CSS + design system (matching dashboard tokens)
- [x] `lib/api.ts` — base fetch with `NEXT_PUBLIC_TENANT_ID` + ISR revalidation
- [x] `lib/api/vehicles.ts` — `getVehicles`, `getVehicle` (revalidate: 60s)
- [x] `lib/api/leads.ts` — `createLead`
- [x] `lib/utils.ts` — `cn`, `formatCurrency`, `formatDate`, `formatMileage`, `vehicleSlug`, `idFromSlug`
- [x] Public layout — sticky navbar (mobile drawer) + footer
- [x] Homepage — hero, features, featured vehicles grid, dealer CTA
- [x] `/vehicles` — SSR listing with filter bar (condition/fuel/transmission), 12-per-page, URL-based filters, pagination
- [x] `/vehicles/[slug]` — SSR detail page with specs grid, JSON-LD structured data, sticky enquiry form sidebar, WhatsApp CTA
- [x] Enquiry form — `useActionState` + Zod validation + `submitEnquiryAction` Server Action
- [x] Skip-to-content link, ARIA labels, semantic HTML throughout
- [x] Mobile responsive: navbar drawer, stacked layout on mobile, 44px touch targets

**Slug format**: `${year}-${make}-${model}-${id}` (lowercased, spaces→hyphens, non-alphanumeric stripped)
**ID extraction**: `idFromSlug(slug)` takes `slug.slice(-36)` — UUID is always last 36 chars

**Next (Phase 2):**
- Vehicle image gallery (once Cloudinary is wired in `media-service`)
- Test drive booking form (needs calendar UI)
- Wishlist / saved vehicles (needs customer auth)
- Price drop alerts
