import { Injectable } from '@nestjs/common';
import type { UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  async uploadImage(file: Express.Multer.File) {
    const result = await this.uploadFromBuffer(file);

    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
    };
  }

  private uploadFromBuffer(file: Express.Multer.File) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }

          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}
