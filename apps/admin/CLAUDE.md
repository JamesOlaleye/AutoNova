# AutoNova Platform Admin — App Bible

> This file covers `apps/admin` specifically.
> Global rules live in the root `CLAUDE.md`. Frontend standards in root Section 14.
> This app is James's internal panel — not visible to dealers or customers.

---

## 1. What This App Is

`apps/admin` is the **platform administration panel** — James's private internal tool
for managing the AutoNova SaaS platform itself. It runs on port **3102** in development.

**Only `PLATFORM_ADMIN` role can access this app.**
This is James's tool. No dealer user should ever see this.

**What it does (planned):**
- Onboard new dealer tenants (create tenant + initial DEALER_ADMIN user)
- View all tenants and their subscription status
- See platform-wide MRR, churn, active dealers
- Manage feature flags per subscription tier
- Impersonate a tenant for support purposes (read-only)
- Monitor service health

---

## 2. Tech Stack

Same as `apps/dashboard`:
- Next.js 15 App Router
- Tailwind CSS v3
- Radix UI primitives
- Zustand
- Server Actions + Zod

---

## 3. Security Rules

This app has the highest security requirements because it operates across ALL tenants.

- **`PLATFORM_ADMIN` check on every route** — middleware AND layout must both verify role
- **No tenant isolation bypass in UI** — even though PLATFORM_ADMIN can see all tenants' data, the UI must make it crystal clear which tenant's data is being viewed at all times
- **Audit trail UI** — any destructive action (delete tenant, revoke access) must show a confirmation dialog with the full consequence stated
- **No bulk delete operations** — never allow deleting multiple tenants at once
- **Read-only impersonation only** — when viewing a tenant's data for support, it must be clearly labelled "Viewing as [tenant name]" with no ability to mutate

---

## 4. Route Structure (Planned)

| URL | Page | Phase |
|-----|------|-------|
| `/` | Platform overview (MRR, active tenants) | Phase 3 |
| `/tenants` | All dealer accounts list | Phase 3 |
| `/tenants/[id]` | Tenant detail + subscription | Phase 3 |
| `/tenants/new` | Onboard a new dealer | Phase 3 |
| `/billing` | Subscription overview, Stripe/Paystack | Phase 3 |
| `/feature-flags` | Tier feature management | Phase 3 |
| `/health` | Service health dashboard | Phase 5 |

---

## 5. Status — What Is Built

**As of 2026-05-11: `apps/admin` has NOT been built.**
It is a scaffold placeholder. This app is Phase 3 work.

Do not build this until Phase 1 and Phase 2 are complete.
