# AutoNova — Project Bible

> Read this before touching any code. Every decision recorded here has a reason.
> Owner: James (jamesfullstackdeveloper@gmail.com)

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
│   ├── types/                    ← shared TypeScript types, DTOs, message patterns
│   ├── database/                 ← TypeORM config helper + BaseEntity
│   ├── config/                   ← shared tsconfig.base.json + prettier
│   └── ui/                       ← shared React components (built out in Phase 1 frontend)
├── docker-compose.yml            ← SQL Server + Redis for local dev
├── .env.example                  ← all env vars documented
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
- Resolves tenant from request
- Validates JWT locally (no call to auth-service per request)
- Proxies to downstream services via TCP `ClientProxy`
- Never contains business logic — it routes, guards, and forwards

### auth-service (port 3001)
- Issues and validates tokens
- Manages refresh_tokens table
- Calls users-service to create/find users (auth-service has NO users table)
- All password hashing happens here (bcrypt, 12 rounds)

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

### orders-service (port 3006)
- Represents a committed deal
- Types: PURCHASE, FINANCING, LEASE
- Status: PENDING → NEGOTIATING → FINANCED → COMPLETED / CANCELLED
- Sets `closedAt` automatically when status reaches COMPLETED or CANCELLED

### notifications-service (port 3007)
- Email via Resend, SMS via Twilio, WhatsApp via Twilio WhatsApp API
- Stateless — just sends, does not store sent history yet
- Called fire-and-forget from other services (emit not send where possible)
- Integration TODO: wire up Resend + Twilio in Phase 2

### media-service (port 3008)
- Handles vehicle image upload/delete via Cloudinary
- Stores images under `autonova/{tenantId}/vehicles/`
- Returns Cloudinary URLs stored in vehicles-service
- Integration TODO: implement actual Cloudinary upload in Phase 1

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

### Phase 1 — Core Platform (current focus)
**Goal: a working dealership website end-to-end**

Backend:
- [ ] `yarn install` — install all workspace dependencies
- [ ] Copy `.env.example` → `.env`, fill in DB credentials
- [ ] `docker-compose up -d` — start SQL Server + Redis
- [ ] Boot all services: `yarn dev:backend`
- [ ] Test auth flow: register → login → refresh → logout
- [ ] Test tenant CRUD
- [ ] Test vehicle CRUD (create, publish, search)
- [ ] Test lead creation (public inquiry form)

Frontend (`apps/web`):
- [ ] Install Tailwind CSS + shadcn/ui in web + dashboard
- [ ] Vehicle listing page (SSR, filters, pagination)
- [ ] Vehicle detail page (photos, specs, inquiry form)
- [ ] API client utility (fetch wrapper with tenant header + auth token)

Frontend (`apps/dashboard`):
- [ ] Login page (calls POST /auth/login)
- [ ] Inventory list + add vehicle form
- [ ] Leads list

**Deliverable: freshautosworld can sign up, add vehicles, customers can browse and submit enquiries**

---

### Phase 2 — CRM & Notifications
- [ ] Wire Resend (email) + Twilio (SMS) in notifications-service
- [ ] Email on new lead (to dealer), confirmation (to customer)
- [ ] SMS alerts to assigned sales agent
- [ ] Implement Cloudinary upload in media-service
- [ ] Dashboard: lead detail + status update UI
- [ ] Dashboard: test drive calendar
- [ ] Dashboard: order/deal management UI

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
- [ ] Redis caching for vehicle listing queries (hot path)
- [ ] Azure SQL deployment (production SQL Server)
- [ ] GitHub Actions CI/CD pipeline
- [ ] Sentry error tracking in all services
- [ ] Load testing (k6 or Artillery)
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

# 2. Start infrastructure
docker-compose up -d        # SQL Server on 1433, Redis on 6379

# 3. Copy env
cp .env.example .env        # then fill in DB_PASSWORD and JWT secrets

# 4. Install dependencies
yarn install

# 5. Start all backend services
yarn dev:backend

# 6. Start customer website (separate terminal)
yarn dev:web

# 7. Start dealer dashboard (separate terminal)
yarn dev:dashboard
```

### Service URLs (local)

| Service | URL |
|---------|-----|
| API Gateway | http://localhost:3000/api/v1 |
| Customer Website | http://localhost:3100 |
| Dealer Dashboard | http://localhost:3101 |
| Platform Admin | http://localhost:3102 |

### First API calls to verify

```bash
# Register a dealer tenant
POST http://localhost:3000/api/v1/tenants
{ "name": "Fresh Autos World", "slug": "freshautosworld", "country": "NG",
  "currency": "NGN", "locale": "en-NG", "email": "info@freshautosworld.com" }

# Register a user for that tenant
POST http://localhost:3000/api/v1/auth/register
X-Tenant-ID: <tenantId from above>
{ "email": "admin@freshautosworld.com", "password": "...",
  "firstName": "Fresh", "lastName": "Admin" }

# Login
POST http://localhost:3000/api/v1/auth/login
X-Tenant-ID: <tenantId>
{ "email": "admin@freshautosworld.com", "password": "..." }
```

---

## 11. Code Conventions

- **No comments unless the WHY is non-obvious** — names should explain the what
- **No `any` types in shared packages** — use types from `@autonova/types`
- **All TCP messages include `tenantId`** — enforce this at the gateway layer
- **Services return plain objects, not HTTP exceptions** — use `RpcException` for errors
- **Entity relations are by ID, not TypeORM joins** — services don't join across service boundaries
- **Pagination is always `{ data, total, page, limit, totalPages }`** — use `PaginatedResponse<T>`
- **Git commits follow conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`

---

## 12. Environment Variables Reference

See `.env.example` for the full list with descriptions. Key ones:

| Variable | Used by |
|----------|---------|
| `JWT_ACCESS_SECRET` | api-gateway (verify), auth-service (sign) |
| `JWT_REFRESH_SECRET` | auth-service only |
| `DB_*` | all services with TypeORM |
| `STRIPE_SECRET_KEY` | payments-service |
| `PAYSTACK_SECRET_KEY` | payments-service |
| `CLOUDINARY_*` | media-service |
| `RESEND_API_KEY` | notifications-service |
| `TWILIO_*` | notifications-service |

---

## 13. Adding a New Service (checklist)

1. Create `apps/<name>-service/` with: `package.json`, `tsconfig.json`,
   `tsconfig.build.json`, `nest-cli.json`
2. Add TCP port to `.env.example` and allocate the next available port
3. Add message patterns to `packages/types/src/message-patterns.ts`
4. Add `SERVICES.<NAME>` constant to `packages/types/src/message-patterns.ts`
5. Add entity types to appropriate file in `packages/types/src/`
6. Register the client in api-gateway's relevant module
7. Add proxy controller in api-gateway
8. Update `turbo.json` if the service has unique build requirements
9. Update this CLAUDE.md under Section 6 with the service's responsibilities
