import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(201)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const result = await this.authService.register(dto);
      return {
        message:
          'Регистрация принята. Подтвердите телефон кодом из SMS (mock: 4444).',
        userId: result.userId
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('verify-phone')
  async verifyPhone(@Body() dto: VerifyPhoneDto) {
    try {
      if (dto.code !== '4444') {
        throw new BadRequestException('Invalid verification code');
      }

      await this.authService.verifyPhone(dto.phone);
      return {
        message:
          'Телефон подтвержден. Теперь можно войти, а офферы партнеров откроются после входа через Госуслуги.'
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Phone verification failed');
    }
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  @HttpCode(200)
  @Post('refresh')
  async refreshTokens(@Body() body: RefreshTokenDto) {
    try {
      return await this.authService.refreshTokens(body.refreshToken);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Token refresh failed');
    }
  }
}
