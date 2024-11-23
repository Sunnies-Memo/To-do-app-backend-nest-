import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LogRequestInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LogRequestInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: [${method}] ${url} - Headers: ${JSON.stringify(headers)}`,
    );

    return next.handle().pipe(
      tap(() => {
        const elapsedTime = Date.now() - startTime;

        this.logger.log(
          `Outgoing Response: [${method}] ${url} - ${elapsedTime}ms`,
        );
      }),
      catchError((error) => {
        const elapsedTime = Date.now() - startTime;

        this.logger.error(
          `Error Response: [${method}] ${url} - ${elapsedTime}ms - Error: ${
            error.message
          }`,
          error.stack,
        );

        throw error;
      }),
    );
  }
}
