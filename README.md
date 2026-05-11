# AutoNova

Multi-tenant SaaS platform for car dealerships.

> For architecture, business rules, and coding conventions — read `CLAUDE.md` before touching any code.

---

## Prerequisites

- Node.js 22+
- Yarn 1.22+
- Docker Desktop

---

## Getting Started

```bash
# 1. Install dependencies
yarn install

# 2. Copy environment files (ask the team lead for values)
# apps/dashboard/.env.local
# apps/web/.env.local

# 3. Start infrastructure
docker-compose up -d

# 4. Wait ~30 seconds, then start services (3 separate terminals)
yarn dev:backend
yarn dev:dashboard
yarn dev:web
```

> Always start `docker-compose up -d` before `yarn dev:backend`. Infrastructure must be healthy first.

---

## Development URLs

| App | URL |
|-----|-----|
| API + Swagger | http://localhost:3000/api/v1/swagger |
| Dashboard | http://localhost:3101 |
| Storefront | http://localhost:3100 |
