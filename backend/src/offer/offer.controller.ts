import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  ForbiddenException
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { StaffRoles } from '../auth/decorators/staff-roles.decorator';
import { StaffRole } from '@prisma/client';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { SafeUser } from '../auth/types/safe-user.type';

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get()
  @Auth()
  @StaffRoles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.PARTNER)
  getOffers() {
    return this.offerService.getAll();
  }

  @Get('public')
  @Auth()
  getPublicOffers() {
    return this.offerService.getAll();
  }

  @Get(':id')
  @Auth()
  @StaffRoles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.PARTNER)
  getOffer(@Param('id') id: string) {
    return this.offerService.getById(id);
  }

  @Post()
  @Auth()
  @StaffRoles(StaffRole.ADMIN, StaffRole.PARTNER)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createOffer(
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateOfferDto
  ) {
    const staffId = user.staffProfile?.id;
    if (!staffId) {
      throw new ForbiddenException('Отсутствует профиль сотрудника');
    }

    return this.offerService.create(dto, staffId);
  }

  @Put(':id')
  @Auth()
  @StaffRoles(StaffRole.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateOffer(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.offerService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @StaffRoles(StaffRole.ADMIN)
  removeOffer(@Param('id') id: string) {
    return this.offerService.remove(id);
  }
}
