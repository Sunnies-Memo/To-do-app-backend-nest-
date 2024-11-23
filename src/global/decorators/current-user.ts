import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/entities/user';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('//////////////////////in currentuser', request.user);
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
