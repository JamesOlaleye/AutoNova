# AutoNova Frontend Standards (Non-Negotiable)

AutoNova is sold internationally to real businesses. Every screen must meet the standard
of a commercial SaaS product (think: Linear, Vercel, Stripe Dashboard). These rules apply
to **every** component and page in `apps/dashboard`, `apps/web`, and `apps/admin`.

---

## Responsive Design — Mobile-First, Always

- **Default to mobile layout**, then enhance for larger screens with `sm:`, `md:`, `lg:`, `xl:` prefixes
- Every page must be **fully usable on 320px width** up to 2560px (wide monitor)
- **Breakpoints** (Tailwind defaults — do not deviate):
  - `sm` = 640px | `md` = 768px | `lg` = 1024px | `xl` = 1280px | `2xl` = 1536px
- **Dashboard sidebar**: hidden on mobile (< `lg`), fixed sidebar on `lg+`. Mobile: slide-in drawer overlay via hamburger. Never block main content.
- **Grid columns**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` patterns — never assume two columns fit on a phone
- **Touch targets**: minimum 44×44px for all interactive elements (WCAG 2.5.5 / Apple HIG)
- **Tables/lists**: stack vertically or `overflow-x-auto` on mobile — never overflow the viewport
- **Forms**: single-column on mobile, multi-column on `sm+` — full-width inputs on small screens
- **Typography**: body text minimum `text-sm` (14px) — never below 12px for non-decorative text
- **No horizontal scroll** at page level — wide content wraps or scrolls within a container

---

## Accessibility (WCAG 2.1 AA — Mandatory)

- **Semantic HTML first**: `<nav>`, `<main>`, `<header>`, `<aside>`, `<section>`, `<button>`, `<a>` — never `<div>` as a button
- **Keyboard navigation**: every interactive element reachable by keyboard; logical tab order
- **Focus ring**: visible on all focusable elements — never `outline: none` without an alternative
- **Color contrast**: 4.5:1 for normal text, 3:1 for large text. No muted text on muted backgrounds for important info
- **ARIA labels**: icon-only buttons MUST have `aria-label`. Decorative images: `alt=""`. Meaningful images: descriptive `alt`
- **`role` attributes**: `role="alert"` for errors, `role="status"` for success, `role="dialog"` for modals
- **`aria-live="polite"`** for dynamic updates (toasts, status changes); `"assertive"` only for critical errors
- **`sr-only` class**: for screen-reader-only text (icon button labels, skip links)
- **Skip navigation link**: `apps/web` must have "Skip to main content" as the first focusable element
- **Form labels**: every `<input>`, `<select>`, `<textarea>` MUST have an associated `<label>` (`htmlFor`/`id`). Never use placeholder as label.
- **Error messages**: associated with their input via `aria-describedby`
- **Loading states**: `aria-busy="true"` on loading containers, or skeleton UI
- **Modals**: focus moves inside on open; `Escape` closes; focus returns to trigger on close

---

## Visual Design Quality — International Commercial Standard

- **Design tokens only**: never hardcode hex colors — use CSS variables (`text-foreground`, `bg-card`, etc.)
- **Spacing system**: Tailwind scale only (multiples of 4px). Reserve odd values (`px-3.5`) for fine-tuning small components only
- **Typography hierarchy**: one `<h1>` per page; `<h2>` for sections; `<h3>` for sub-sections. Never skip levels.
- **No orphaned elements**: every page follows title → description → content → actions hierarchy
- **Skeleton loaders, not spinners**: animated skeletons for loading states. Full-page spinner only for auth redirects.
- **Empty states are content**: every empty list/table needs icon + title + description + primary action
- **Border radius**: `rounded-xl` for cards/panels · `rounded-lg` for buttons/inputs · `rounded-full` for avatars/badges
- **Shadows**: `shadow-sm` at rest · `shadow-md` hover/active · `shadow-lg` dropdowns/modals · `shadow-xl` dialogs
- **Icons**: `lucide-react` only. Sizes: `h-4 w-4` inline · `h-5 w-5` nav · `h-6 w-6` feature · `h-8 w-8` empty state
- **Animations**: subtle only (`transition-colors`, `transition-shadow`, `transition-transform`). No layout-shifting animations. Respect `prefers-reduced-motion`.
- **Images**: explicit `width` + `height` on all `<img>` to prevent CLS. Use Next.js `<Image>` in Next.js apps.
- **Performance**: lazy-load below-fold images; dynamic import heavy third-party components

---

## Component Architecture

```
components/
  ui/       ← Atoms: Button, Input, Badge, Card, Label, Select, Textarea
              No business logic. No imports from app/ or lib/api/.

  common/   ← Molecules: StatsCard, PageHeader, EmptyState, Toaster, Pagination
              Composed from ui/ + minor logic. No feature-specific imports.

  layout/   ← Organisms: Sidebar, Header
              May read from stores. No API calls.

  features/ ← Feature-specific (VehicleCard, LeadRow)
              Knows domain types. Receives server-fetched data as props.
```

- **Server Components by default** — add `'use client'` only for hooks, event handlers, or browser APIs
- **Data fetching in Server Components** — never `useEffect` for data. Use Server Components or Server Actions.
- **No prop drilling beyond 2 levels** — use Zustand or React context
- **Mutations via Server Actions** — never client-side fetch for data mutations
- **URL as state for filters/pagination** — `useSearchParams` + `router.push` so URLs are shareable

---

## Performance Targets (Core Web Vitals)

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

- **Fonts**: `display: 'swap'`, subset `latin` only
- **Images**: WebP preferred; `priority` prop on above-fold Next.js `<Image>`
- **Bundle**: dynamic import date pickers, charts, editors. Keep initial bundle under 200KB gzipped.
- **No layout shift**: skeleton loaders reserve space before async data arrives

---

## Internationalisation (i18n) Preparation

- **Never hardcode currency symbols** — use `formatCurrency(amount, currency)` from `@/lib/utils`
- **Never hardcode date formats** — use `formatDate(date)` from `@/lib/utils`
- **Never hardcode measurement units** — use `formatMileage(value, unit)` from `@/lib/utils`
- **Strings**: English for now, written for future extraction into i18n keys (no interpolation that breaks translation)
- **RTL readiness**: prefer `start`/`end` or Tailwind `ps-`/`pe-` logical properties over `left`/`right`
