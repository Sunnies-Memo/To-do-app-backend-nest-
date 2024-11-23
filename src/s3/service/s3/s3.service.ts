import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      // credentials: {
      //   accessKeyId: process.env.AWS_S3_KEY_ID,
      //   secretAccessKey: process.env.AWS_S3_KEY,
      // },
    });
  }

  async uploadFile(
    stream: Readable,
    filename: string,
    bucketName: string,
    path: string,
  ) {
    const params = {
      Bucket: bucketName,
      Key: `${path}${filename}`,
      Body: stream,
    };
    const command = new PutObjectCommand(params);
    return this.s3Client.send(command);
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
