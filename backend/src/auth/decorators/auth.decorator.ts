import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { StaffRolesGuard } from '../guards/staff-roles.guard';

export const Auth = () => UseGuards(JwtAuthGuard, StaffRolesGuard);
