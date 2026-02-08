import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload image endpoint
   * POST /upload/image
   * Requires authentication
   * Accepts multipart/form-data with 'image' field
   */
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    try {
      const result = await this.uploadService.uploadImage(file);

      return {
        success: true,
        imageUrl: result.secure_url,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to upload image'
      );
    }
  }
}
