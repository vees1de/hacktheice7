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
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('smart-search')
export class SmartSearchController {
  constructor(private readonly smartSearchService: SmartSearchService) {}

  @Post('benefits')
  @Auth()
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async benefits(
    @CurrentUser('id') userId: string,
    @Body() dto: SmartSearchDto
  ) {
    return this.smartSearchService.searchBenefits(
      dto.query,
      userId,
      dto.searchAll ?? false
    );
  }
}
