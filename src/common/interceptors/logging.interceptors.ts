import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.time("Request-response time");
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const url = request.url;
    const method = request.method;
    response.on("finish", () => {
      console.timeEnd("Request-response time");
    })
    const bodySize = Buffer.byteLength(JSON.stringify(request.body)); 

    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode; 
        console.log(
          `[${method}] ${statusCode} ${url} - Body Size: ${bodySize} bytes - `
        );
        // console.timeEnd("Request-response time");
      }),
    );
  }
}
