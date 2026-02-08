import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpgradePremiumDto } from './dto/upgrade-premium.dto';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: Implement shop service methods
  async findAll(cityId?: string) {
    const shops = await this.prisma.shop.findMany({
      where: cityId ? { cityId } : {},
      include: {
        city: true,
        area: true,
      },
    });

    // Transform response to include isPremium and exclude premiumUntil
    return shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      logoUrl: shop.logoUrl,
      latitude: shop.latitude,
      longitude: shop.longitude,
      trustScore: shop.trustScore,
      isPremium: this.isShopPremium(shop),
      isVerified: shop.isVerified,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
      city: shop.city,
      area: shop.area,
    }));
  }

  async findOne(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        city: true,
        area: true,
        offers: {
          where: {
            isActive: true,
            expiryDate: { gte: new Date() },
          },
        },
      },
    });

    if (!shop) {
      return null;
    }

    // Transform response to include isPremium and exclude premiumUntil
    return {
      id: shop.id,
      name: shop.name,
      logoUrl: shop.logoUrl,
      latitude: shop.latitude,
      longitude: shop.longitude,
      trustScore: shop.trustScore,
      isPremium: this.isShopPremium(shop),
      isVerified: shop.isVerified,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
      city: shop.city,
      area: shop.area,
      offers: shop.offers,
    };
  }

  async create(data: any) {
    const shop = await this.prisma.shop.create({
      data,
      include: {
        city: true,
        area: true,
      },
    });

    // Transform response to include isPremium and exclude premiumUntil
    return {
      id: shop.id,
      name: shop.name,
      logoUrl: shop.logoUrl,
      latitude: shop.latitude,
      longitude: shop.longitude,
      trustScore: shop.trustScore,
      isPremium: this.isShopPremium(shop),
      isVerified: shop.isVerified,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
      city: shop.city,
      area: shop.area,
    };
  }

  async update(id: string, data: any) {
    return this.prisma.shop.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.shop.delete({
      where: { id },
    });
  }

  async getShopOffers(shopId: string) {
    return this.prisma.offer.findMany({
      where: { shopId },
    });
  }

  async upgradePremium(dto: UpgradePremiumDto) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: dto.shopId },
      include: {
        user: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Check if shop owner is active
    if (!shop.user.isActive) {
      throw new ForbiddenException('Cannot upgrade premium for inactive account');
    }

    // Calculate new premium expiry date
    const now = new Date();
    const currentPremiumUntil = shop.premiumUntil && shop.premiumUntil > now 
      ? shop.premiumUntil 
      : now;

    const newPremiumUntil = new Date(currentPremiumUntil);
    newPremiumUntil.setMonth(newPremiumUntil.getMonth() + dto.months);

    // Update shop with new premium expiry
    return this.prisma.shop.update({
      where: { id: dto.shopId },
      data: {
        premiumUntil: newPremiumUntil,
      },
      include: {
        city: true,
        area: true,
      },
    });
  }

  // Helper method to check if shop is premium
  isShopPremium(shop: { premiumUntil: Date | null }): boolean {
    if (!shop.premiumUntil) return false;
    return shop.premiumUntil > new Date();
  }

  async getMyAnalytics(userId: string) {
    // Verify user is active
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });

    if (!user || !user.isActive) {
      throw new ForbiddenException('Cannot access analytics for inactive account');
    }

    // Get all shops associated with user
    const shops = await this.prisma.shop.findMany({
      where: { userId },
      include: {
        offers: {
          include: {
            analytics: true,
          },
        },
      },
    });

    if (shops.length === 0) {
      throw new NotFoundException('No shop found for this user');
    }

    // Calculate totals across all shops
    let totalViews = 0;
    let totalSaves = 0;
    let totalClicks = 0;
    const allOffers = [];

    shops.forEach(shop => {
      shop.offers.forEach(offer => {
        if (offer.analytics) {
          totalViews += offer.analytics.views;
          totalSaves += offer.analytics.saves;
          totalClicks += offer.analytics.clicks;
        }
        allOffers.push({
          offerId: offer.id,
          offerTitle: offer.title,
          shopName: shop.name,
          views: offer.analytics?.views || 0,
          saves: offer.analytics?.saves || 0,
          clicks: offer.analytics?.clicks || 0,
          isActive: offer.isActive,
          expiryDate: offer.expiryDate,
        });
      });
    });

    return {
      shops: shops.map(s => ({ id: s.id, name: s.name })),
      summary: {
        totalViews,
        totalSaves,
        totalClicks,
      },
      offers: allOffers,
    };
  }
}
