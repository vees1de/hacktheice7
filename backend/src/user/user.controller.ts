import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { HideBenefitDto } from './dto/hide-benefit.dto';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Auth()
  @HttpCode(200)
  async getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put('profile')
  @Auth()
  async updateProfile(@CurrentUser('id') id: string, @Body() dto: UserDto) {
    return this.userService.update(id, dto);
  }

  @Get('benefits')
  @Auth()
  async getUserBenefits(@CurrentUser('id') userId: string) {
    return this.userService.getUserBenefits(userId);
  }

  @Get('benefits/available')
  @Auth()
  async getAvailableBenefits(@CurrentUser('id') userId: string) {
    return this.userService.getAvailableBenefits(userId);
  }

  @Post('benefits/hide')
  @Auth()
  @UsePipes(new ValidationPipe())
  async hideBenefit(
    @CurrentUser('id') userId: string,
    @Body() dto: HideBenefitDto
  ) {
    return this.userService.hideBenefit(userId, dto.benefitId);
  }

  @Post('benefits/unhide/:benefitId')
  @Auth()
  async unhideBenefit(
    @CurrentUser('id') userId: string,
    @Param('benefitId') benefitId: string
  ) {
    return this.userService.unhideBenefit(userId, benefitId);
  }
}
