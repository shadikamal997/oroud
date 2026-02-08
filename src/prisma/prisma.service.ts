import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('🔄 Attempting to connect to database...');
      this.logger.log(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes (hidden)' : 'No'}`);
      
      await this.$connect();
      
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database');
      this.logger.error(`Error details: ${error.message}`);
      this.logger.error(`Error code: ${error.code}`);
      this.logger.error(`DATABASE_URL present: ${!!process.env.DATABASE_URL}`);
      
      // Don't throw - let app start and retry connections
      this.logger.warn('⚠️  Continuing without database connection - check your DATABASE_URL');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
