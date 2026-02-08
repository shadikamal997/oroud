import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { CreateOfferDto } from './dto/create-offer.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async findAll(@Query('shopId') shopId?: string, @Query('isActive') isActive?: string) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.offersService.findAll(shopId, isActiveBool);
  }

  @Get('feed')
  async getOffersFeed(@Query() query: FeedQueryDto) {
    return this.offersService.getOffersFeed(query);
  }

  @Get('active/current')
  async getActiveOffers() {
    return this.offersService.getActiveOffers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  async create(@Body() createOfferDto: CreateOfferDto, @CurrentUser() user: any) {
    return this.offersService.create(user.id, createOfferDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user: any) {
    // TODO: Implement update offer with ownership validation
    return { message: `Update offer ${id} - to be implemented` };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    // TODO: Implement delete offer with ownership validation
    return this.offersService.remove(id);
  }

  @Post(':id/view')
  async trackView(@Param('id') id: string) {
    return this.offersService.trackView(id);
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  async trackSave(@Param('id') id: string, @Request() req) {
    return this.offersService.trackSave(id, req.user.userId);
  }

  @Post(':id/click')
  async trackClick(@Param('id') id: string) {
    return this.offersService.trackClick(id);
  }
}
