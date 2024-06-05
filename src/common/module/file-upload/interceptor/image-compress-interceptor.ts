import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as sharp from 'sharp';
import { unlink } from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';

interface CompressionOptions {
  size?: number;
  quality?: number;
}

@Injectable()
export class ImageCompressionInterceptor implements NestInterceptor {
  private size: number;
  private quality: number;

  constructor(options?: CompressionOptions) {
    this.size = options?.size || 1024;
    this.quality = options?.quality || 80;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    // Extract files from the request
    const files: Express.Multer.File | Express.Multer.File[] =
      request.files || request.file;

    // Process files: compress and clean up
    if (Array.isArray(files)) {
      for (const file of files) {
        await this.compressAndCleanup(file);
      }
    } else if (files) {
      await this.compressAndCleanup(files);
    }

    // Continue to the controller
    return next.handle();
  }

  private async compressAndCleanup(file: Express.Multer.File): Promise<void> {
    return new Promise((resolve, reject) => {
      const originalPath = file.path;
      const newPath = originalPath.replace(/(\.[\w\d_-]+)$/i, '_compressed$1');

      const readStream = createReadStream(originalPath);
      const writeStream = createWriteStream(newPath);

      readStream
        .pipe(sharp().resize(this.size).jpeg({ quality: this.quality }))
        .pipe(writeStream)
        .on('finish', () => {
          unlink(originalPath)
            .then(() => {
              file.path = newPath;
              file.filename = file.filename.replace(
                /(\.[\w\d_-]+)$/i,
                '_compressed$1',
              );
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }
}
