# AutoNova — Project Bible

> Read this before touching any code. Every decision recorded here has a reason.
> Owner: James (jamesfullstackdeveloper@gmail.com)

### Where to find app-specific rules

| App | CLAUDE.md location |
|-----|--------------------|
| API Gateway (`apps/api-gateway`) | [`apps/api-gateway/CLAUDE.md`](apps/api-gateway/CLAUDE.md) — 3-layer architecture, module inventory, DTO rules, guard usage, adding endpoints |
| Dealer Dashboard (`apps/dashboard`) | [`apps/dashboard/CLAUDE.md`](apps/dashboard/CLAUDE.md) — routing, components, auth flow, state, design system |
| Customer Storefront (`apps/web`) | [`apps/web/CLAUDE.md`](apps/web/CLAUDE.md) — SSR strategy, SEO, filtering, lead creation |
| Platform Admin (`apps/admin`) | [`apps/admin/CLAUDE.md`](apps/admin/CLAUDE.md) — security rules, platform-wide ops |

**This root file covers**: business model, microservice architecture, multi-tenancy, auth, service responsibilities, phases, backend code conventions, environment variables, and global frontend standards (Section 14).

---

## 1. What Is AutoNova

AutoNova is a **multi-tenant SaaS platform for car dealerships**, built to be sold as a
subscription product to car dealers worldwide. It is NOT a single dealership's website —
it is the platform that powers many dealerships simultaneously.

**The first live customer / prototype dealer is `freshautosworld`** — use them as the
reference use case when making product decisions.

### The Business Model

- James owns and operates AutoNova as a product
- Dealers sign up, get their own branded storefront and dashboard
- James charges dealers a monthly subscription (Stripe for UK/Global, Paystack for Nigeria/Africa)
- Revenue = recurring subscriptions + optional add-ons (SMS credits, premium listings, etc.)

### Pricing Tiers (planned)

| Tier    | Price/mo | Limits                              |
|---------|----------|-------------------------------------|
| Starter | $49      | 1-2 staff, 30 listings              |
| Growth  | $149     | 10 staff, 200 listings, analytics   |
| Pro     | $349     | Unlimited, API access, custom domain|

### Target Markets

- **Nigeria** — primary (freshautosworld is here; Paystack for payments)
- **UK** — secondary (Stripe; right-hand drive vehicles)
- **Global** — long-term goal

Multi-currency and multi-language are first-class concerns from day one.

---

## 2. The Product — What Dealers Get

### Customer-Facing Website (`apps/web`)
- Vehicle inventory with advanced filters (make, model, year, price, mileage, condition,
  fuel type, transmission, drive side, color)
- Vehicle detail pages (photo gallery, specs, VIN, features)
- Vehicle comparison (up to 3 side-by-side)
- Financing calculator (price, down payment, rate, term → monthly payment)
- Trade-in estimator
- Test drive booking (calendar-based, linked to leads-service)
- Wishlist / saved vehicles
- Price drop alerts (email/SMS via notifications-service)
- "Make an offer" / inquiry form → creates a Lead
- Dealer info page (hours, map, contact, WhatsApp button)
- SEO: server-rendered (Next.js SSR), structured data (schema.org/Car per listing),
  auto-generated sitemaps, slug URLs like `/vehicles/2022-toyota-camry-vin123`

### Dealer Dashboard (`apps/dashboard`)
- Inventory management: add / edit / publish / mark sold
- Bulk CSV import for inventory
- Lead management (CRM): all leads, assign to staff, track status pipeline
- Test drive calendar
- Order / deal management: inquiry → negotiation → financed → sold
- Customer profiles
- Document uploads (contracts, titles)
- Staff management (roles: DEALER_ADMIN, SALES_AGENT, FINANCE_MANAGER)
- Notifications center (new leads, booked test drives)
- Analytics: vehicle views, lead conversion, revenue summary

### Platform Admin (`apps/admin`)
- James's internal panel only
- Tenant/dealer onboarding and management
- Subscription and billing overview
- Feature flags per tier
- Platform-wide MRR, churn, active dealers

---

## 3. Technical Architecture

### Monorepo Structure

```
autonova/                         ← Turborepo root
├── apps/
│   ├── api-gateway/              ← HTTP (port 3000) — only public-facing service
│   │   └── src/
│   │       ├── common/
│   │       │   ├── filters/      ← RpcExceptionFilter (global RPC→HTTP mapping)
│   │       │   ├── services/     ← BaseGatewayService (timeout + error handling)
│   │       │   ├── decorators/   ← @TenantId(), @CurrentUser(), @Roles()
│   │       │   ├── guards/       ← JwtAuthGuard, RolesGuard
│   │       │   ├── strategies/   ← JWT strategy
│   │       │   └── dto/          ← PaginationDto (shared base)
│   │       ├── auth/
│   │       │   ├── dto/          ← RegisterDto, LoginDto, RefreshTokenDto
│   │       │   ├── auth.gateway.service.ts
│   │       │   ├── auth.controller.ts
│   │       │   └── auth.module.ts
│   │       ├── tenants/          ← same pattern: dto/ + gateway.service + controller + module
│   │       ├── users/
│   │       ├── vehicles/
│   │       ├── leads/
│   │       ├── orders/
│   │       └── payments/
│   ├── auth-service/             ← TCP 3001
│   ├── tenants-service/          ← TCP 3002
│   ├── users-service/            ← TCP 3003
│   ├── vehicles-service/         ← TCP 3004
│   ├── leads-service/            ← TCP 3005
│   ├── orders-service/           ← TCP 3006
│   ├── notifications-service/    ← TCP 3007
│   ├── media-service/            ← TCP 3008
│   ├── analytics-service/        ← TCP 3009
│   ├── payments-service/         ← TCP 3010
│   ├── web/                      ← Next.js 15, port 3100 (customer storefront)
│   ├── dashboard/                ← Next.js 15, port 3101 (dealer dashboard)
│   └── admin/                    ← Next.js 15, port 3102 (platform admin)
├── packages/
│   ├── types/                    ← shared TypeScript interfaces, payload types, message patterns
│   ├── database/                 ← TypeORM config helper (createDatabaseConfig) + BaseEntity
│   ├── config/                   ← shared tsconfig.base.json + prettier
│   └── ui/                       ← shared React components (built out in Phase 1 frontend)
├── docker-compose.yml            ← SQL Server (port 1433) + init service (creates autonova DB)
├── .env.development              ← dev secrets (gitignored)
└── turbo.json                    ← build pipeline
```

### Why These Choices

| Decision | Choice | Why |
|----------|--------|-----|
| Monorepo tool | Turborepo | Lightweight, handles NestJS + Next.js together, shared types without drift |
| Backend framework | NestJS | TypeScript-first, microservice support built-in, decorator-based DI |
| Transport | TCP | Zero infra overhead to start; swap to RabbitMQ/Kafka later without changing business logic |
| Database | SQL Server | Dealer requirement; Azure SQL in production (managed, Nigeria + UK regions) |
| ORM | TypeORM | Best NestJS SQL Server support |
| Frontend | Next.js 15 (App Router) | SSR is non-negotiable — Google must index vehicle listing pages |
| Auth | JWT + refresh tokens | Stateless access tokens (15min), rotatable refresh tokens (7d, stored hashed) |
| Password hashing | bcryptjs | Pure JS replacement for bcrypt — no native compilation issues on Windows/Node 22 |
| Payments | Stripe + Paystack | Stripe for UK/Global, Paystack for Nigeria/Africa — abstracted behind one service |
| Media | Cloudinary | Free tier, auto-resize, global CDN, no infra to manage |
| Email | Resend | Simpler API than SendGrid, generous free tier |
| SMS/WhatsApp | Twilio | Africa + UK coverage |
| Cache | Redis | Session caching, hot vehicle listings, rate limiting |
| Deployment (dev) | Railway | Cheapest managed option to start |
| Deployment (prod) | Azure | Native SQL Server (Azure SQL), Nigeria + UK regions, enterprise SLA |

---

## 4. Multi-Tenancy — The Most Important Rule

**Every entity has a `tenantId` column. Every query filters by `tenantId`. No exceptions.**

### How tenantId is resolved in the API Gateway

1. **Development**: send `X-Tenant-ID: <uuid>` header — gateway reads it directly
2. **Production**: gateway parses subdomain from `Host` header
   (`dealer1.autonova.io` → slug `dealer1` → calls tenants-service to get `tenantId`)
3. The resolved `tenantId` is attached to every TCP message sent downstream

### Tenant Isolation Strategy

- **Shared database, `tenantId` column** (not separate schemas or databases)
- Reason: cheapest, simplest to start; can migrate high-value tenants to dedicated DB later
- All TypeORM queries MUST include `where: { tenantId }` — never query without it

### BaseEntity (packages/database/src/base.entity.ts)

All domain entities extend `BaseEntity` which provides:
- `id` (UUID, primary key)
- `tenantId` (string, non-nullable, indexed)
- `createdAt`, `updatedAt`

Exception: `Tenant` entity itself does not extend BaseEntity (it has no tenantId).

---

## 5. Authentication & Authorization

### JWT Flow

```
POST /api/v1/auth/register  → auth-service → users-service (create user)
                             → returns { accessToken, refreshToken, user }

POST /api/v1/auth/login     → auth-service → users-service (find by email)
                             → bcrypt compare password
                             → rotate refresh token
                             → returns { accessToken, refreshToken, user }

POST /api/v1/auth/refresh   → auth-service (no JWT guard)
                             → validate refresh token hash in DB
                             → issue new access token + rotate refresh token
                             → returns { accessToken, refreshToken }

POST /api/v1/auth/logout    → auth-service (JWT guard required)
                             → revoke all refresh tokens for user+tenant
                             → returns { message }
```

### Token Details

- **Access token**: JWT, 15min expiry, signed with `JWT_ACCESS_SECRET`
- **Refresh token**: 80-char random hex, 7-day expiry, stored as **SHA256 hash** in DB
  (SHA256 not bcrypt — refresh tokens have entropy from randomness, not user input)
- **Refresh token rotation**: every use invalidates the old token and issues a new one
- **JWT payload**: `{ sub: userId, email, role, tenantId, iat, exp }`

### Roles

```
PLATFORM_ADMIN   ← James — full access to everything
DEALER_ADMIN     ← dealership owner/manager — full access within their tenant
FINANCE_MANAGER  ← can manage orders and financing
SALES_AGENT      ← can manage inventory and leads
CUSTOMER         ← registered buyer — can view own orders, wishlist
```

### Guards in API Gateway

- `JwtAuthGuard` — validates token signature, attaches `req.user`
- `RolesGuard` — checks `req.user.role` against `@Roles(...)` decorator
- Public routes (no guard): GET /vehicles, GET /vehicles/:id, POST /leads, POST /auth/*

---

## 6. Service Responsibilities

### api-gateway (port 3000)
- The ONLY service that accepts HTTP from the outside world
- Resolves tenant from request (`X-Tenant-ID` header in dev, subdomain in prod)
- Validates JWT locally (no call to auth-service per request)
- Swagger UI available at `http://localhost:3000/api/v1/swagger`

#### api-gateway internal architecture (3 layers — never skip)

```
Controller  → HTTP concerns only: routing, guards, decorators, delegate
               - No ClientProxy, no firstValueFrom, no business logic
               - Uses @TenantId() and @CurrentUser() decorators
               - Max 3 lines per method body

GatewayService → extends BaseGatewayService, calls send() for each operation
               - Owns the TCP ClientProxy injection
               - Maps DTO fields + tenantId into TCP payload
               - One method per controller action

BaseGatewayService → single send<T>(client, pattern, payload) implementation
               - Applies 10s timeout via RxJS timeout() operator
               - Maps RpcException / TimeoutError → HttpException
               - All gateway services inherit this automatically
```

#### RpcExceptionFilter (global)
Registered in `main.ts`. Catches any `RpcException` that escapes a gateway service
and converts it to a proper HTTP JSON response with correct status code.

#### DTOs (in apps/api-gateway/src/{module}/dto/)
- **Request body DTOs** — validated with `class-validator`, documented with `@ApiProperty`
- **Query DTOs** — extend `PaginationDto` for list endpoints, typed query params
- Controllers use typed DTOs, never `body: any` or `query: any`

### auth-service (port 3001)
- Issues and validates tokens
- Manages refresh_tokens table
- Calls users-service to create/find users (auth-service has NO users table)
- All password hashing happens here (bcryptjs, 12 rounds)

### tenants-service (port 3002)
- Source of truth for all dealer accounts
- Manages slug → tenantId resolution
- Stores subscription tier, country, currency, locale per dealer
- Stores Stripe/Paystack customer IDs

### users-service (port 3003)
- Source of truth for all user accounts across all tenants
- Returns password hash only to auth-service (for login validation)
- All other callers receive sanitized user (no password field)
- Unique constraint: (tenantId + email) — same email can exist across different tenants

### vehicles-service (port 3004)
- Full vehicle inventory CRUD
- Search with filters: make, model, year range, price range, condition,
  transmission, fuel type, status
- Tracks: mileageUnit (KM/MILES), driveType (RHD/LHD), currency per vehicle
- Status lifecycle: DRAFT → AVAILABLE → RESERVED → SOLD

### leads-service (port 3005)
- Captures all customer enquiries (INQUIRY, TEST_DRIVE, TRADE_IN, FINANCING)
- CRM pipeline: NEW → CONTACTED → QUALIFIED → LOST → CONVERTED
- Assigning leads to staff agents
- Linked to optional vehicleId and customerId
- After `create()`: emits `NOTIFY_NEW_LEAD` fire-and-forget to notifications-service
- After `update()` when `assignedTo` changes to a **new** user: emits `NOTIFY_LEAD_ASSIGNED` fire-and-forget
  - Comparison is always made against the previous value — SMS only fires on a genuine reassignment, not on every update

### orders-service (port 3006)
- Represents a committed deal
- Types: PURCHASE, FINANCING, LEASE
- Status: PENDING → NEGOTIATING → FINANCED → COMPLETED / CANCELLED
- Sets `closedAt` automatically when status reaches COMPLETED or CANCELLED

### notifications-service (port 3007)
- Email via Resend, SMS + WhatsApp via Twilio
- Stateless — sends notifications, does not store sent history
- Credentials in `.env.development` — uses placeholder detection; gracefully skips if placeholders are present (never crashes)

**Notification triggers (Phase 2):**

| Event | Who gets notified | Channel |
|-------|-------------------|---------|
| New enquiry created | Dealer (tenant email) | Email |
| New enquiry created | Customer (lead email) | Email (confirmation) |
| New enquiry created | Dealer (tenant phone) | SMS (if phone on file) |
| Lead assigned to agent | Assigned sales agent | SMS (if agent has phone) |

**Critical architectural rule — `emit` vs `send`:**
- `client.emit()` → **fire-and-forget** → must be handled by `@EventPattern()` in the receiving service
- `client.send()` → **request-response** → must be handled by `@MessagePattern()` in the receiving service
- Notification triggers (`NOTIFY_NEW_LEAD`, `NOTIFY_LEAD_ASSIGNED`) use `emit` + `@EventPattern` — never block the caller
- Direct notification calls (`SEND_EMAIL`, `SEND_SMS`, `SEND_WHATSAPP`) use `send` + `@MessagePattern` — caller can await the result

**Why Resend for email:** Developer-first API, generous free tier (3,000/mo), React Email support for future template upgrades, strong deliverability. Needs a verified domain (`freshautosworld.com`) for production sends.

**Why Twilio for SMS/WhatsApp:** Covers Nigeria (+234) and UK (+44) in one integration. Official WhatsApp Business API partner — the only programmatic route to WhatsApp. SMS is preferred over email for time-sensitive dealer alerts.

### media-service (port 3008)
- Handles vehicle image upload/delete via Cloudinary (wired in Phase 2)
- Stores images under `autonova/{tenantId}/vehicles/` on Cloudinary
- Auto-transforms on upload: max 1200×800, quality auto, WebP format
- Returns `{ url, publicId }` — URL stored in vehicles-service `images` array
- Credentials in `.env.development` — detects placeholders and skips gracefully
- Exposed via api-gateway: `POST /vehicles/:id/images`, `DELETE /vehicles/:id/images`
- vehicles-service has `addImage` / `removeImage` methods that manage the `images[]` array

### analytics-service (port 3009)
- Deferred to Phase 4
- Will track: vehicle page views, lead conversion funnel, revenue by period
- Likely powered by TimescaleDB or ClickHouse later; SQL Server for now

### payments-service (port 3010)
- Abstracts Stripe (UK/Global) and Paystack (Nigeria/Africa) behind one interface
- Subscription creation routes to correct gateway based on `payload.gateway`
- Webhook handlers verify signatures (Stripe: HMAC, Paystack: HMAC SHA512)
- Subscription DB entity + persistence added in Phase 3

---

## 7. Development Phases

### Phase 1 — Core Platform (complete ✓)
All 11 services, auth flow, tenant/vehicle/lead CRUD, Swagger UI, dashboard + storefront Phase 1 UIs.

---

### Phase 2 — CRM & Notifications (complete ✓ — credentials pending)
Resend email + Twilio SMS wired; Cloudinary media upload; lead detail, image upload, test drive calendar, orders, staff management UIs; white-label storefront.
- [ ] Replace placeholder Resend/Twilio credentials in `.env.development`
- [ ] Replace placeholder Cloudinary credentials in `.env.development`

---

### Phase 3 — Monetization & CRM Depth

#### Monetization
- [x] Stripe subscription creation (payments-service) — needs STRIPE_SECRET_KEY + Price IDs
- [x] Paystack subscription creation — needs PAYSTACK_SECRET_KEY + plan codes
- [x] Payments DB entity (track active subscriptions) — `subscriptions` table in payments-service
- [x] Enforce tier limits in tenants-service (listing count, staff count) — 402 on breach
- [x] Billing portal links for dealers — Stripe Customer Portal session; Paystack shows billing-by-email note
- [x] Platform admin: dealer subscription overview — `apps/admin` fully built (port 3102)

#### Storefront
- [x] Price range filter — `minPrice`/`maxPrice` inputs → `GET /vehicles`
- [x] Filter sidebar on desktop (`lg+`) — fixed left sidebar; top bar on mobile
- [x] Larger vehicle photos on cards — `VehicleCard` image height increased
- [x] Dealer info / about page (`/about`) — hours, map, contact, WhatsApp
- [x] Replace white-label env vars with `GET /api/v1/tenants/public/:slug`
- [x] Vehicle comparison — side-by-side up to 3 vehicles (client-side, URL params)
- [x] Financing calculator — client-side only
- [x] Sitemap (`app/sitemap.ts`) — dynamic, AVAILABLE vehicles, ISR revalidation
- [x] Wishlist / saved vehicles (localStorage for guests)

#### Dashboard
- [x] Notifications center — bell icon, polls new leads
- [x] Customer profiles — deduplicated by email, shows all interactions
- [x] Document uploads (contracts, titles) — attached to orders via media-service
- [x] Password change — staff can change own password from settings

---

### Phase 4 — Growth Features
- [ ] analytics-service: vehicle views, lead funnel, revenue charts
- [ ] AI vehicle descriptions (Claude API — auto-generate from specs)
- [ ] Smart pricing suggestions (compare vs market data)
- [ ] WhatsApp Business API integration
- [ ] Social media auto-posting (new vehicle → Facebook/Instagram)
- [ ] Custom domain support per dealer (Cloudflare Workers)
- [ ] PWA manifest for customer website
- [ ] Bulk CSV import for inventory
- [ ] Price drop alerts (email/SMS when vehicle price drops)
- [ ] Trade-in estimator on storefront

---

### Phase 5 — Production & Scale

#### Infrastructure (all already in `docker-compose.yml` — needs wiring)
- [ ] **TCP → RabbitMQ** — adds retry, dead letter queue, persistence; only `ClientsModule` config changes per service
- [ ] **Redis** — cache `GET /vehicles` (TTL 60s) + sliding-window rate limiting at api-gateway
- [ ] **Elasticsearch** — replace SQL `LIKE` search in vehicles-service; SQL Server stays source of truth
- [ ] **Loki + Grafana** — centralized log aggregation via Promtail/Fluent Bit (Loki for logs, Elasticsearch+Kibana for search)

#### Reliability & Compliance
- [ ] Azure SQL deployment (managed, Nigeria + UK regions)
- [ ] GitHub Actions CI/CD (build → test → deploy on push to main)
- [ ] Sentry error tracking in all services
- [ ] Load testing (k6 or Artillery — 100 concurrent dealers)
- [ ] Multi-language (i18n) for web + dashboard
- [ ] GDPR compliance: data export, data deletion, cookie consent
- [ ] NDPR compliance (Nigeria Data Protection Regulation)

---

## 8. Key Business Rules (enforce in code)

1. **A dealer cannot access another dealer's data** — tenantId filter is mandatory
2. **Passwords are never returned from users-service** — `sanitize()` strips password field
3. **Refresh tokens are single-use** — each use rotates (old revoked, new issued)
4. **Slug is immutable after creation** — changing a dealer's slug breaks their subdomain URL
5. **Vehicle status follows the lifecycle** — DRAFT → AVAILABLE → RESERVED → SOLD (no skipping)
6. **Lead creation is public** — no auth required (customers submit forms without accounts)
7. **Vehicle browsing is public** — GET /vehicles and GET /vehicles/:id require no auth
8. **Closing an order sets closedAt** — orders-service does this automatically on COMPLETED/CANCELLED
9. **Platform admin bypasses tenant isolation** — PLATFORM_ADMIN role can query across tenants
10. **Currency is stored per entity** — never assume a global currency; always store with the record

---

## 9. Regional Rules

### Nigeria (NG / NGN)
- Payment gateway: **Paystack**
- Vehicles: right-hand drive, km for mileage
- Phone numbers: +234 format
- Common fuel types: PETROL, DIESEL
- NDPR compliance required

### United Kingdom (GB / GBP)
- Payment gateway: **Stripe**
- Vehicles: right-hand drive, miles for mileage
- GDPR compliance required (also covers EU expansion)
- Growing EV market — ELECTRIC, HYBRID fuel types important

### Global (USD as fallback)
- Stripe by default
- Language: English (expand later)
- Drive side: depends on country — store `driveType` per vehicle

---

## 10. Running Locally

```bash
# 1. Open project
cd C:\Users\HP\Development\autonova

# 2. Start infrastructure (SQL Server only — Redis added when needed)
docker-compose up -d        # SQL Server on 1433; init service auto-creates autonova DB

# 3. Install dependencies
yarn install

# 4. Start all backend services
yarn dev:backend             # browser opens http://localhost:3000/api/v1/swagger automatically

# 5. Start customer website (separate terminal)
yarn dev:web

# 6. Start dealer dashboard (separate terminal)
yarn dev:dashboard
```

**Notes:**
- No need to copy `.env` — services load `.env.development` / `.env.staging` / `.env.production` directly based on `NODE_ENV`
- The `autonova` database is created automatically on first boot (no manual SQL required)
- Connect SSMS to `localhost,1433` (sa / YourStrong@Passw0rd) to inspect the database

### Service URLs (local)

| Service | URL |
|---------|-----|
| API Gateway | http://localhost:3000/api/v1 |
| Swagger UI | http://localhost:3000/api/v1/swagger |
| Customer Website | http://localhost:3100 |
| Dealer Dashboard | http://localhost:3101 |
| Platform Admin | http://localhost:3102 |

### Smoke test sequence (use Swagger UI)

```
1. POST /api/v1/tenants              → create freshautosworld (no X-Tenant-ID needed)
2. POST /api/v1/auth/register        → register DEALER_ADMIN (X-Tenant-ID = id from step 1)
3. POST /api/v1/auth/login           → get accessToken + refreshToken
4. Authorize in Swagger (Bearer token)
5. POST /api/v1/vehicles             → add a vehicle
6. GET  /api/v1/vehicles             → list inventory (public)
7. POST /api/v1/leads                → submit enquiry (public, no auth)
8. POST /api/v1/auth/refresh         → rotate tokens
9. POST /api/v1/auth/logout          → revoke tokens
```

---

## 11. Code Conventions

### General
- **No comments unless the WHY is non-obvious** — names should explain the what
- **No `any` types in shared packages** — use types from `@autonova/types`
- **Git commits follow conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`
- **Every tested endpoint must be logged** — after verifying an endpoint works, update `docs/api-test-log.md` with the exact request, response, dependencies, and business rules verified. Do not mark a phase complete without updating this file.

### api-gateway rules (strict)
- **Controllers contain zero logic** — 3 lines max per method: guards/decorators + delegate
- **No `ClientProxy` in controllers** — lives in the gateway service only
- **No `firstValueFrom` in controllers** — gateway service owns the TCP call
- **No `@Req() req: any`** — use `@TenantId()` for tenant context, `@CurrentUser()` for user
- **Every endpoint has `@ApiOperation` + `@ApiResponse`** — Swagger must be self-documenting
- **Every body is a typed DTO** — never `@Body() body: any`
- **Every query is a typed DTO** — extends `PaginationDto` for list endpoints
- **PUT vs PATCH**: use `@Put` only for full resource replacement; use `@Patch` for partial updates (all optional fields). When in doubt — if any field in the DTO is optional, it's `@Patch`

### Microservice rules
- **Services return plain objects, not HTTP exceptions** — use `RpcException({ message, statusCode })`
- **All TypeORM queries include `where: { tenantId }`** — no exceptions
- **Entity relations are by ID, not TypeORM joins** — services don't join across service boundaries
- **Pagination is always `{ data, total, page, limit, totalPages }`** — use `PaginatedResponse<T>`

### Database
- **`createDatabaseConfig` is async** — connects to `master` first, auto-creates the target DB
- **`synchronize: true` in dev only** — use migrations in staging/production
- **All entities extend `BaseEntity`** — provides `id`, `tenantId`, `createdAt`, `updatedAt`
- **Exception**: `Tenant` entity does not extend `BaseEntity` (has no tenantId)

---

## 12. Environment Variables Reference

See `.env.development` / `.env.staging` / `.env.production` for the full list with descriptions. Key ones:

| Variable | Used by |
|----------|---------|
| `JWT_ACCESS_SECRET` | api-gateway (verify), auth-service (sign) |
| `JWT_REFRESH_SECRET` | auth-service only |
| `DB_HOST` | all DB services (default: localhost) |
| `DB_PORT` | all DB services (default: 1433) |
| `DB_USERNAME` | all DB services (default: sa) |
| `DB_PASSWORD` | all DB services |
| `DB_DATABASE` | all DB services (default: autonova) |
| `DB_INSTANCE` | all DB services — set to `SQLEXPRESS` for named instance, blank for Docker |
| `STRIPE_SECRET_KEY` | payments-service |
| `PAYSTACK_SECRET_KEY` | payments-service |
| `CLOUDINARY_*` | media-service |
| `RESEND_API_KEY` | notifications-service |
| `TWILIO_*` | notifications-service |

---

## 13. Adding a New Service (checklist)

**Microservice:**
1. Create `apps/<name>-service/` with: `package.json`, `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`
2. Add TCP port to `.env.development` / `.env.staging` / `.env.production`
3. Add message patterns to `packages/types/src/message-patterns.ts`
4. Add `SERVICES.<NAME>` constant to `packages/types/src/message-patterns.ts`
5. Add payload interfaces to appropriate file in `packages/types/src/`
6. Update `turbo.json` if the service has unique build requirements
7. Update this CLAUDE.md under Section 6 with the service's responsibilities

**api-gateway integration (follow the 3-layer pattern):**
8. Create `apps/api-gateway/src/<name>/dto/` — request body DTOs + query DTOs
9. Create `apps/api-gateway/src/<name>/<name>.gateway.service.ts` extending `BaseGatewayService`
10. Create `apps/api-gateway/src/<name>/<name>.controller.ts` — delegates only, no logic
11. Create `apps/api-gateway/src/<name>/<name>.module.ts` — registers `ClientsModule` + provides gateway service
12. Import the new module in `apps/api-gateway/src/app.module.ts`

---

## 14. Frontend Standards (Non-Negotiable)

Full rules: **[`docs/FRONTEND.md`](docs/FRONTEND.md)**

Summary of key constraints:
- **Mobile-first**, 320px–2560px. Touch targets 44×44px min. No page-level horizontal scroll.
- **WCAG 2.1 AA**: semantic HTML, visible focus rings, ARIA labels on icon buttons, `aria-describedby` on form errors.
- **Design tokens only** — no hardcoded hex. `lucide-react` icons only. `rounded-xl` cards, `rounded-lg` buttons.
- **Server Components by default** — `'use client'` only for hooks/events/browser APIs.
- **Mutations via Server Actions** — never client-side fetch for data writes.
- **URL as state** for filters/pagination (`useSearchParams` + `router.push`).
- **Skeletons not spinners** for loading states. Empty states need icon + title + description + action.
- **formatCurrency / formatDate / formatMileage** from `@/lib/utils` — never hardcode units or symbols.
