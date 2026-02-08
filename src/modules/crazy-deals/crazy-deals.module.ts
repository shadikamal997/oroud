import { Module } from '@nestjs/common';
import { CrazyDealsController } from './crazy-deals.controller';
import { CrazyDealsService } from './crazy-deals.service';
import { CrazyDealsScheduler } from './crazy-deals.scheduler';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [CrazyDealsController],
  providers: [CrazyDealsService, CrazyDealsScheduler],
  exports: [CrazyDealsService],
})
export class CrazyDealsModule {}
