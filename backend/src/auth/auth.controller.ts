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
import { ShareTokenDto } from './dto/share-token.dto';
import { Auth } from './decorators/auth.decorator';
import { CurrentUser } from './decorators/user.decorator';
import {
  WebauthnLoginOptionsDto,
  WebauthnLoginVerifyDto,
  WebauthnRegisterVerifyDto
} from './dto/webauthn.dto';

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
        message: 'Регистрация принята. Подтвердите телефон кодом из SMS.',
        result: true,
        data: result
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
      await this.authService.verifyPhone(dto.phone, dto.code);
      return {
        message:
          'Телефон подтвержден. Теперь можно войти, а офферы партнеров откроются после входа через Госуслуги.',
        result: true
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

  @HttpCode(200)
  @Auth()
  @Get('webauthn/register/options')
  async getWebauthnRegisterOptions(@CurrentUser('id') userId: string) {
    return this.authService.getWebauthnRegistrationOptions(userId);
  }

  @HttpCode(200)
  @Auth()
  @UsePipes(new ValidationPipe())
  @Post('webauthn/register/verify')
  async verifyWebauthnRegister(
    @CurrentUser('id') userId: string,
    @Body() dto: WebauthnRegisterVerifyDto
  ) {
    return this.authService.verifyWebauthnRegistration(userId, dto.response);
  }

  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('webauthn/login/options')
  async getWebauthnLoginOptions(@Body() dto: WebauthnLoginOptionsDto) {
    return this.authService.getWebauthnLoginOptions(dto.phone);
  }

  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('webauthn/login/verify')
  async verifyWebauthnLogin(@Body() dto: WebauthnLoginVerifyDto) {
    return this.authService.verifyWebauthnLogin(dto.phone, dto.response);
  }

  @HttpCode(200)
  @Post('share-token')
  @Auth()
  async createShareToken(@CurrentUser('id') userId: string) {
    return this.authService.createShareToken(userId);
  }

  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('share-token/resolve')
  async getUserByShareToken(@Body() dto: ShareTokenDto) {
    try {
      return await this.authService.getUserFromShareToken(dto.token);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Unable to resolve token');
    }
  }
}
