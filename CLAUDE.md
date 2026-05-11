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
**Goal: a working dealership website end-to-end**

Backend (complete ✓):
- [x] All 11 services boot cleanly (`yarn dev:backend`)
- [x] SQL Server auto-provisioned via `createDatabaseConfig` + docker-compose init service
- [x] api-gateway layered architecture: Controller → GatewayService → BaseGatewayService
- [x] Global RpcExceptionFilter — all RPC errors map to correct HTTP responses
- [x] All request bodies and query params are typed DTOs with class-validator
- [x] Swagger UI at `http://localhost:3000/api/v1/swagger`
- [x] Smoke tested: auth flow (register → login → refresh → logout)
- [x] Smoke tested: tenant CRUD
- [x] Smoke tested: vehicle CRUD (create, publish, search)
- [x] Smoke tested: lead creation (public inquiry form)

Frontend (`apps/dashboard`) — complete ✓:
- [x] Tailwind CSS + design system configured
- [x] Login page (httpOnly cookies, Server Actions)
- [x] Dashboard home (KPI stats cards + recent activity)
- [x] Inventory list + add vehicle form (Zod-validated)
- [x] Leads list + inline status update with toast feedback
- [x] Mobile-responsive (sidebar drawer, 44px touch targets, WCAG 2.1 AA)
- [x] CLAUDE.md hierarchy: root + app-level files for all apps

Frontend (`apps/web`) — complete ✓:
- [x] Tailwind CSS + design tokens (match dashboard)
- [x] API client utility (public fetch wrapper, ISR revalidation)
- [x] Public layout — sticky navbar (mobile drawer) + footer
- [x] Homepage — hero, features strip, featured vehicles, dealer CTA
- [x] Vehicle listing page (SSR, filter bar, URL-based filters, pagination)
- [x] Vehicle detail page (specs grid, JSON-LD, sticky enquiry sidebar, WhatsApp CTA)
- [x] Enquiry Server Action → POST /leads (Zod-validated, no auth)

**Deliverable: freshautosworld can sign up, add vehicles, customers can browse and submit enquiries**

---

### Phase 2 — CRM & Notifications
- [x] Wire Resend (email) + Twilio (SMS/WhatsApp) in notifications-service
- [x] Email to dealer on new enquiry + confirmation email to customer
- [x] SMS alert to dealer on new enquiry (if tenant has phone on file)
- [x] SMS alert to assigned sales agent when a lead is assigned to them
- [ ] Replace placeholder API keys with real Resend + Twilio credentials in .env.development
- [x] Implement Cloudinary upload in media-service — POST /vehicles/:id/images + DELETE /vehicles/:id/images
- [ ] Replace placeholder Cloudinary credentials in .env.development
- [x] Dashboard: lead detail + status update UI — /leads/[id] with status pipeline, agent assignment, notes, quick contact (email/phone/WhatsApp)
- [x] Dashboard: vehicle image upload UI — /inventory/[id] with drag-and-drop upload, image gallery, delete; add-vehicle redirects to detail page after creation
- [ ] Dashboard: test drive calendar
- [x] Dashboard: order/deal management UI — /orders list, /orders/new create form, /orders/[id] detail with status pipeline + notes
- [x] Dashboard: staff management UI — /staff list with inline role change and deactivate, /staff/invite form (DEALER_ADMIN only)
- [ ] White-label storefront per tenant — fetch dealer name, logo, contact info from tenants-service and display on apps/web navbar, footer, page titles and about page instead of AutoNova branding

---

### Phase 3 — Monetization
- [ ] Implement Stripe subscription creation (payments-service)
- [ ] Implement Paystack subscription creation
- [ ] Payments DB entity (track active subscriptions)
- [ ] Enforce tier limits in tenants-service (listing count, staff count)
- [ ] Billing portal links for dealers
- [ ] Platform admin: dealer subscription overview

---

### Phase 4 — Growth Features
- [ ] analytics-service: vehicle views, lead funnel, revenue charts
- [ ] AI vehicle descriptions (Claude API — auto-generate from specs)
- [ ] Smart pricing suggestions (compare vs market data)
- [ ] WhatsApp Business API integration
- [ ] Social media auto-posting (new vehicle → Facebook/Instagram)
- [ ] Custom domain support per dealer (Cloudflare Workers)
- [ ] PWA manifest for customer website

---

### Phase 5 — Production & Scale

#### Infrastructure Upgrades

- [ ] **TCP → RabbitMQ transport migration**
  - Why: TCP works for Phase 1-4 but has no retry, no dead letter queue, no persistence. If a service is temporarily down, messages are lost. RabbitMQ adds reliable delivery, message acknowledgment, and retry with backoff — critical once real dealers depend on notifications.
  - How: NestJS abstracts the transport layer. Only the `ClientsModule` config in each service changes — zero business logic changes. This is the payoff for the clean microservice architecture we built.
  - Already in `docker-compose.yml` — just needs wiring up.

- [ ] **Redis — caching + rate limiting**
  - Why caching: `GET /vehicles` is public and unauthenticated — the most-hit endpoint. Without caching, every customer page load hits SQL Server. Redis caches the paginated vehicle listings (TTL 60s) eliminating redundant DB reads.
  - Why rate limiting: public endpoints need protection against abuse and scraping. Redis-based rate limiting (sliding window) at the api-gateway level.
  - Already in `docker-compose.yml` — just needs wiring up.

- [ ] **Elasticsearch — vehicle search engine** (replaces SQL `LIKE` queries)
  - Why: SQL Server `LIKE '%toyota%'` and `Between` for price/year ranges work for Phase 1-2 but break down when dealers have 200+ vehicles and customers filter by 5+ criteria simultaneously. Elasticsearch handles faceted search, relevance ranking, and typo tolerance (`Toyot` → Toyota) natively.
  - Scope: index vehicle listings in Elasticsearch on create/update via vehicles-service. Replace `search()` method in vehicles-service to query Elasticsearch instead of SQL. SQL Server remains the source of truth.
  - Already in `docker-compose.yml` — just needs wiring up.

- [ ] **Loki + Grafana — centralized log aggregation** (replaces ad-hoc terminal logs)
  - Why Loki over Kibana/Elasticsearch for logs: Elasticsearch is heavy infrastructure. Loki is purpose-built for logs — it indexes only metadata (labels), not full log content, making it 10x cheaper to run. Grafana is already the industry standard dashboard for operational monitoring.
  - Why not Kibana for logs: We're already using Elasticsearch for vehicle search. Kibana would give us a second tool for logs when Grafana covers the same need more cheaply. Separate concerns: Elasticsearch + Kibana for search/analytics, Loki + Grafana for logs.
  - Scope: add a Loki datasource to Grafana, ship logs from all 11 services via a log shipper (Promtail or Fluent Bit).

#### Reliability & Compliance

- [ ] Azure SQL deployment (production SQL Server — Azure SQL managed, Nigeria + UK regions)
- [ ] GitHub Actions CI/CD pipeline (build → test → deploy on push to main)
- [ ] Sentry error tracking in all services (why: real-time error alerts with stack traces, better than reading Loki logs reactively — Sentry is proactive, Loki is archival)
- [ ] Load testing (k6 or Artillery — validate system under 100 concurrent dealers)
- [ ] Multi-language (i18n) for web + dashboard
- [ ] GDPR compliance: data export endpoint, data deletion endpoint, cookie consent
- [ ] NDPR compliance (Nigeria Data Protection Regulation — overlaps with GDPR)

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

AutoNova is sold internationally to real businesses. Every screen must meet the standard
of a commercial SaaS product (think: Linear, Vercel, Stripe Dashboard). These rules apply
to **every** component and page in `apps/dashboard`, `apps/web`, and `apps/admin`.

### Responsive Design — Mobile-First, Always

- **Default to mobile layout**, then enhance for larger screens with `sm:`, `md:`, `lg:`, `xl:` prefixes
- Every page must be **fully usable on 320px width** (smallest common phone) up to 2560px (wide monitor)
- **Breakpoints** (Tailwind defaults — do not deviate):
  - `sm` = 640px (landscape phone)
  - `md` = 768px (tablet)
  - `lg` = 1024px (laptop — sidebar shows on dashboard)
  - `xl` = 1280px (desktop)
  - `2xl` = 1536px (wide monitor)
- **Dashboard sidebar**: hidden on mobile (< `lg`), visible as fixed sidebar on `lg+`. On mobile, opens as a slide-in drawer overlay controlled by a hamburger button in the header. Never block the main content on any screen size.
- **Grid columns**: use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` patterns — never assume two columns will fit on a phone
- **Touch targets**: minimum 44×44px for all interactive elements (buttons, links, form inputs) — this is WCAG 2.5.5 and Apple HIG requirement
- **Tables / lists**: on mobile, stack columns vertically or allow horizontal scroll with `overflow-x-auto` — never let content overflow the viewport
- **Forms**: single-column on mobile, multi-column only on `sm+` — inputs must be full-width on small screens
- **Typography scale**: body text minimum `text-sm` (14px) — never go below 12px for non-decorative text
- **No horizontal scroll** on the page level — if content is wide, wrap or scroll within a container

### Accessibility (WCAG 2.1 AA — Mandatory)

- **Semantic HTML first**: use `<nav>`, `<main>`, `<header>`, `<aside>`, `<section>`, `<article>`, `<button>`, `<a>` correctly. Never use `<div>` as a button.
- **Focus management**: every interactive element must be reachable and operable with keyboard alone. Tab order must be logical.
- **Focus ring**: all focusable elements must have a visible focus ring — never `outline: none` without an alternative. Use the `focus-ring` utility class.
- **Color contrast**: text must meet AA contrast ratios — 4.5:1 for normal text, 3:1 for large text. Never use muted-foreground text on muted backgrounds for important information.
- **ARIA labels**: icon-only buttons MUST have `aria-label`. Decorative images use `alt=""`. Meaningful images have descriptive `alt` text.
- **`role` attributes**: use `role="alert"` for error messages, `role="status"` for success notifications, `role="dialog"` for modals.
- **Screen reader announcements**: use `aria-live="polite"` for dynamic content updates (toast notifications, status changes). Use `aria-live="assertive"` only for critical errors.
- **`sr-only` class**: use for text that should be read by screen readers but not visible (e.g., icon button labels, skip links).
- **Skip navigation link**: `apps/web` must have a "Skip to main content" link as the first focusable element.
- **Form labels**: every `<input>`, `<select>`, `<textarea>` MUST have an associated `<label>` (use `htmlFor` / `id` pairing or wrap in `<label>`). Never rely on `placeholder` as the label.
- **Error messages**: form errors must be programmatically associated with their input using `aria-describedby`.
- **Loading states**: use `aria-busy="true"` on containers while loading, or replace with skeleton UI.
- **Modal / dialog**: when opened, focus must move inside. `Escape` must close it. Focus must return to the trigger on close.

### Visual Design Quality — International Commercial Standard

- **Design tokens only**: never hardcode hex colors. Use only CSS variables (`text-foreground`, `bg-card`, `text-muted-foreground`, etc.) from the design system.
- **Spacing system**: use only Tailwind spacing scale (multiples of 4px). Never use `px-3.5` for layout spacing — reserve odd values for fine-tuning small components.
- **Typography hierarchy**: every page has exactly one `<h1>`. Section headings use `<h2>`. Sub-sections use `<h3>`. Never skip heading levels.
- **No orphaned elements**: every page must have a clear information hierarchy — title → description → content → actions. Never dump content without context.
- **Skeleton loaders, not spinners**: use animated skeleton placeholders for loading states. Full-page spinners are only acceptable for authentication redirects.
- **Empty states are content**: every empty list/table must have an icon, a title, a helpful description, and a primary action (e.g., "Add first vehicle"). Never show a blank area.
- **Consistent border radius**: use `rounded-xl` for cards/panels, `rounded-lg` for buttons/inputs, `rounded-full` for avatars/badges. Do not mix arbitrarily.
- **Shadows with purpose**: `shadow-sm` for cards at rest, `shadow-md` on hover/active, `shadow-lg` for dropdowns/modals, `shadow-xl` for dialogs. Never use shadows decoratively.
- **Icon consistency**: all icons from `lucide-react` only. Size: `h-4 w-4` for inline/button icons, `h-5 w-5` for nav items, `h-6 w-6` for feature icons, `h-8 w-8` for empty state icons. Never mix icon libraries.
- **Animation with restraint**: use subtle transitions (`transition-colors`, `transition-shadow`, `transition-transform`) for hover/active states. Avoid layout-shifting animations. Respect `prefers-reduced-motion`.
- **Images**: all `<img>` tags must have explicit `width` and `height` to prevent Cumulative Layout Shift (CLS). Use Next.js `<Image>` component for all images in Next.js apps.
- **Loading performance**: lazy-load images below the fold. Import heavy third-party components dynamically with `next/dynamic`.

### Component Architecture Rules (Frontend)

```
components/
  ui/          ← Atoms: Button, Input, Badge, Card, Label, Select, Textarea
               ← No business logic. Pure styling primitives only.
               ← Never import from app/ or lib/api/

  common/      ← Molecules: StatsCard, PageHeader, EmptyState, Toaster, Pagination
               ← Composed from ui/ atoms + minor logic (e.g., toast auto-dismiss)
               ← Never import from specific features (inventory/, leads/)

  layout/      ← Organisms: Sidebar, Header
               ← May read from stores. No API calls.

  features/    ← Feature-specific components (e.g., VehicleCard, LeadRow)
               ← Knows about domain types. May receive server-fetched data as props.
```

- **Server Components by default** — only add `'use client'` when you need hooks, event handlers, or browser APIs
- **Data fetching in Server Components** — never fetch data in `useEffect`. Use Server Components or Server Actions.
- **No prop drilling beyond 2 levels** — use Zustand store or React context for deeper state
- **Every interactive element that mutates data** uses a Server Action, not a client-side fetch
- **URL as state for filters/pagination** — use `useSearchParams` + `router.push` for filter state so URLs are shareable and back-button works

### Performance Standards

- **Core Web Vitals targets** (measured in production):
  - LCP (Largest Contentful Paint) < 2.5s
  - FID / INP (Interaction to Next Paint) < 200ms
  - CLS (Cumulative Layout Shift) < 0.1
- **Font loading**: use `display: 'swap'` for Google Fonts. Subset to `latin` only unless a market requires extended characters.
- **Image formats**: WebP preferred. Use Next.js `<Image>` with `priority` on above-the-fold images.
- **Bundle size**: dynamic import heavy components (date pickers, rich text editors, charts). Keep the initial bundle under 200KB gzipped.
- **No layout shift from async data**: reserve space with skeleton loaders before data arrives.

### Internationalisation (i18n) Preparation

AutoNova serves Nigeria, UK, and will expand globally. Even before full i18n is implemented:
- **Never hardcode currency symbols** — always use `formatCurrency(amount, currency)` from `@/lib/utils`
- **Never hardcode date formats** — always use `formatDate(date)` from `@/lib/utils`
- **Never hardcode measurement units** — always use `formatMileage(value, unit)` from `@/lib/utils`
- **All user-facing strings in English** for now, but written so they can be extracted into i18n keys later (no string interpolation that breaks translation — use template variables)
- **RTL readiness**: do not use `left`/`right` CSS properties directly — prefer `start`/`end` or Tailwind's `ps-`/`pe-` logical properties where future RTL support is needed
