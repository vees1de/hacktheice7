import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { LossService } from './loss.service';

@Controller('me')
export class LossController {
  constructor(private readonly lossService: LossService) {}

  @Get('loss')
  @Auth()
  async getMyLoss(@CurrentUser('id') userId: string) {
    return this.lossService.getUserLoss(userId);
  }
}
