import { Controller, Get, Put, Param, Body, UseGuards, Patch, Delete, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { SendNotificationDto } from '../notifications/dto/send-notification.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('flagged-offers')
  async getFlaggedOffers() {
    return this.adminService.getFlaggedOffers();
  }

  @Get('low-trust-shops')
  async getLowTrustShops() {
    return this.adminService.getLowTrustShops();
  }

  @Patch('shop/:id/block')
  async blockShop(@Param('id') id: string) {
    return this.adminService.blockShop(id);
  }

  @Patch('shop/:id/unblock')
  async unblockShop(@Param('id') id: string) {
    return this.adminService.unblockShop(id);
  }

  @Delete('offer/:id')
  async deleteOffer(@Param('id') id: string) {
    return this.adminService.deleteOffer(id);
  }

  @Post('notify')
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.adminService.sendNotification(dto);
  }

  @Get('dashboard')
  async getDashboardStats() {
    // TODO: Implement dashboard statistics
    return { message: 'Dashboard stats - to be implemented' };
  }

  @Get('users')
  async getAllUsers() {
    // TODO: Implement get all users
    return { message: 'Get all users - to be implemented' };
  }

  @Put('users/:id/status')
  async updateUserStatus(@Param('id') id: string, @Body() statusDto: any) {
    // TODO: Implement update user status
    return { message: `Update user ${id} status - to be implemented` };
  }

  @Get('shops/pending')
  async getPendingShops() {
    // TODO: Implement get pending shop verifications
    return { message: 'Get pending shops - to be implemented' };
  }

  @Put('shops/:id/verify')
  async verifyShop(@Param('id') id: string) {
    // TODO: Implement verify shop
    return { message: `Verify shop ${id} - to be implemented` };
  }

  @Get('offers/pending')
  async getPendingOffers() {
    // TODO: Implement get pending offers
    return { message: 'Get pending offers - to be implemented' };
  }

  @Put('offers/:id/approve')
  async approveOffer(@Param('id') id: string) {
    // TODO: Implement approve offer
    return { message: `Approve offer ${id} - to be implemented` };
  }

  @Put('offers/:id/reject')
  async rejectOffer(@Param('id') id: string, @Body() reasonDto: any) {
    // TODO: Implement reject offer
    return { message: `Reject offer ${id} - to be implemented` };
  }

  @Get('reports')
  async getAllReports() {
    // TODO: Implement get all reports
    return { message: 'Get all reports - to be implemented' };
  }
}
