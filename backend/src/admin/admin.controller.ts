import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { AdminGuard } from './guards/admin.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserService } from '../user/user.service';
import { AssignCategoryDto } from '../auth/dto/assign-category.dto';
import { ApproveUserDto } from '../user/dto/approve-user.dto';
import { BeneficiaryCategoryService } from '../beneficiary-category/beneficiary-category.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { BeneficiaryCategoryType } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly beneficiaryCategoryService: BeneficiaryCategoryService
  ) {}

  @Get('pending-users')
  @Auth()
  @HttpCode(200)
  async getPendingUsers() {
    return this.userService.getPendingUsers();
  }

  @Post('approve-user')
  @Auth()
  async approveUser(@Body() approveUserDto: ApproveUserDto) {
    const categories = approveUserDto.categories.map(
      cat => cat as BeneficiaryCategoryType
    );

    return this.userService.approveUser(approveUserDto.userId, categories);
  }

  @UsePipes(new ValidationPipe())
  @Auth()
  @HttpCode(200)
  @Post('assign-categories')
  async assignCategories(@Body() dto: AssignCategoryDto) {
    return this.beneficiaryCategoryService.assignCategoriesToUser(
      dto.userId,
      dto.categories
    );
  }

  @Get('benefits')
  @Auth()
  @HttpCode(200)
  async getBenefits(@CurrentUser('id') userId: string) {
    return this.beneficiaryCategoryService.getUserBenefits(userId);
  }
}
