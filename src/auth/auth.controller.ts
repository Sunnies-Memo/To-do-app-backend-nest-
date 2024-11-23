import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { LoginRequest } from './dto/login-request';
import { Request, Response } from 'express';
import { RegisterRequest } from './dto/register-request';
import { Public } from 'src/global/decorators/public';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginRequest: LoginRequest, @Res() res: Response) {
    const tokens = await this.authService.login(
      loginRequest.username,
      loginRequest.password,
    );
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({
      member: { username: loginRequest.username },
      accessToken: tokens.accessToken,
    });
  }

  @Public()
  @Post('refresh')
  async doRefresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      res.status(200).json({ message: 'There is no refresh token' });
      return;
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({ accessToken: newAccessToken });
  }

  @Public()
  @Post('register')
  async register(@Body() registerRequest: RegisterRequest) {
    this.authService.register(registerRequest);
    return { message: 'User registered successfully' };
  }

  @Public()
  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      res.status(401).json({ message: 'No refresh token provided' });
      return;
    }
    await this.authService.logout(refreshToken);

    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // 즉시 만료
      sameSite: 'none',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  }
}
