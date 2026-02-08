import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { GetAdsQueryDto } from './dto/get-ads-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // Public endpoint - Get active ads
  @Get()
  async getActiveAds(@Query() query: GetAdsQueryDto) {
    return this.adsService.getActiveAds(query);
  }

  // Admin endpoints
  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createAd(@Body() dto: CreateAdDto) {
    const ad = await this.adsService.createAd(dto);
    return {
      message: 'Ad created successfully',
      ad,
    };
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllAds() {
    return this.adsService.getAllAds();
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateAd(@Param('id') id: string, @Body() dto: UpdateAdDto) {
    const ad = await this.adsService.updateAd(id, dto);
    return {
      message: 'Ad updated successfully',
      ad,
    };
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteAd(@Param('id') id: string) {
    return this.adsService.deleteAd(id);
  }
}
