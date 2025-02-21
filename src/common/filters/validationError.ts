import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, ForbiddenException } from '@nestjs/common';
import { error } from 'console';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const validationErrors = exception.getResponse() as any;
    response.status(exception.getStatus()).json({
      path: request.url,
      status: exception.getStatus(),
      message: validationErrors.message,
      error: "Validation Error!",
      ok:false
    });
  }
}
