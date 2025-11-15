import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  async getAllRegions() {
    return this.regionService.getAllRegions();
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @Auth()
  @UseGuards(AdminGuard)
  async createRegion(@Body() dto: CreateRegionDto) {
    return this.regionService.createRegion(dto);
  }
}
