import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OffersScheduler } from './offers.scheduler';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [ShopsModule],
  controllers: [OffersController],
  providers: [OffersService, OffersScheduler],
  exports: [OffersService],
})
export class OffersModule {}
