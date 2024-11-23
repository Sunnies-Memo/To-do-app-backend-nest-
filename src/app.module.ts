import { Global, Module } from '@nestjs/common';
import { BoardModule } from './boards/board.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './global/pipe/exception-filter';
import { AuthModule } from './auth/auth.module';
import { S3ImageService } from './s3/service/s3-image/s3-image.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user';
import { Board } from './boards/entities/board.entity';
import { RefreshToken } from './auth/entities/refresh-token';
import { Card } from './boards/entities/card.entity';
import { JwtModule } from '@nestjs/jwt';
import { S3Service } from './s3/service/s3/s3.service';
import { S3Module } from './s3/s3.module';
import { ConfigModule } from '@nestjs/config';
import mysql2 from 'mysql2';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { DefaultModule } from './default/default.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.development`,
    }),
    BoardModule,
    AuthModule,
    UserModule,
    S3Module,
    TypeOrmModule.forRoot({
      type: 'mysql',
      driver: mysql2,
      host: 'localhost',
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PWD,
      database: 'todo_app',
      entities: [User, Board, Card, RefreshToken],
      synchronize: false,
      logging: true,
    }),
    JwtModule,
    DefaultModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    S3ImageService,
    S3Service,
  ],
})
export class AppModule {}
