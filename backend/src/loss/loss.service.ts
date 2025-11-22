import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserLossResult, calculateUserLoss } from './user-loss.logic';

@Injectable()
export class LossService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserLoss(userId: string): Promise<UserLossResult> {
    return calculateUserLoss(this.prisma, userId);
  }
}
