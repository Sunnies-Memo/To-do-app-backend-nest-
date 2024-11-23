import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('-=-=-=-=-=-=-=GUARD-=-=-=-=-=-=-=-');
    if (isPublic) {
      console.log('is Public');
      return true;
    }
    try {
      console.log('try');
      const result = super.canActivate(context);
      return result;
    } catch (e) {
      console.log('in error', e);
      if (e instanceof UnauthorizedException) {
        console.log('catching Error');
        console.log('JWT Authentication Failed:', e.message); // 로그 출력
        throw e; // 예외를 다시 던져 처리
      }
    }
  }
}
