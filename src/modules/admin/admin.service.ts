import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SendNotificationDto } from '../notifications/dto/send-notification.dto';
import { TrustService } from '../shops/trust.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly trustService: TrustService,
  ) {}

  async getStats() {
    const now = new Date();

    const [
      totalUsers,
      totalShops,
      totalOffers,
      activeOffers,
      suspiciousOffers,
      reportedOffers,
      premiumShops,
      avgTrustScore,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.shop.count(),
      this.prisma.offer.count(),
      this.prisma.offer.count({
        where: {
          isActive: true,
          expiryDate: { gte: now },
        },
      }),
      this.prisma.offer.count({
        where: { isSuspicious: true },
      }),
      this.prisma.offer.count({
        where: { reportCount: { gte: 1 } },
      }),
      this.prisma.shop.count({
        where: {
          premiumUntil: { gte: now },
        },
      }),
      this.prisma.shop.aggregate({
        _avg: { trustScore: true },
      }),
    ]);

    return {
      totalUsers,
      totalShops,
      totalOffers,
      activeOffers,
      suspiciousOffers,
      reportedOffers,
      premiumShops,
      averageTrustScore: Math.round(avgTrustScore._avg.trustScore || 0),
    };
  }

  async getFlaggedOffers() {
    const offers = await this.prisma.offer.findMany({
      where: {
        OR: [
          { isSuspicious: true },
          { reportCount: { gte: 3 } },
          { shop: { trustScore: { lt: 40 } } },
        ],
      },
      select: {
        id: true,
        title: true,
        discountPercentage: true,
        reportCount: true,
        isSuspicious: true,
        expiryDate: true,
        createdAt: true,
        shop: {
          select: {
            id: true,
            name: true,
            trustScore: true,
          },
        },
      },
      orderBy: [
        { reportCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return offers;
  }

  async getLowTrustShops() {
    const shops = await this.prisma.shop.findMany({
      where: {
        trustScore: { lt: 40 },
      },
      select: {
        id: true,
        name: true,
        trustScore: true,
        createdAt: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: {
        trustScore: 'asc',
      },
    });

    return shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      trustScore: shop.trustScore,
      city: shop.city.name,
      area: shop.area.name,
      totalOffers: shop._count.offers,
      createdAt: shop.createdAt,
    }));
  }

  async blockShop(shopId: string, adminUserId?: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: { user: true },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Block the shop owner (set user isActive to false)
    const updatedUser = await this.prisma.user.update({
      where: { id: shop.userId },
      data: { isActive: false },
    });

    // Log the action
    await this.createAdminLog('BLOCK_SHOP', 'Shop', shopId);

    return {
      shop: {
        id: shop.id,
        name: shop.name,
      },
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        isActive: updatedUser.isActive,
      },
    };
  }

  async unblockShop(shopId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: { user: true },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Unblock the shop owner (set user isActive to true)
    const updatedUser = await this.prisma.user.update({
      where: { id: shop.userId },
      data: { isActive: true },
    });

    // Log the action
    await this.createAdminLog('UNBLOCK_SHOP', 'Shop', shopId);

    return {
      shop: {
        id: shop.id,
        name: shop.name,
      },
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        isActive: updatedUser.isActive,
      },
    };
  }

  async deleteOffer(offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        title: true,
        shopId: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Decrease trust score for shop
    await this.trustService.decreaseForAdminDelete(offer.shopId, offerId);

    // Delete the offer (hard delete)
    await this.prisma.offer.delete({
      where: { id: offerId },
    });

    // Log the action
    await this.createAdminLog('DELETE_OFFER', 'Offer', offerId);

    return {
      message: 'Offer deleted successfully',
      deletedOffer: offer,
    };
  }

  private async createAdminLog(action: string, entityType: string, entityId: string) {
    return this.prisma.adminLog.create({
      data: {
        action,
        entityType,
        entityId,
      },
    });
  }

  // TODO: Implement admin service methods
  async getDashboardStats() {
    const [usersCount, shopsCount, offersCount, reportsCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.shop.count(),
      this.prisma.offer.count(),
      this.prisma.report.count(),
    ]);

    return {
      users: usersCount,
      shops: shopsCount,
      offers: offersCount,
      reports: reportsCount,
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  async getPendingShops() {
    return this.prisma.shop.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
          },
        },
        city: true,
        area: true,
      },
    });
  }

  async verifyShop(shopId: string) {
    return this.prisma.shop.update({
      where: { id: shopId },
      data: { isVerified: true },
    });
  }

  async getPendingOffers() {
    return this.prisma.offer.findMany({
      where: { isActive: false },
      include: {
        shop: {
          include: {
            city: true,
            area: true,
          },
        },
      },
    });
  }

  async approveOffer(offerId: string) {
    return this.prisma.offer.update({
      where: { id: offerId },
      data: { isActive: true },
    });
  }

  async rejectOffer(offerId: string) {
    return this.prisma.offer.update({
      where: { id: offerId },
      data: { isActive: false },
    });
  }

  async getAllReports() {
    return this.prisma.report.findMany({
      include: {
        offer: {
          include: {
            shop: true,
          },
        },
        user: {
          select: {
            id: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async sendNotification(dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }
}
