import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-device')
  @UseGuards(JwtAuthGuard)
  async registerDevice(@Request() req, @Body() dto: RegisterDeviceDto) {
    const deviceToken = await this.notificationsService.registerDevice(
      req.user.userId,
      dto,
    );
    return {
      message: 'Device registered successfully',
      deviceToken: {
        id: deviceToken.id,
        token: deviceToken.token,
        cityId: deviceToken.cityId,
      },
    };
  }
}
