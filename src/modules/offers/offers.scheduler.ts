import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OffersScheduler {
  private readonly logger = new Logger(OffersScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredOffers() {
    this.logger.log('Running expired offers check...');

    try {
      const now = new Date();

      // Find and update expired offers
      const result = await this.prisma.offer.updateMany({
        where: {
          expiryDate: {
            lt: now,
          },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      if (result.count > 0) {
        this.logger.log(`✅ Deactivated ${result.count} expired offer(s)`);
      } else {
        this.logger.debug('No expired offers found');
      }
    } catch (error) {
      this.logger.error('Failed to deactivate expired offers', error.stack);
    }
  }
}
