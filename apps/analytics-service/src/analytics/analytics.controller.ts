import { Controller } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

// Analytics patterns and handlers added in Phase 4
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
}
