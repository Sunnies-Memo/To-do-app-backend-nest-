import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/global/decorators/public';

@Controller('test')
export class DefaultController {
  @Public()
  @Get()
  async test() {
    return { message: "IT'S WORKING.." };
  }
}
