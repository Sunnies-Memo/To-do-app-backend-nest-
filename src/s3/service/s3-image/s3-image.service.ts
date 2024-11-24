import { Injectable, BadRequestException, UseFilters } from '@nestjs/common';
import { AwsExceptionFilter } from '../../../global/filters/aws-exceptions.filter';
import { S3Service } from '../s3/s3.service';
import { FileTypeResult, fromBuffer } from 'file-type';

@Injectable()
@UseFilters(AwsExceptionFilter)
export class S3ImageService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadImgFile(
    buffer: Buffer,
    filename: string,
    bucketName: string,
    path: string,
  ) {
    const fileType: FileTypeResult | null = await fromBuffer(buffer);
    if (!fileType || this.isImage(fileType.mime)) {
      throw new BadRequestException('Invalid image file type.');
    }
    return this.s3Service.uploadFile(
      buffer,
      filename,
      bucketName,
      fileType,
      path,
    );
  }

  private isImage(mimeType: string): boolean {
    const validImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return validImageTypes.includes(mimeType);
  }
}
