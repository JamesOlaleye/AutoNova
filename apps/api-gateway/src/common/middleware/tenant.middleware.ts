import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction) {
    // Dev: accept X-Tenant-ID header directly
    // Prod: resolve tenantId from subdomain via tenants-service
    const tenantId = req.headers['x-tenant-id'] as string;

    if (tenantId) {
      req.tenantId = tenantId;
    } else {
      const host = req.headers.host || '';
      const subdomain = host.split('.')[0];
      if (subdomain && !['www', 'api', 'localhost'].includes(subdomain)) {
        // In production: call tenants-service to resolve slug → tenantId
        // For now we set subdomain as-is; real resolution added in Phase 2
        req.tenantId = subdomain;
      }
    }

    next();
  }
}
