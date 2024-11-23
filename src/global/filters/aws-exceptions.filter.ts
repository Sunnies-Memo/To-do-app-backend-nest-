import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { S3ServiceException } from '@aws-sdk/client-s3'; // AWS SDK v3에서 사용되는 기본 예외 클래스
import { Request, Response } from 'express';

@Catch(S3ServiceException)
export class AwsExceptionFilter implements ExceptionFilter {
  catch(exception: S3ServiceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // S3 예외를 처리하고 500 상태 코드로 변환
    response.status(500).json({
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'S3 요청 처리 중 오류가 발생했습니다.',
    });
  }
}
