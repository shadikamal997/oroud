import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: admin.app.App;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    try {
      const serviceAccountPath = path.join(
        process.cwd(),
        'config',
        'firebase-service-account.json',
      );

      if (!fs.existsSync(serviceAccountPath)) {
        this.logger.warn(
          'Firebase service account file not found. Push notifications will not work.',
        );
        this.logger.warn(
          'Please add firebase-service-account.json to the config folder.',
        );
        return;
      }

      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8'),
      );

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.logger.log('Firebase Admin initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin:', error.message);
    }
  }

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    // Check if token already exists
    const existingToken = await this.prisma.deviceToken.findUnique({
      where: { token: dto.token },
    });

    if (existingToken) {
      // Update cityId if provided
      if (dto.cityId && existingToken.cityId !== dto.cityId) {
        return this.prisma.deviceToken.update({
          where: { token: dto.token },
          data: { cityId: dto.cityId },
        });
      }
      return existingToken;
    }

    // Create new device token
    return this.prisma.deviceToken.create({
      data: {
        userId,
        token: dto.token,
        cityId: dto.cityId,
      },
    });
  }

  async sendNotification(dto: SendNotificationDto) {
    if (!this.firebaseApp) {
      throw new Error('Firebase is not initialized. Cannot send notifications.');
    }

    // Get device tokens based on cityId filter
    const whereClause = dto.cityId
      ? {
          cityId: dto.cityId,
          user: { isActive: true }, // Only send to active users
        }
      : {
          user: { isActive: true },
        };

    const deviceTokens = await this.prisma.deviceToken.findMany({
      where: whereClause,
      select: { token: true, id: true },
    });

    if (deviceTokens.length === 0) {
      return {
        success: true,
        message: 'No device tokens found for the specified criteria',
        sentCount: 0,
      };
    }

    this.logger.log(
      `Sending notification to ${deviceTokens.length} devices${dto.cityId ? ` in city ${dto.cityId}` : ' (all cities)'}`,
    );

    // Send in batches of 500 (FCM limit)
    const batchSize = 500;
    let totalSent = 0;
    let totalFailed = 0;
    const invalidTokens: string[] = [];

    for (let i = 0; i < deviceTokens.length; i += batchSize) {
      const batch = deviceTokens.slice(i, i + batchSize);
      const tokens = batch.map((dt) => dt.token);

      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title: dto.title,
            body: dto.body,
          },
          data: dto.data || {},
          android: {
            priority: 'high',
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
              },
            },
          },
        });

        totalSent += response.successCount;
        totalFailed += response.failureCount;

        // Collect invalid tokens for cleanup
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            if (
              error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(batch[idx].id);
            }
          }
        });

        this.logger.log(
          `Batch ${Math.floor(i / batchSize) + 1}: Sent ${response.successCount}, Failed ${response.failureCount}`,
        );
      } catch (error) {
        this.logger.error(`Error sending batch: ${error.message}`);
        totalFailed += batch.length;
      }
    }

    // Clean up invalid tokens
    if (invalidTokens.length > 0) {
      await this.prisma.deviceToken.deleteMany({
        where: { id: { in: invalidTokens } },
      });
      this.logger.log(`Removed ${invalidTokens.length} invalid tokens`);
    }

    return {
      success: true,
      message: 'Notification sent',
      sentCount: totalSent,
      failedCount: totalFailed,
      removedTokens: invalidTokens.length,
    };
  }

  /**
   * Send notification to all active users (convenience method)
   */
  async sendToAll(params: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    return this.sendNotification({
      title: params.title,
      body: params.body,
      data: params.data,
    });
  }
}
