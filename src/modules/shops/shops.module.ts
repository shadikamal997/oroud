import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { TrustService } from './trust.service';

@Module({
  controllers: [ShopsController],
  providers: [ShopsService, TrustService],
  exports: [ShopsService, TrustService],
})
export class ShopsModule {}
