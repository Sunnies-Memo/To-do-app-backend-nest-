import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LogRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    console.log(
      '|||||||||||||||||||||||||||||||||||||||||||Request|||||||||||||||||||||||||||||||||||||',
    );
    console.log('Request URL:', request.url);
    console.log('Request Method:', request.method);
    // console.log('Request Headers:', request.headers);
    console.log('Request Body:', request.body);
    // console.log('Request Query Params:', request.query);
    // console.log('Request Params:', request.params);

    return next.handle(); // 요청 처리를 계속 진행
  }
}
