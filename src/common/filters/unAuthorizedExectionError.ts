// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException) // Catch all HttpExceptions (including BadRequestException, NotFoundException, etc.)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    // You can customize how the error is formatted
    if(exceptionResponse['message'] === 'jwt expired'){
      exceptionResponse['message']='Session Expired'
    }
    if(exceptionResponse['token']){
     return response.status(status).json({
        path: ctx.getRequest().url,
        ok: false,
        status: status,
        message: exceptionResponse['message'] || 'Internal server error',
        error: exceptionResponse['error'] || 'Error',
        details: exceptionResponse['details'] || null,
        token: exceptionResponse['token'] || null,
      });
    }
    response.status(status).json({
      path: ctx.getRequest().url,
      ok: false,
      status: status,
      message: exceptionResponse['message'] || 'Internal server error',
      error: exceptionResponse['error'] || 'Error',
      details: exceptionResponse['details'] || null,
    });
  }
}
