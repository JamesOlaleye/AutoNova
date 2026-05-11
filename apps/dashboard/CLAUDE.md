# AutoNova Dealer Dashboard — App Bible

> This file covers `apps/dashboard` specifically.
> Global rules (business logic, API contracts, multi-tenancy, microservices) live in the root `CLAUDE.md`.
> Frontend quality standards (responsive design, accessibility, WCAG, i18n) live in root `CLAUDE.md` Section 14.
> This file covers: routing, components, state, auth, forms, and what has been built.

---

## 1. What This App Is

`apps/dashboard` is the **dealer management interface** — the private, authenticated web app
that a car dealership uses to run their business. It runs on port **3101** in development.

**Who uses it:**
| Role | What they do |
|------|-------------|
| `DEALER_ADMIN` | Full access — manage inventory, enquiries, staff, settings |
| `SALES_AGENT` | Manage inventory and enquiries |
| `FINANCE_MANAGER` | Manage orders and financing |
| `PLATFORM_ADMIN` | James's admin role — can see everything across tenants |

This is NOT public-facing. Every route except `/login` requires authentication.
Authentication is enforced at two levels: `src/middleware.ts` (cookie check) and `(dashboard)/layout.tsx` (session check).

---

## 2. Tech Stack

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | Next.js 15 App Router | Server Components, Server Actions, file-based routing |
| Styling | Tailwind CSS v3 | Utility-first, consistent design system |
| UI primitives | Radix UI (`@radix-ui/*`) | Accessible headless components |
| Icons | `lucide-react` only | Consistent icon library — no mixing |
| State | Zustand (with persist) | Lightweight, no boilerplate, SSR-safe |
| Forms | `useActionState` + Server Actions + Zod | No client-side fetch for mutations |
| Validation | Zod | Type-safe parsing with readable errors |
| Auth | httpOnly cookies | XSS-resistant token storage |

---

## 3. Directory Structure

```
apps/dashboard/src/
├── app/
│   ├── layout.tsx                    ← Root layout (Inter font, globals.css)
│   ├── page.tsx                      ← Redirects to /dashboard
│   ├── globals.css                   ← Design system CSS variables + utilities
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx              ← Split-panel login page
│   │       └── _components/
│   │           └── login-form.tsx    ← useActionState(login, null)
│   └── (dashboard)/
│       ├── layout.tsx                ← Auth guard + skip link + Sidebar + Header + Toaster
│       ├── page.tsx                  ← Redirects to /dashboard
│       ├── actions.ts                ← ALL Server Actions for the dashboard
│       ├── error.tsx                 ← Error boundary
│       ├── dashboard/
│       │   ├── page.tsx              ← Stats home (KPI cards + recent activity)
│       │   └── loading.tsx           ← Skeleton loader
│       ├── inventory/
│       │   ├── page.tsx              ← Vehicle card grid
│       │   ├── loading.tsx           ← Skeleton loader
│       │   └── new/
│       │       ├── page.tsx          ← Add vehicle page wrapper
│       │       └── _components/
│       │           └── add-vehicle-form.tsx  ← Zod + useActionState form
│       └── leads/
│           ├── page.tsx              ← CRM lead list
│           ├── loading.tsx           ← Skeleton loader
│           └── _components/
│               └── lead-status-update.tsx    ← Client component, inline select
│
├── components/
│   ├── ui/                           ← ATOMS — no business logic, no API calls
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   ├── common/                       ← MOLECULES — composed atoms + minor logic
│   │   ├── stats-card.tsx            ← KPI card with colored left-border accent
│   │   ├── page-header.tsx           ← title + description + actions slot
│   │   ├── empty-state.tsx           ← icon + title + description + action
│   │   └── toaster.tsx               ← Auto-dismiss toast, reads from ui.store
│   └── layout/                       ← ORGANISMS — aware of stores
│       ├── sidebar.tsx               ← Desktop fixed + mobile drawer overlay
│       └── header.tsx                ← Hamburger + page title + user menu
│
├── config/
│   └── navigation.ts                 ← Grouped nav items with role filters
│
├── constants/
│   ├── vehicle.constants.ts          ← Enum arrays for vehicle fields
│   └── lead.constants.ts             ← Enum arrays for lead fields
│
├── lib/
│   ├── api.ts                        ← Base apiRequest() + ApiError class
│   ├── api/
│   │   ├── auth.ts                   ← loginApi, logoutApi, refreshTokenApi
│   │   ├── vehicles.ts               ← getVehicles, createVehicle, updateVehicle, deleteVehicle
│   │   └── leads.ts                  ← getLeads, updateLead
│   ├── session.ts                    ← Server-side: getSession, setSession, clearSession (httpOnly cookies)
│   ├── utils.ts                      ← cn(), formatCurrency(), formatDate(), formatMileage()
│   └── schemas/
│       └── vehicle.schema.ts         ← Zod schema for createVehicleAction
│
├── middleware.ts                     ← Route protection via access_token cookie
├── store/
│   ├── auth.store.ts                 ← Zustand: user, tenantId, isAuthenticated
│   ├── ui.store.ts                   ← Zustand: mobileNavOpen, sidebarCollapsed, toasts
│   └── store-provider.tsx            ← Client component that hydrates stores from server session
└── types/
    ├── index.ts                      ← Re-exports + PaginatedResult<T>
    ├── vehicle.types.ts              ← Vehicle, CreateVehicleInput, UpdateVehicleInput
    └── lead.types.ts                 ← Lead, UpdateLeadInput, LeadStatus, LeadType
```

---

## 4. Routing

| URL | Page | Auth |
|-----|------|------|
| `/` | Redirects to `/dashboard` | — |
| `/login` | Login page | Public |
| `/dashboard` | Stats home | Required |
| `/inventory` | Vehicle card grid | Required |
| `/inventory/new` | Add vehicle form | Required |
| `/leads` | Customer Enquiries list | Required |
| `/orders` | Not built yet | Required |
| `/analytics` | Not built yet | Required |
| `/settings` | Not built yet | Required |

**UI language vs API language:**
The `/leads` route and all backend/database references use the word `leads` (API endpoints, TypeORM entities, Zustand, types). In the dealer-facing UI only, the word is **"Enquiries"** — sidebar label, page titles, descriptions, empty states. Never use "Leads" in UI copy visible to dealers. This distinction exists because "enquiry" is clearer to a dealer than "lead".

**Route group convention:**
- `(auth)` — pages that use the auth layout (no sidebar, centred content)
- `(dashboard)` — pages that use the dashboard layout (sidebar + header)
- Route groups never appear in the URL — they are layout organizers only
- **IMPORTANT**: `app/page.tsx` and `app/(dashboard)/page.tsx` both serve `/`. To avoid conflict, `app/(dashboard)/page.tsx` only redirects to `/dashboard`. Never put real content there.

---

## 5. Authentication Flow

```
User visits protected route
  ↓
middleware.ts: checks for access_token cookie
  → missing → redirect to /login?from=<pathname>
  → present → continue
  ↓
(dashboard)/layout.tsx: getSession()
  → no session → redirect('/login')
  → session present → render with StoreProvider
  ↓
StoreProvider: calls setAuth(user, tenantId) in Zustand auth.store
```

### Session cookies (all httpOnly, Secure in production)

| Cookie | Value | TTL |
|--------|-------|-----|
| `access_token` | JWT (15 min) | 15 min |
| `refresh_token` | hex string | 7 days |
| `session_user` | JSON-encoded user object | 7 days |
| `tenant_id` | UUID string | 7 days |

**`lib/session.ts`** is the only place that reads/writes cookies.
**Never read cookies in components** — always call `getSession()` from Server Components.
**Zustand auth.store** holds user info client-side (safe to persist — no tokens).

### Development tenant
`NEXT_PUBLIC_TENANT_ID` env var is the development tenant UUID.
In production, tenant ID comes from subdomain resolution in the api-gateway.
Server Actions currently read `process.env.NEXT_PUBLIC_TENANT_ID` as the dev tenant.

---

## 6. Server Actions (actions.ts)

All mutations go through `src/app/(dashboard)/actions.ts`. Never do client-side fetch for mutations.

```typescript
// Pattern for every Server Action:
'use server';

export async function doSomethingAction(
  _prevState: { error?: string } | null,
  formData: FormData,           // or explicit params for programmatic calls
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  // Validate with Zod if it's a form action
  // Call lib/api/* functions
  // Return { error } on failure, redirect() on success

  redirect('/some-path');       // use Next.js redirect() for success nav
}
```

**Rule**: Actions that come from forms use `useActionState(action, null)`.
Actions called programmatically (e.g., status update) return `{ error?: string }`.

---

## 7. State Management (Zustand)

### `auth.store.ts`
- `user: AuthUser | null` — firstName, lastName, email, role
- `tenantId: string | null`
- `isAuthenticated: boolean`
- `setAuth(user, tenantId)` — called by StoreProvider on every dashboard layout render
- `clearAuth()` — called before logout redirect

**Persisted to localStorage** under key `autonova-auth`.
**Never store tokens here** — tokens live in httpOnly cookies only.

### `ui.store.ts`
- `mobileNavOpen: boolean` — controls the mobile sidebar drawer
- `sidebarCollapsed: boolean` — reserved for desktop collapse (not yet wired)
- `toasts: Toast[]` — the toast queue
- `setMobileNavOpen(open)` — called by Header (hamburger) and Sidebar (close button)
- `addToast(message, type)` — call from any Client Component to show a toast
- `removeToast(id)` — called internally by Toaster

---

## 8. Component Rules

### Layer boundaries (strictly enforced)

```
ui/       → No imports from app/, lib/api/, store/, constants/
common/   → May import from ui/ and lib/utils only
layout/   → May import from ui/, common/, store/, config/navigation
features/ → May import from ui/, common/, types/, constants/
pages     → May import from anywhere
```

### Server vs Client Component decision

**Default: Server Component** (no `'use client'`)
- Data fetching → always Server Component
- Static rendering → Server Component

**Add `'use client'` only when you need:**
- React hooks (`useState`, `useEffect`, `useTransition`, `useRouter`)
- Browser event handlers (`onClick`, `onChange`)
- Zustand store reads (`useAuthStore`, `useUiStore`)
- `useActionState` for forms

### Adding a new feature component

Create in `src/components/features/<feature-name>/`. If it's page-specific and only used by one page, co-locate in `src/app/(dashboard)/<route>/_components/`.

---

## 9. Adding a New Page (Checklist)

1. Create `src/app/(dashboard)/<route>/page.tsx` (Server Component)
2. Add `export const metadata: Metadata = { title: '...' }`
3. Create `src/app/(dashboard)/<route>/loading.tsx` (skeleton UI — always)
4. Add the route to `src/config/navigation.ts` if it needs a nav entry
5. Add `'/<route>': 'Page Title'` to `PAGE_TITLES` in `src/components/layout/header.tsx`
6. If the page has mutations, add Server Actions to `src/app/(dashboard)/actions.ts`
7. If the page needs new API calls, add them to `src/lib/api/<entity>.ts`
8. If the page needs new types, add to `src/types/<entity>.types.ts`
9. Test on mobile (320px) — the sidebar becomes a drawer, content must be single-column
10. Verify all interactive elements have 44px touch targets (`h-11` on mobile)

---

## 10. Design System Quick Reference

### Spacing
- Page padding: `p-4 sm:p-6 lg:p-8` (applied by layout)
- Card internal padding: `p-5` or `p-6`
- Section gap: `space-y-6` or `space-y-8`
- Grid gap: `gap-4` or `gap-5`

### Typography
- Page title (PageHeader): `text-2xl font-bold tracking-tight`
- Card section heading: `text-sm font-semibold`
- Body: `text-sm`
- Caption / meta: `text-xs text-muted-foreground`
- Stat value: `text-3xl font-bold tracking-tight`

### Colors (semantic only — never raw hex)
- Primary text: `text-foreground`
- Secondary text: `text-muted-foreground`
- Success: `text-emerald-600`, `bg-emerald-50`
- Warning: `text-amber-600`, `bg-amber-50`
- Danger: `text-destructive`, `bg-destructive/10`
- Info: `text-blue-600`, `bg-blue-50`

### Border radius
- Cards, panels: `rounded-xl`
- Buttons, inputs: `rounded-lg`
- Avatars, badges: `rounded-full`

### Shadows
- Card at rest: `shadow-sm`
- Card on hover: `shadow-md`
- Dropdown / popover: `shadow-lg`
- Dialog / modal: `shadow-xl`

### StatsCard variants
`variant="blue"` | `"green"` | `"amber"` | `"red"` | `"violet"`

### Badge variants
`variant="success"` | `"warning"` | `"info"` | `"destructive"` | `"secondary"` | `"outline"`

---

## 11. What Is NOT Built Yet

The following pages are in the navigation with `disabled: true` and `badge: 'Soon'`:

| Route | Feature | Phase |
|-------|---------|-------|
| `/orders` | Deal/order management | Phase 2 |
| `/analytics` | Charts and reporting | Phase 4 |
| `/settings` | Staff, billing, preferences | Phase 3 |

When building these:
- Remove `disabled: true` and `badge: 'Soon'` from `src/config/navigation.ts`
- Create the page, loading, and error files
- Add the title to `PAGE_TITLES` in header.tsx
- Follow the checklist in Section 9 above

---

## 12. Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default: `http://localhost:3000/api/v1`) |
| `NEXT_PUBLIC_TENANT_ID` | Development tenant UUID (replaced by subdomain resolution in prod) |

Set in `apps/dashboard/.env.local` for development.
Never commit `.env.local` to git.
