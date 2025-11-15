import { HttpException, HttpStatus } from '@nestjs/common';

export class NeedApprovalException extends HttpException {
  constructor(
    message: string = 'User account is not active yet. Please wait for admin approval.'
  ) {
    // Изменим структуру ответа на более простую
    super({ errorCode: 'needApproval', message }, HttpStatus.UNAUTHORIZED);
  }
}
