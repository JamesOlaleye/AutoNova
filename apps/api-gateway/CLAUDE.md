# AutoNova API Gateway — App Bible

> This file covers `apps/api-gateway` specifically.
> Business rules, multi-tenancy, auth contracts, and service responsibilities live in root `CLAUDE.md`.
> This file covers: 3-layer architecture, existing modules, DTO conventions, guard usage,
> tenant resolution, Swagger rules, and the exact steps for adding a new endpoint.

---

## 1. What This App Is

`apps/api-gateway` is the **only public-facing HTTP service** in the AutoNova platform.
It runs on port **3000** in development. Swagger UI is at `http://localhost:3000/api/v1/swagger`.

Every other service (`auth-service`, `vehicles-service`, etc.) communicates over **TCP only**
and is invisible to the outside world. The gateway translates HTTP ↔ TCP.

**The gateway does NOT contain business logic.** It:
1. Resolves the tenant from the incoming request
2. Validates the JWT (locally — no network call)
3. Validates the request body/query with class-validator
4. Delegates to a TCP microservice via a GatewayService
5. Returns the result

---

## 2. The 3-Layer Architecture (Strict — No Exceptions)

```
HTTP Request
    ↓
Controller          ← HTTP concerns ONLY: routing, guards, decorators, delegation
    ↓                  Max 3 lines per method. No ClientProxy. No firstValueFrom.
GatewayService      ← TCP concerns: injects ClientProxy, calls this.send(), maps payload
    ↓                  Extends BaseGatewayService. One method per controller action.
BaseGatewayService  ← Cross-cutting: 10s timeout, RPC error → HttpException mapping
    ↓                  Never override this. All gateway services inherit it.
TCP (microservice)
```

### BaseGatewayService (do not modify)

Located at `src/common/services/base-gateway.service.ts`.
Wraps every TCP call with a 10-second timeout and maps errors to `HttpException`.

```typescript
// Every gateway service extends this
export abstract class BaseGatewayService {
  protected async send<T>(
    client: ClientProxy,
    pattern: string,
    payload: unknown,
  ): Promise<T> { ... }
}
```

### Controller pattern (copy this exactly)

```typescript
@ApiTags('widgets')
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('widgets')
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsGatewayService) {}

  // Public route — no guards
  @Get()
  @ApiOperation({ summary: 'List all widgets — public' })
  @ApiResponse({ status: 200, description: 'Paginated widget list' })
  findAll(@Query() query: WidgetQueryDto, @TenantId() tenantId: string) {
    return this.widgetsService.findAll(query, tenantId);           // 1 line
  }

  // Protected route
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a widget' })
  @ApiResponse({ status: 201, description: 'Widget created' })
  create(@Body() body: CreateWidgetDto, @TenantId() tenantId: string) {
    return this.widgetsService.create(body, tenantId);             // 1 line
  }
}
```

**Rules:**
- Every method body is ONE line — the delegation call
- `@TenantId()` instead of `@Req() req: any`
- `@CurrentUser()` instead of reading JWT payload manually
- Every endpoint has `@ApiOperation` + `@ApiResponse`
- Never put `ClientProxy`, `firstValueFrom`, or `send()` in a controller
- `@Get` and `@Get(':id')` are public by default (no guards)
- `@Post`, `@Patch`, `@Delete` require `@UseGuards(JwtAuthGuard, RolesGuard)` unless explicitly public

### GatewayService pattern (copy this exactly)

```typescript
@Injectable()
export class WidgetsGatewayService extends BaseGatewayService {
  constructor(@Inject(SERVICES.WIDGETS) private readonly client: ClientProxy) {
    super();
  }

  findAll(query: WidgetQueryDto, tenantId: string) {
    return this.send(this.client, WIDGET_PATTERNS.FIND_ALL, { ...query, tenantId });
  }

  findOne(id: string, tenantId: string) {
    return this.send(this.client, WIDGET_PATTERNS.FIND_BY_ID, { id, tenantId });
  }

  create(dto: CreateWidgetDto, tenantId: string) {
    return this.send(this.client, WIDGET_PATTERNS.CREATE, { ...dto, tenantId });
  }

  update(id: string, dto: UpdateWidgetDto, tenantId: string) {
    return this.send(this.client, WIDGET_PATTERNS.UPDATE, { ...dto, id, tenantId });
  }

  remove(id: string, tenantId: string) {
    return this.send(this.client, WIDGET_PATTERNS.DELETE, { id, tenantId });
  }
}
```

**Rules:**
- Always spread the DTO with `{ ...dto, tenantId }` — never forget `tenantId` in the payload
- For update, always include `{ ...dto, id, tenantId }` — the microservice needs the id
- Use message patterns from `@autonova/types` — never hardcode strings
- `SERVICES.*` constants from `@autonova/types` for the inject token

---

## 3. Current Module Inventory

| Module | Controller prefix | TCP service | Port | Auth |
|--------|-------------------|-------------|------|------|
| `auth` | `/auth` | auth-service | 3001 | Public (POST /register, /login, /refresh); JWT required (POST /logout) |
| `tenants` | `/tenants` | tenants-service | 3002 | POST /tenants is public (onboarding); GET/PATCH/DELETE require DEALER_ADMIN |
| `users` | `/users` | users-service | 3003 | All routes require JWT |
| `vehicles` | `/vehicles` | vehicles-service | 3004 | GET is public; POST/PATCH/DELETE require DEALER_ADMIN or SALES_AGENT |
| `leads` | `/leads` | leads-service | 3005 | POST is public; GET/PATCH require JWT |
| `orders` | `/orders` | orders-service | 3006 | All routes require JWT |
| `payments` | `/payments` | payments-service | 3010 | Webhook routes use raw body; subscription routes require JWT |

All routes are prefixed with `/api/v1` (set in `main.ts`).

---

## 4. Directory Structure

```
apps/api-gateway/src/
├── main.ts                              ← Bootstraps app; sets up Swagger, global pipe, global filter
├── app.module.ts                        ← Imports all feature modules + TenantMiddleware
├── common/
│   ├── decorators/
│   │   ├── tenant-id.decorator.ts       ← @TenantId() — reads req.tenantId (set by middleware)
│   │   ├── current-user.decorator.ts    ← @CurrentUser() — reads req.user (set by JWT strategy)
│   │   └── roles.decorator.ts           ← @Roles('DEALER_ADMIN', ...) metadata setter
│   ├── dto/
│   │   └── pagination.dto.ts            ← page?: number, limit?: number — all list queries extend this
│   ├── filters/
│   │   └── rpc-exception.filter.ts      ← @Catch(RpcException) → HTTP JSON {statusCode, message}
│   ├── guards/
│   │   ├── jwt-auth.guard.ts            ← Validates JWT; attaches user to req.user
│   │   └── roles.guard.ts               ← Checks req.user.role against @Roles() metadata
│   ├── middleware/
│   │   └── tenant.middleware.ts         ← Reads X-Tenant-ID header or subdomain → req.tenantId
│   └── services/
│       └── base-gateway.service.ts      ← Abstract; provides protected send<T>() with timeout+error handling
│
├── auth/
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   └── refresh-token.dto.ts
│   ├── auth.controller.ts
│   ├── auth.gateway.service.ts
│   └── auth.module.ts
│
├── tenants/
│   ├── dto/
│   │   ├── create-tenant.dto.ts
│   │   └── update-tenant.dto.ts
│   ├── tenants.controller.ts
│   ├── tenants.gateway.service.ts
│   └── tenants.module.ts
│
├── users/ vehicles/ leads/ orders/ payments/
│   └── (same 3-file + dto/ pattern as above)
```

---

## 5. DTO Rules

### Request body DTOs (`CreateXxxDto`, `UpdateXxxDto`)

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWidgetDto {
  // Required field — use @ApiProperty (NOT @ApiPropertyOptional)
  @ApiProperty({ description: 'Human-readable name for the widget' })
  @IsString()
  name: string;

  // Optional field — use @ApiPropertyOptional
  @ApiPropertyOptional({ description: 'Optional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  // Enum field
  @ApiProperty({ enum: ['TYPE_A', 'TYPE_B'], description: 'Widget type' })
  @IsEnum(['TYPE_A', 'TYPE_B'])
  type: string;
}
```

**DTO rules:**
- **Never add `example` values** to `@ApiProperty` — they pre-fill Swagger's "Try it out" form, making it confusing
- Every `@IsOptional()` field must also be typed as `?: string` (not `: string`)
- `@Type(() => Number)` is needed for numeric query params (class-transformer coercion)
- Use `@IsUUID()` for ID fields
- Do not add `tenantId` to DTOs — it comes from the `@TenantId()` decorator

### Query DTOs (list/search endpoints)

All list query DTOs **must extend `PaginationDto`**:

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export class WidgetQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;
}
```

`PaginationDto` provides `page?: number = 1` and `limit?: number = 20` with `@Type(() => Number)` coercion.

### Update DTOs

`UpdateXxxDto` — ALL fields optional. Uses `@Patch` (never `@Put` for partial updates):

```typescript
export class UpdateWidgetDto {
  @ApiPropertyOptional({ description: 'New name' })
  @IsOptional()
  @IsString()
  name?: string;
}
```

---

## 6. Guards and Roles

### Available guards

| Guard | Import from | Purpose |
|-------|-------------|---------|
| `JwtAuthGuard` | `../common/guards/jwt-auth.guard` | Validates JWT, attaches `req.user` |
| `RolesGuard` | `../common/guards/roles.guard` | Checks `req.user.role` against `@Roles(...)` |

**Always use both together** — `RolesGuard` alone won't work without `JwtAuthGuard` first:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DEALER_ADMIN', 'SALES_AGENT')
```

### Role reference

| Role | Who |
|------|-----|
| `PLATFORM_ADMIN` | James — bypass tenant isolation |
| `DEALER_ADMIN` | Dealership owner — full tenant access |
| `SALES_AGENT` | Can manage inventory and leads |
| `FINANCE_MANAGER` | Can manage orders and financing |
| `CUSTOMER` | Registered buyer — read own data only |

### Public routes (no guards)

Routes that are explicitly public (no auth required):
- `GET /vehicles` and `GET /vehicles/:id` — browsing is public
- `POST /leads` — customer enquiry submission
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- `POST /payments/webhooks/stripe`, `POST /payments/webhooks/paystack`

Everything else requires at minimum `@UseGuards(JwtAuthGuard)`.

---

## 7. Tenant Resolution

The `TenantMiddleware` runs on every request before controllers.

**Development**: send `X-Tenant-ID: <uuid>` header — middleware sets `req.tenantId`.
**Production**: middleware reads the subdomain from `Host` header.
  - `freshautosworld.autonova.io` → slug `freshautosworld`
  - TODO (Phase 2): call tenants-service to resolve slug → tenantId

The `@TenantId()` decorator reads `req.tenantId` set by the middleware.

**Routes that don't need tenantId**: `POST /tenants` (creating a tenant) and `POST /auth/register` handle tenantId differently — they either create a tenant or receive it in the body.

---

## 8. Swagger Configuration

Swagger is configured in `main.ts` at `http://localhost:3000/api/v1/swagger`.

Every module's controller uses:
```typescript
@ApiTags('module-name')          // Groups endpoints in Swagger UI
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
```

Protected endpoints add:
```typescript
@ApiBearerAuth('JWT')            // Shows the lock icon in Swagger UI
```

The Swagger authorize button uses `Bearer <token>` format.

**Swagger auto-opens** in the browser when `yarn dev:backend` starts (configured in `main.ts`).

---

## 9. Error Handling

The global `RpcExceptionFilter` is registered in `main.ts`.
It catches any `RpcException` and returns a structured HTTP response:

```json
{
  "statusCode": 404,
  "message": "Vehicle not found",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

The `BaseGatewayService.send()` handles:
- `TimeoutError` → 503 Service Unavailable
- `RpcException` with `{ statusCode, message }` → maps to the correct HTTP status
- Anything else → 500 Internal Server Error

**Microservices must throw**: `throw new RpcException({ message: 'Not found', statusCode: 404 })`
The gateway will translate that to a proper HTTP 404.

---

## 10. Adding a New Endpoint (Step-by-Step)

Assume you're adding support for a new `widgets` microservice.

### Step 1 — Message patterns (`packages/types`)

```typescript
// packages/types/src/message-patterns.ts
export const SERVICES = {
  // ... existing
  WIDGETS: 'WIDGETS_SERVICE',
};

export const WIDGET_PATTERNS = {
  FIND_ALL: 'widget.findAll',
  FIND_BY_ID: 'widget.findById',
  CREATE: 'widget.create',
  UPDATE: 'widget.update',
  DELETE: 'widget.delete',
};
```

### Step 2 — DTOs

Create `src/widgets/dto/create-widget.dto.ts`, `update-widget.dto.ts`, `widget-query.dto.ts`.
Follow the DTO rules in Section 5. Extend `PaginationDto` for the query DTO.

### Step 3 — GatewayService

```typescript
// src/widgets/widgets.gateway.service.ts
@Injectable()
export class WidgetsGatewayService extends BaseGatewayService {
  constructor(@Inject(SERVICES.WIDGETS) private readonly client: ClientProxy) {
    super();
  }
  // ... methods from Section 2 pattern
}
```

### Step 4 — Controller

Follow the controller pattern from Section 2 exactly.
Use `@TenantId()` — never `@Req()`.
Add `@ApiOperation` and `@ApiResponse` to every method.

### Step 5 — Module

```typescript
// src/widgets/widgets.module.ts
@Module({
  imports: [
    ClientsModule.register([{
      name: SERVICES.WIDGETS,
      transport: Transport.TCP,
      options: {
        host: process.env.WIDGETS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.WIDGETS_SERVICE_PORT || '3011'),
      },
    }]),
  ],
  controllers: [WidgetsController],
  providers: [WidgetsGatewayService],
})
export class WidgetsModule {}
```

### Step 6 — Register in AppModule

```typescript
// src/app.module.ts
import { WidgetsModule } from './widgets/widgets.module';

@Module({
  imports: [
    // ... existing modules
    WidgetsModule,
  ],
})
export class AppModule { ... }
```

### Step 7 — Environment variables

Add to `.env.development`, `.env.staging`, `.env.production`:
```
WIDGETS_SERVICE_HOST=localhost
WIDGETS_SERVICE_PORT=3011
```

---

## 11. Common Mistakes (Do Not Repeat)

| Mistake | Why it's wrong | Correct approach |
|---------|---------------|-----------------|
| `@Body() body: any` | No validation, no Swagger docs | Use a typed DTO class |
| `@Req() req: any` for tenant | Bypasses the decorator abstraction | Use `@TenantId()` |
| Business logic in controller | Violates 3-layer rule | Move to GatewayService |
| `firstValueFrom(client.send(...))` in controller | Bypasses timeout/error handling | Use `this.send()` in GatewayService |
| Forgetting `tenantId` in TCP payload | Microservice can't filter by tenant — data leak | Always `{ ...dto, tenantId }` |
| Forgetting `id` in update payload | Microservice doesn't know what to update | `{ ...dto, id, tenantId }` |
| `@Put` for partial update | `@Put` means full replacement — use `@Patch` if any field is optional | Use `@Patch` |
| Adding `example:` to `@ApiProperty` | Pre-fills Swagger form, confusing in testing | Use `description:` only |
| Hardcoding TCP port numbers | Different per environment | Always use `process.env.*` with fallback |
