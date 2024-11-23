import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user';
import { UserController } from './user.controller';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), S3Module],
  providers: [UserService],
  controllers: [UserController],
  exports: [],
})
export class UserModule {}
