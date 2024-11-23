import { Module } from '@nestjs/common';
import { S3ImageService } from './service/s3-image/s3-image.service';
import { S3Service } from './service/s3/s3.service';

@Module({
  providers: [S3ImageService, S3Service],
  exports: [S3ImageService, S3Service],
})
export class S3Module {}
