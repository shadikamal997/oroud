import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CrazyDealsService {
  private readonly logger = new Logger(CrazyDealsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Select and save today's crazy deals
   * This method should be called daily at 7PM Jordan time
   */
  async selectDailyDeals(): Promise<{ selected: number; offers: any[] }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day for uniqueness check

    // Check if deals already selected for today
    const existingDeals = await this.prisma.crazyDeal.count({
      where: {
        date: today,
      },
    });

    if (existingDeals > 0) {
      this.logger.log('Crazy deals already selected for today. Skipping.');
      return { selected: 0, offers: [] };
    }

    // Delete old deals (older than 1 day)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const deletedCount = await this.prisma.crazyDeal.deleteMany({
      where: {
        date: { lt: yesterday },
      },
    });

    if (deletedCount.count > 0) {
      this.logger.log(`Deleted ${deletedCount.count} old crazy deals`);
    }

    // Calculate date range for expiry (within next 3 days)
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    // Select top 5 offers based on criteria
    const selectedOffers = await this.prisma.offer.findMany({
      where: {
        isActive: true,
        discountPercentage: { gte: 30 },
        isSuspicious: false,
        reportCount: { lt: 2 },
        expiryDate: {
          gte: now,
          lte: threeDaysLater,
        },
        shop: {
          trustScore: { gte: 50 },
        },
      },
      orderBy: [
        { discountPercentage: 'desc' },
        { shop: { trustScore: 'desc' } },
        { expiryDate: 'asc' },
      ],
      take: 5,
      include: {
        shop: {
          include: {
            city: true,
            area: true,
          },
        },
      },
    });

    if (selectedOffers.length === 0) {
      this.logger.warn('No offers found matching crazy deals criteria');
      return { selected: 0, offers: [] };
    }

    // Insert selected offers into CrazyDeal table
    const crazyDealsData = selectedOffers.map((offer) => ({
      offerId: offer.id,
      date: today,
    }));

    await this.prisma.crazyDeal.createMany({
      data: crazyDealsData,
    });

    // Log selection in AdminLog
    await this.prisma.adminLog.create({
      data: {
        action: 'crazy_deals_selected',
        entityType: 'crazy_deal',
        entityId: 'bulk',
      },
    });

    this.logger.log(
      `Selected ${selectedOffers.length} crazy deals for ${today.toDateString()}`,
    );

    return { selected: selectedOffers.length, offers: selectedOffers };
  }

  /**
   * Get today's crazy deals
   */
  async getTodaysCrazyDeals() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const crazyDeals = await this.prisma.crazyDeal.findMany({
      where: {
        date: today,
      },
      include: {
        offer: {
          include: {
            shop: {
              include: {
                city: true,
                area: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const now = new Date();

    // Transform response to exclude sensitive fields and add isPremium
    return crazyDeals.map((deal) => {
      const { premiumUntil, userId, ...shopWithoutSensitive } = deal.offer.shop;
      return {
        id: deal.id,
        offerId: deal.offerId,
        date: deal.date,
        createdAt: deal.createdAt,
        offer: {
          ...deal.offer,
          shop: {
            ...shopWithoutSensitive,
            isPremium: premiumUntil ? premiumUntil > now : false,
          },
        },
      };
    });
  }
}
