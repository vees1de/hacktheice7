import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 1;
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private jwt: JwtService,
    private userService: UserService
  ) {}

  async login(dto: AuthDto) {
    const { passwordHash, ...user } = await this.validateUser(dto);
    const tokens = this.issueTokens(user.id);

    return {
      user,
      ...tokens
    };
  }

  async register(dto: RegisterDto) {
    const oldUser = await this.userService.getByEmail(dto.email);

    if (oldUser) throw new BadRequestException('User already exists');

    const { passwordHash, ...user } = await this.userService.create(dto);

    const tokens = this.issueTokens(user.id);

    return {
      user,
      ...tokens
    };
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);
    if (!result) throw new UnauthorizedException('Invalid refresh token');

    // Поле называется 'passwordHash', а не 'password'
    const { passwordHash, ...user } = await this.userService.getById(result.id);

    const tokens = this.issueTokens(user.id);

    return {
      user,
      ...tokens
    };
  }

  private issueTokens(userId: string) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h'
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d'
    });

    return { accessToken, refreshToken };
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.userService.getByEmail(dto.email);

    if (!user) throw new NotFoundException('User not found');

    // Проверяем, что у пользователя есть пароль (он мог войти через Госуслуги)
    if (!user.passwordHash)
      throw new UnauthorizedException('Password login not available');

    // Сверяем с 'passwordHash', а не 'password'
    const isValid = await verify(user.passwordHash, dto.password);

    if (!isValid) throw new UnauthorizedException('Invalid password');

    return user;
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: 'localhost', // Укажите ваш домен в .env для production
      expires: expiresIn,
      secure: true, // В production должно быть true
      // lax если production
      sameSite: 'none' // 'lax' для production, 'none' для dev с разными портами
    });
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: 'localhost',
      expires: new Date(0),
      secure: true,
      sameSite: 'none'
    });
  }
}
