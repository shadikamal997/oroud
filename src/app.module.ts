import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ShopsModule } from './modules/shops/shops.module';
import { OffersModule } from './modules/offers/offers.module';
import { CitiesModule } from './modules/cities/cities.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdsModule } from './modules/ads/ads.module';
import { UploadModule } from './modules/upload/upload.module';
import { CrazyDealsModule } from './modules/crazy-deals/crazy-deals.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModuleOptions } from './config/config-validation.service';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 100, // 100 requests per minute per IP
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ShopsModule,
    OffersModule,
    CitiesModule,
    ReportsModule,
    AdminModule,
    NotificationsModule,
    AdsModule,
    UploadModule,
    CrazyDealsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
