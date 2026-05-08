# AutoNova API Test Log

> Tracks every endpoint tested, the exact flow, dependencies, and results.
> Update this file every time a new endpoint is verified.
> Swagger UI: `http://localhost:3000/api/v1/swagger`

---

## How to Read This Document

- **Depends on** — which earlier step must be completed first and what value to carry forward
- **X-Tenant-ID** — required on every request except `POST /tenants`
- **Bearer** — paste `accessToken` into Swagger Authorize (without the word "Bearer")
- **Status** — ✅ Passed | ❌ Failed | ⏳ Not yet tested

---

## Phase 1 — Core Platform Backend

### Reference Data (from live test run on 2026-05-08)

| Variable | Value |
|----------|-------|
| `tenantId` | `9629433E-F36B-1410-8DBD-0009F4C1E3C0` |
| `userId` | `9B29433E-F36B-1410-8DBD-0009F4C1E3C0` |
| `vehicleId` | `AB29433E-F36B-1410-8DBD-0009F4C1E3C0` |
| `leadId` | `AD29433E-F36B-1410-8DBD-0009F4C1E3C0` |

---

### Step 1 — Create Tenant ✅

**`POST /api/v1/tenants`**

| Field | Value |
|-------|-------|
| Auth | None — public endpoint |
| X-Tenant-ID | Not required |
| Depends on | Nothing — this is always first |

**Request body:**
```json
{
  "name": "Fresh Autos World",
  "slug": "freshautosworld",
  "country": "NG",
  "currency": "NGN",
  "locale": "en-NG",
  "email": "info@freshautosworld.com"
}
```

**Response (201):**
```json
{
  "id": "9629433E-F36B-1410-8DBD-0009F4C1E3C0",
  "slug": "freshautosworld",
  "name": "Fresh Autos World",
  "country": "NG",
  "currency": "NGN",
  "locale": "en-NG",
  "plan": "STARTER",
  "email": "info@freshautosworld.com",
  "isActive": true,
  "createdAt": "2026-05-08T14:06:50.806Z"
}
```

**What to carry forward:** `id` → use as `X-Tenant-ID` in all subsequent requests.

---

### Step 2 — Register Admin User ✅

**`POST /api/v1/auth/register`**

| Field | Value |
|-------|-------|
| Auth | None — public endpoint |
| X-Tenant-ID | ✅ Required (from Step 1) |
| Depends on | Step 1 → `tenantId` |

**Request body:**
```json
{
  "email": "admin@freshautosworld.com",
  "password": "Admin1234!",
  "firstName": "Fresh",
  "lastName": "Admin",
  "role": "DEALER_ADMIN"
}
```

**Response (201):**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<token>",
  "user": {
    "id": "9B29433E-F36B-1410-8DBD-0009F4C1E3C0",
    "email": "admin@freshautosworld.com",
    "firstName": "Fresh",
    "lastName": "Admin",
    "role": "DEALER_ADMIN"
  }
}
```

**What to carry forward:** `refreshToken` (single-use — rotated on next login).

**Business rule verified:** User is scoped to the tenant via `X-Tenant-ID`. Same email can exist across different tenants.

---

### Step 3 — Login ✅

**`POST /api/v1/auth/login`**

| Field | Value |
|-------|-------|
| Auth | None — public endpoint |
| X-Tenant-ID | ✅ Required |
| Depends on | Step 1 → `tenantId`, Step 2 → registered credentials |

**Request body:**
```json
{
  "email": "admin@freshautosworld.com",
  "password": "Admin1234!"
}
```

**Response (200):**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<new-token>",
  "user": { ... }
}
```

**What to carry forward:** `accessToken` → paste into Swagger Authorize. `refreshToken` → needed for Step 7.

**Business rule verified:** Login rotates the refresh token — the token from Step 2 is now revoked.

---

### Step 4 — Create Vehicle ✅

**`POST /api/v1/vehicles`**

| Field | Value |
|-------|-------|
| Auth | Bearer `accessToken` required (DEALER_ADMIN, SALES_AGENT, PLATFORM_ADMIN) |
| X-Tenant-ID | ✅ Required |
| Depends on | Step 1 → `tenantId`, Step 3 → `accessToken` |

**Request body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "price": 15000000,
  "currency": "NGN",
  "mileage": 45000,
  "mileageUnit": "KM",
  "condition": "USED",
  "transmission": "AUTOMATIC",
  "fuelType": "PETROL",
  "driveType": "RHD",
  "color": "White"
}
```

**Response (201):**
```json
{
  "id": "AB29433E-F36B-1410-8DBD-0009F4C1E3C0",
  "tenantId": "9629433E-F36B-1410-8DBD-0009F4C1E3C0",
  "make": "Toyota",
  "model": "Camry",
  "status": "AVAILABLE",
  ...
}
```

**What to carry forward:** `id` → `vehicleId` for lead creation.

**Business rule verified:** `status` defaults to `AVAILABLE`. `tenantId` automatically injected from header — never sent in body.

---

### Step 5 — List Vehicles ✅

**`GET /api/v1/vehicles`**

| Field | Value |
|-------|-------|
| Auth | None — public endpoint |
| X-Tenant-ID | ✅ Required |
| Depends on | Step 1 → `tenantId` |

**Query params:** None required (defaults: `page=1`, `limit=20`)

**Response (200):**
```json
{
  "data": [ { ...vehicle } ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

**Business rule verified:** Public — no auth required. Tenant-isolated — only returns vehicles for the given `X-Tenant-ID`. Paginated response matches `PaginatedResponse<T>` contract.

---

### Step 6 — Submit Lead (Public Enquiry) ✅

**`POST /api/v1/leads`**

| Field | Value |
|-------|-------|
| Auth | None — public endpoint |
| X-Tenant-ID | ✅ Required |
| Depends on | Step 1 → `tenantId`, Step 4 → `vehicleId` (optional) |

**Request body:**
```json
{
  "name": "John Buyer",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "type": "INQUIRY",
  "message": "Interested in the Toyota Camry",
  "vehicleId": "AB29433E-F36B-1410-8DBD-0009F4C1E3C0"
}
```

**Response (201):**
```json
{
  "id": "AD29433E-F36B-1410-8DBD-0009F4C1E3C0",
  "tenantId": "9629433E-F36B-1410-8DBD-0009F4C1E3C0",
  "status": "NEW",
  "type": "INQUIRY",
  ...
}
```

**Business rule verified:** No authentication required — customers submit enquiries without an account. `status` defaults to `NEW` (entry point of CRM pipeline).

---

### Step 7 — Refresh Token ✅

**`POST /api/v1/auth/refresh`**

| Field | Value |
|-------|-------|
| Auth | None |
| X-Tenant-ID | ✅ Required |
| Depends on | Step 3 → `refreshToken` from login (NOT from register — that was rotated) |

**Request body:**
```json
{
  "refreshToken": "<refreshToken from Step 3 login>"
}
```

**Response (200):**
```json
{
  "accessToken": "<new-jwt>",
  "refreshToken": "<new-token>"
}
```

**Business rule verified:** Single-use rotation — old refresh token is revoked, new pair issued. Using the register token (Step 2) returns `401 Invalid or expired refresh token` — correct behaviour.

---

### Step 8 — Logout ✅

**`POST /api/v1/auth/logout`**

| Field | Value |
|-------|-------|
| Auth | Bearer `accessToken` required |
| X-Tenant-ID | ✅ Required |
| Depends on | Step 7 → updated `accessToken` |

**Request body:** None

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Business rule verified:** All refresh tokens for this user+tenant are revoked. Subsequent refresh attempts return `401`.

---

## Endpoints Tested Summary

| # | Method | Endpoint | Auth | Status |
|---|--------|----------|------|--------|
| 1 | POST | `/api/v1/tenants` | Public | ✅ |
| 2 | POST | `/api/v1/auth/register` | Public | ✅ |
| 3 | POST | `/api/v1/auth/login` | Public | ✅ |
| 4 | POST | `/api/v1/vehicles` | Bearer | ✅ |
| 5 | GET | `/api/v1/vehicles` | Public | ✅ |
| 6 | POST | `/api/v1/leads` | Public | ✅ |
| 7 | POST | `/api/v1/auth/refresh` | Public | ✅ |
| 8 | POST | `/api/v1/auth/logout` | Bearer | ✅ |

---

## Endpoints Not Yet Tested (Phase 1)

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/v1/vehicles/:id` | Get single vehicle |
| GET | `/api/v1/vehicles/search` | Filtered search |
| PATCH | `/api/v1/vehicles/:id` | Update vehicle (e.g. change status) |
| DELETE | `/api/v1/vehicles/:id` | Remove vehicle |
| GET | `/api/v1/leads` | List leads (dealer CRM) |
| GET | `/api/v1/leads/:id` | Get single lead |
| PATCH | `/api/v1/leads/:id` | Update lead status |
| GET | `/api/v1/users/me` | Get current user |
| GET | `/api/v1/tenants/:id` | Get tenant |
| PATCH | `/api/v1/tenants/:id` | Update tenant |

---

## Phase 2 — Not Yet Tested

Pending Phase 2 implementation: notifications, media upload, CRM pipeline UI.

## Phase 3 — Not Yet Tested

Pending Phase 3 implementation: payments, subscriptions.
