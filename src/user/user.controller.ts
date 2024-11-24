import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Req,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UserService } from './service/user.service';
import { PwdChangeRequest } from './dto/pwd-change-request';
import { UserProfileRequest } from './dto/user-profile-request';

@Controller('member')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getProfile(@Req() req: Request) {
    const username = req.user['username'];
    return await this.userService.getProfile(username);
  }

  @Put('/password')
  async changePassword(
    @Body() pwdChangeRequest: PwdChangeRequest,
    @Req() req: Request,
  ) {
    const username = req.user['username'];
    if (username !== pwdChangeRequest.username) {
      throw new HttpException('Not authorized', HttpStatus.FORBIDDEN);
    }
    await this.userService.changePassword(pwdChangeRequest);
    return { message: 'Password changed successfully' };
  }

  @Post('/profileImg')
  @UseInterceptors(FileInterceptor('profileImg'))
  async uploadProfileImg(
    @UploadedFile() file: Express.Multer.File,
    @Body('username') usernameFromBody: string,
    @Req() req: Request,
  ) {
    const username = req.user['username'];
    if (username !== usernameFromBody) {
      throw new HttpException('Not authorized', HttpStatus.FORBIDDEN);
    }
    if (!file) {
      throw new NotFoundException('No image file provided');
    }

    if (file.size > 15 * 1024 * 1024) {
      throw new HttpException(
        'File is too large to upload',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.isAllowedFileType(file.mimetype)) {
      throw new HttpException('Invalid image type', HttpStatus.BAD_REQUEST);
    }

    const profileImg = await this.userService.uploadProfileImg(
      file,
      file.filename,
    );
    return { profileImg };
  }

  @Post('/bgImg')
  @UseInterceptors(FileInterceptor('bgImg'))
  async uploadBgImg(
    @UploadedFile() file: Express.Multer.File,
    @Body() userProfileUpdateRequest: UserProfileRequest,
    @Req() req: Request,
  ) {
    const username = req.user['username'];
    if (username !== userProfileUpdateRequest.username) {
      throw new HttpException('Not authorized', HttpStatus.FORBIDDEN);
    }

    if (file.size > 30 * 1024 * 1024) {
      throw new HttpException(
        'File is too large to upload',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.isAllowedFileType(file.mimetype)) {
      throw new HttpException('Invalid image type', HttpStatus.BAD_REQUEST);
    }

    const bgImg = await this.userService.uploadBgImg(userProfileUpdateRequest);
    return { bgImg };
  }

  private isAllowedFileType(contentType: string): boolean {
    return ['image/png', 'image/jpeg', 'image/jpg'].includes(contentType);
  }
}
