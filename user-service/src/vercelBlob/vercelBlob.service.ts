
import { Injectable, Inject } from '@nestjs/common';
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

  constructor(
  ) { }

  async uploadFile(file: MulterFileAsObject, oldUrl?: string): Promise<string> {
    console.log("hello from uploadfile ")

    const { originalname, buffer, mimetype } = file;
    const pathname = `${new Date().getTime()}-${originalname}`;

    const fileBuffer = Buffer.from(buffer.data);

    console.log("hello from try ")

    const blob: PutBlobResult = await put(pathname, fileBuffer, {
      access: 'public',
    });
    return blob.url;

  }


}
