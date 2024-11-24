import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { FileTypeResult } from 'file-type';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    bucketName: string,
    fileType: FileTypeResult,
    path: string,
  ) {
    const params = {
      Bucket: bucketName,
      Key: `${path}${filename}`,
      Body: buffer,
      ContentType: fileType.mime,
    };

    const upload = new Upload({
      client: this.s3Client,
      params: params,
    });

    return upload.done();
  }

  generateURL(
    bucketName: string,
    region: string,
    path: string,
    filename: string,
  ): string {
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}${filename}`;
  }
}
