import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CrazyDealsService } from './crazy-deals.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CrazyDealsScheduler {
  private readonly logger = new Logger(CrazyDealsScheduler.name);

  constructor(
    private readonly crazyDealsService: CrazyDealsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Daily Crazy Deals Selection
   * Runs at 7 PM Jordan time (Asia/Amman timezone)
   */
  @Cron('0 19 * * *', {
    timeZone: 'Asia/Amman',
  })
  async handleDailyCrazyDeals() {
    this.logger.log('Starting daily crazy deals selection at 7 PM Jordan time');

    try {
      // Select today's crazy deals
      const result = await this.crazyDealsService.selectDailyDeals();

      if (result.selected === 0) {
        this.logger.log('No new crazy deals selected (already done or no qualifying offers)');
        return;
      }

      this.logger.log(`Successfully selected ${result.selected} crazy deals`);

      // Send push notification to all users
      await this.notificationsService.sendToAll({
        title: '🔥 Today\'s Crazy Deals!',
        body: '5 limited-time offers are live. Check them now!',
        data: {
          type: 'crazy_deals',
          action: 'view_deals',
        },
      });

      this.logger.log('Push notifications sent for crazy deals');
    } catch (error) {
      this.logger.error('Error in daily crazy deals selection:', error);
    }
  }
}
