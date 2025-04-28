import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let errorResponse = {
      statusCode: exception.status || 500,
      message: exception.message || 'Internal Server Error',
      path: request.url,
    };

    if (exception instanceof Array) {
      errorResponse.message = exception;
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
