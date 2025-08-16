import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class MicroserviceErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MicroserviceErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {

        if (err instanceof HttpException) {
          return throwError(() => err);
        }

        this.logger.error(
          'Error from microservice is being transformed:',
          JSON.stringify(err),
        );

        const error = err instanceof RpcException ? err.getError() : err;



        const message =
          typeof error === 'object' && error.message
            ? error.message
            : 'An unexpected error occurred in the microservice.';

        return throwError(() => new HttpException(message, HttpStatus.BAD_REQUEST));
      }),
    );
  }
}