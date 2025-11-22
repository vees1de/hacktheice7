import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { BenefitService } from './benefit.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { StaffRoles } from '../auth/decorators/staff-roles.decorator';
import { StaffRole } from '@prisma/client';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('benefits')
export class BenefitController {
  constructor(private readonly benefitService: BenefitService) {}

  @Get()
  @Auth()
  @StaffRoles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.PARTNER)
  getBenefits() {
    return this.benefitService.getAll();
  }

  @Get('public')
  @Auth()
  getPublicBenefits() {
    return this.benefitService.getAll();
  }

  @Get('available')
  @Auth()
  getUserBenefits(@CurrentUser('id') userId: string) {
    return this.benefitService.getForUser(userId);
  }

  @Get(':id')
  @Auth()
  @StaffRoles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.PARTNER)
  getBenefit(@Param('id') id: string) {
    return this.benefitService.getById(id);
  }

  @Post()
  @Auth()
  @StaffRoles(StaffRole.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createBenefit(@Body() dto: CreateBenefitDto) {
    return this.benefitService.create(dto);
  }

  @Put(':id')
  @Auth()
  @StaffRoles(StaffRole.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateBenefit(@Param('id') id: string, @Body() dto: UpdateBenefitDto) {
    return this.benefitService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @StaffRoles(StaffRole.ADMIN)
  removeBenefit(@Param('id') id: string) {
    return this.benefitService.remove(id);
  }
}
