import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { del, put, PutBlobResult } from '@vercel/blob';
import { Buffer } from 'buffer';
interface MulterFileAsObject {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: {
    type: 'Buffer';
    data: number[];
  };
}
@Injectable()
export class vercelBlob {
  constructor() {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const { originalname, buffer, mimetype } = file;
    const pathname = `${new Date().getTime()}-${originalname}`;

    try {
      const blob: PutBlobResult = await put(pathname, file.buffer, {
        access: 'public',
      });
      return blob.url;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  async uploadMultipleFiles(
    files: Array<Express.Multer.File>,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new InternalServerErrorException('No files to upload.');
    }

    const uploadPromises = files.map((file) => this.uploadFile(file));

    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload one or more files.',
      );
    }
  }
}
