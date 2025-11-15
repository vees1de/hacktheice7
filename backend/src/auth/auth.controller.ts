import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(201)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.register(dto);
    return {
      message: 'Registration successful. Verification code (mock): 4444',
      userId: result.userId
    };
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('verify-phone')
  async verifyPhone(@Body() dto: VerifyPhoneDto) {
    // Мок-код всегда 4444 для простоты
    if (dto.code !== '4444') {
      throw new Error('Invalid verification code');
    }

    await this.authService.verifyPhone(dto.phone);
    return {
      message: 'Phone verified successfully. Waiting for admin approval.'
    };
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken, ...response } = await this.authService.login(dto);
    this.authService.addRefreshTokenToResponse(res, refreshToken);
    return response;
  }

  @HttpCode(200)
  @Post('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies[this.authService.REFRESH_TOKEN_NAME];

    if (!refreshToken) {
      this.authService.removeRefreshTokenFromResponse(res);
      throw new Error('Refresh token not found');
    }

    const { refreshToken: newRefreshToken, ...response } =
      await this.authService.refreshTokens(refreshToken);

    this.authService.addRefreshTokenToResponse(res, newRefreshToken);
    return response;
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeRefreshTokenFromResponse(res);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @HttpCode(200)
  async getProfile(@Req() req: Request) {
    // Явно указываем тип для объекта user в запросе
    const user = req.user as { id: string };

    // Проверяем, существует ли пользователь и его ID
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.authService.getProfile(user.id);
  }
}
