import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { SmartSearchService } from './smart-search.service';
import { SmartSearchDto } from './smart-search.dto';

@Controller('smart-search')
export class SmartSearchController {
  constructor(private readonly smartSearchService: SmartSearchService) {}

  @Post('benefits')
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async benefits(@Body() dto: SmartSearchDto) {
    return this.smartSearchService.searchBenefits(dto.query);
  }
}
