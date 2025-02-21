// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException) // Catch all HttpExceptions (including BadRequestException, NotFoundException, etc.)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    console.log("expection is Here",exceptionResponse)
    // You can customize how the error is formatted
    response.status(status).json({
      statusCode: status,
      message: exceptionResponse['message'] || 'Internal server error',
      error: exceptionResponse['error'] || 'Error',
    });
  }
}
