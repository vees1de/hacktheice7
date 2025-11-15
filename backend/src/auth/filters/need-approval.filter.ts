import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { NeedApprovalException } from '../exceptions/need-approval.exception';

@Catch(NeedApprovalException)
export class NeedApprovalExceptionFilter implements ExceptionFilter {
  catch(exception: NeedApprovalException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const responseMessage = exception.getResponse();

    response.status(status).json(responseMessage);
  }
}
