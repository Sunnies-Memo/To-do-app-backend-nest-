import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user';
import { RegisterRequest } from '../dto/register-request';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username: username },
    });
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  validateToken(token: string, isAccess: boolean) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: isAccess
          ? process.env.JWT_ACCESSTOKEN_SECRET
          : process.env.JWT_REFRESHTOKEN_SECRET,
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token', error);
    }
  }

  generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESHTOKEN_SECRET,
      expiresIn: '7d',
    } as JwtSignOptions);
  }

  async login(username: string, password: string) {
    if (!(await this.validateUser(username, password))) {
      throw new UnauthorizedException("User doesn't exist");
    }
    const payload = { username: username };
    const refreshToken = this.generateRefreshToken(payload);
    this.refreshTokenRepository.upsert(
      { user: { username: username }, refreshToken: refreshToken },
      ['user'],
    );
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const { username } = this.validateToken(refreshToken, false);
    const result = await this.refreshTokenRepository.delete({
      user: { username: username },
    });
    if (result.affected === 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(registerRequest: RegisterRequest): Promise<User> {
    const { username, password } = registerRequest;
    const existingUser = await this.userRepository.findOneBy({
      username: username,
    });
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    // 비밀번호 암호화 후 회원 생성
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userRepository.save({
      username,
      password: hashedPassword,
    } as User);
    return newUser;
  }

  async refresh(refreshToken: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const refreshRepo = queryRunner.manager.withRepository(
        this.refreshTokenRepository,
      );

      const { username } = this.validateToken(refreshToken, false);
      const savedToken = await refreshRepo.findOne({
        where: { user: { username: username } },
      });
      if (!savedToken || savedToken.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // accessToken을 새로 발급
      const accessToken = this.jwtService.sign({ username: username });

      // 새로운 refreshToken을 생성하여 DB에 저장
      const newRefreshToken = this.generateRefreshToken({ username });
      await refreshRepo.upsert(
        { user: { username: username }, refreshToken: newRefreshToken },
        ['user'],
      );
      await queryRunner.commitTransaction();
      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
