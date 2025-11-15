import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserService } from '../user/user.service';
import { AssignCategoryDto } from '../auth/dto/assign-category.dto';
import { BeneficiaryCategoryService } from '../beneficiary-category/beneficiary-category.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UpdateUserCategoryDto } from '../beneficiary-category/dto/update-user-category.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly beneficiaryCategoryService: BeneficiaryCategoryService
  ) {}

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

  @UsePipes(new ValidationPipe())
  @Auth()
  @HttpCode(200)
  @Post('add-category')
  async addCategory(@Body() dto: UpdateUserCategoryDto) {
    return this.beneficiaryCategoryService.addCategoryToUser(
      dto.userId,
      dto.category
    );
  }

  @UsePipes(new ValidationPipe())
  @Auth()
  @HttpCode(200)
  @Post('remove-category')
  async removeCategory(@Body() dto: UpdateUserCategoryDto) {
    return this.beneficiaryCategoryService.removeCategoryFromUser(
      dto.userId,
      dto.category
    );
  }

  @Get('benefits')
  @Auth()
  @HttpCode(200)
  async getBenefits(@CurrentUser('id') userId: string) {
    return this.beneficiaryCategoryService.getUserBenefits(userId);
  }
}
