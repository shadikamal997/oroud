import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import 'multer';

@Injectable()
export class UploadService {
  /**
   * Upload image to Cloudinary
   * @param file - Multer file object
   * @returns Cloudinary upload response with secure URL
   */
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    // Validate file exists
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.'
      );
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size exceeds 2MB limit.'
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'oroud/offers', // Organize uploads in folders
          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: 'limit', // Don't upscale, only downscale if larger
              quality: 'auto:good', // Auto optimize quality
              fetch_format: 'auto', // Auto select best format (WebP if supported)
            },
          ],
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException(`Upload failed: ${error.message}`));
          } else {
            resolve(result);
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Cloudinary public ID
   */
  async deleteImage(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }
}
