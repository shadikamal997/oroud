import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UpgradePremiumDto } from './dto/upgrade-premium.dto';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  async findAll(@Query('cityId') cityId?: string) {
    // TODO: Implement find all shops with optional city filter - public
    return { message: 'Get all shops - to be implemented' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // TODO: Implement find one shop - public
    return { message: `Get shop ${id} - to be implemented` };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP, UserRole.ADMIN)
  async create(@Body() createDto: any, @CurrentUser() user: any) {
    // TODO: Implement create shop - only SHOP or ADMIN
    return { message: 'Create shop - to be implemented', userId: user.userId };
  }

  @Post('upgrade-premium')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async upgradePremium(@Body() dto: UpgradePremiumDto) {
    return this.shopsService.upgradePremium(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: any) {
    // TODO: Implement update shop
    return { message: `Update shop ${id} - to be implemented` };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    // TODO: Implement delete shop
    return { message: `Delete shop ${id} - to be implemented` };
  }

  @Get(':id/offers')
  async getShopOffers(@Param('id') id: string) {
    // TODO: Implement get shop offers - public
    return { message: `Get offers for shop ${id} - to be implemented` };
  }

  @Get('me/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  async getMyAnalytics(@Request() req) {
    return this.shopsService.getMyAnalytics(req.user.userId);
  }
}
