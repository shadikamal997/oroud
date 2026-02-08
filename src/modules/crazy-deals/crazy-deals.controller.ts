import { Controller, Get } from '@nestjs/common';
import { CrazyDealsService } from './crazy-deals.service';

@Controller('offers/crazy-deals')
export class CrazyDealsController {
  constructor(private readonly crazyDealsService: CrazyDealsService) {}

  /**
   * Get today's crazy deals
   * GET /offers/crazy-deals
   * Public endpoint - no authentication required
   */
  @Get()
  async getCrazyDeals() {
    const deals = await this.crazyDealsService.getTodaysCrazyDeals();

    return {
      success: true,
      count: deals.length,
      deals,
    };
  }
}
