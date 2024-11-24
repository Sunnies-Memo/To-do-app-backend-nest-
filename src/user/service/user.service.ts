import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  NotAcceptableException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserProfileRequest } from '../dto/user-profile-request';
import { UserProfileResponse } from '../dto/user-profile-response';
import { S3ImageService } from 'src/s3/service/s3-image/s3-image.service';
import { PwdChangeRequest } from '../dto/pwd-change-request';
import { User } from '../entities/user';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { S3Service } from 'src/s3/service/s3/s3.service';

@Injectable()
export class UserService {
  private readonly PROFILE_IMG_PATH = 'images/member/profile/';
  private readonly BG_IMG_PATH = 'images/member/bg/';

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly s3ImageService: S3ImageService,
    private readonly s3Service: S3Service,
  ) {}

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findById(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username: username } });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async update(username: string, user: Partial<User>): Promise<User | null> {
    await this.repository.update(username, user);
    return this.repository.findOne({ where: { username: username } });
  }

  async delete(username: string): Promise<void> {
    await this.repository.delete(username);
  }

  async changePassword(pwdChangeRequest: PwdChangeRequest): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.getRepository(User).findOneOrFail({
        where: { username: pwdChangeRequest.username },
      });
      if (!user) throw new NotFoundException('User not found');

      const passwordMatch = await bcrypt.compare(
        pwdChangeRequest.oldPassword,
        user.password,
      );
      if (!passwordMatch)
        throw new UnauthorizedException('Old password does not match');

      const hashedPassword = await bcrypt.hash(
        pwdChangeRequest.newPassword,
        10,
      );
      await queryRunner.manager
        .getRepository(User)
        .update(pwdChangeRequest.username, {
          password: hashedPassword,
        });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProfile(
    userProfileUpdateRequest: UserProfileRequest,
  ): Promise<UserProfileResponse> {
    let newProfileImgPath = '';
    let newBgImgPath = '';

    if (userProfileUpdateRequest.profileImg) {
      newProfileImgPath = await this.uploadImg(
        userProfileUpdateRequest.profileImg,
        this.PROFILE_IMG_PATH,
      );
    }

    if (userProfileUpdateRequest.bgImg) {
      newBgImgPath = await this.uploadImg(
        userProfileUpdateRequest.bgImg,
        this.BG_IMG_PATH,
      );
    }

    const updatedUser = await this.repository.update(
      userProfileUpdateRequest.username,
      {
        profileImg: newProfileImgPath,
        bgImg: newBgImgPath,
        password: userProfileUpdateRequest.password
          ? await bcrypt.hash(userProfileUpdateRequest.password, 10)
          : undefined,
      },
    );
    if (!updatedUser.affected) {
      throw new NotAcceptableException("Can't update");
    }

    return new UserProfileResponse(
      userProfileUpdateRequest.username,
      newProfileImgPath,
      newBgImgPath,
    );
  }

  async getProfile(username: string): Promise<UserProfileResponse> {
    const user = await this.repository.findOneOrFail({
      where: { username: username },
    });
    if (!user) throw new NotFoundException('User does not exist');

    return new UserProfileResponse(user.username, user.profileImg, user.bgImg);
  }

  async uploadProfileImg(
    file: Express.Multer.File,
    username: string,
  ): Promise<string> {
    const newProfileImgPath = await this.uploadImg(
      file.buffer,
      this.PROFILE_IMG_PATH,
    );
    await this.repository.update(username, {
      profileImg: newProfileImgPath,
    });

    return newProfileImgPath;
  }

  async uploadBgImg(userProfileRequest: UserProfileRequest): Promise<string> {
    if (!userProfileRequest.bgImg)
      throw new NotFoundException('No background image provided');

    const newBgImgPath = await this.uploadImg(
      userProfileRequest.bgImg,
      this.BG_IMG_PATH,
    );
    await this.repository.update(userProfileRequest.username, {
      bgImg: newBgImgPath,
    });

    return newBgImgPath;
  }

  private async uploadImg(imgFile: Buffer, path: string) {
    const filename = v4();
    await this.s3ImageService.uploadImgFile(
      imgFile,
      filename,
      process.env.AWS_BUCKET,
      path,
    );
    const url = this.s3Service.generateURL(
      process.env.AWS_BUCKET,
      process.env.AWS_REGION,
      path,
      filename,
    );
    return url;
  }
}
