import { Controller, Get, Param, Query } from '@nestjs/common';
import { AreasService } from './areas.service';

@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  /**
   * GET /areas
   * Query params:
   *   - cityId: optional filter by city
   * Returns all areas, optionally filtered by city
   */
  @Get()
  async findAll(@Query('cityId') cityId?: string) {
    return this.areasService.findAll(cityId);
  }

  /**
   * GET /areas/grouped
   * Returns areas grouped by city (useful for dropdowns)
   */
  @Get('grouped')
  async findGroupedByCity() {
    return this.areasService.findGroupedByCity();
  }

  /**
   * GET /areas/:id
   * Returns a single area with details
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.areasService.findOne(id);
  }
}
