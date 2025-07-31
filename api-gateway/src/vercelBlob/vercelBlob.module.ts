
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { vercelBlob } from './vercelBlob.service';

@Module({
  imports: [ConfigModule],
  providers: [vercelBlob],
  exports: [vercelBlob],
})
export class VercelBlobModule {}
