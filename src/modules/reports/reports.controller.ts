import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async findAll() {
    // TODO: Implement find all reports
    return { message: 'Get all reports - to be implemented' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // TODO: Implement find one report
    return { message: `Get report ${id} - to be implemented` };
  }

  @Post()
  async create(@Body() createDto: any) {
    // TODO: Implement create report
    return { message: 'Create report - to be implemented' };
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() statusDto: any) {
    // TODO: Implement update report status
    return { message: `Update report ${id} status - to be implemented` };
  }

  @Get('shop/:shopId')
  async getShopReports(@Param('shopId') shopId: string) {
    // TODO: Implement get shop reports
    return { message: `Get reports for shop ${shopId} - to be implemented` };
  }
}
