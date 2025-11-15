import { Controller, Get, HttpCode } from '@nestjs/common';
import { BeneficiaryCategoryService } from './beneficiary-category.service';

@Controller('beneficiary-categories')
export class BeneficiaryCategoryController {
  constructor(
    private readonly beneficiaryCategoryService: BeneficiaryCategoryService
  ) {}

  @Get()
  @HttpCode(200)
  async getAll() {
    return this.beneficiaryCategoryService.getAllCategories();
  }
}
