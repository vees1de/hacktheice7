import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { StaffRoles } from '../auth/decorators/staff-roles.decorator';
import { StaffRole } from '@prisma/client';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  async getAllRegions() {
    return this.regionService.getAllRegions();
  }

  @Get(':id')
  async getRegionById(@Param('id') id: string) {
    try {
      return await this.regionService.getRegionById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid region ID format');
    }
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @Auth()
  @StaffRoles(StaffRole.ADMIN)
  async createRegion(@Body() dto: CreateRegionDto) {
    return this.regionService.createRegion(dto);
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @Auth()
  @StaffRoles(StaffRole.ADMIN)
  async updateRegion(@Param('id') id: string, @Body() dto: UpdateRegionDto) {
    try {
      return await this.regionService.updateRegion(id, dto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid region ID format or update data');
    }
  }

  @Delete(':id')
  @Auth()
  @StaffRoles(StaffRole.ADMIN)
  async deleteRegion(@Param('id') id: string) {
    try {
      return await this.regionService.deleteRegion(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid region ID format');
    }
  }
}
