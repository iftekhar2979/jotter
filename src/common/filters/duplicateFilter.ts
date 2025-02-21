import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  ConflictException,
} from '@nestjs/common';
import { error } from 'console';
import { MongoError } from 'mongodb'; // Import MongoDB error type

@Catch(MongoError)
export class MongoDuplicateKeyExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // console.log("Here is errro",exception);
    if (exception.code === 11000) {
      // If duplicate key error (E11000)
      response.status(409).json({
        status: 'fail',
        statusCode: 400,
        message: `Document is already Exist!!`,
        path: request.url,
      });
    } else {
      // If it's a different MongoDB error, propagate it
      response.status(500).json({
        statusCode: 500,
        message: exception.message,
        path: request.url,
      });
    }
  }
}
