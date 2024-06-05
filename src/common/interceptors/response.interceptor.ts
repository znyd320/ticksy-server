import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data) => this.handleResponse(data, context)),
      catchError((error) => this.handleError(error, context)),
    );
  }

  private handleResponse(data: any, context: ExecutionContext) {
    const statusCode: number =
      data?.statusCode || context.switchToHttp().getResponse().statusCode;

    context.switchToHttp().getResponse().statusCode = statusCode;
    return data;
  }

  private handleError(error: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      error instanceof HttpException
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      success: false,
      error: this.formatError(error),
    };

    response.status(status).json(responseBody);
    return throwError(() => new HttpException(responseBody, status));
  }

  private formatError(error: any) {
    if (error instanceof HttpException) {
      return error.getResponse();
    }

    const errorResponse = {
      message: error.message || 'An unexpected error occurred',
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse['stack'] = error.stack;
    }

    return errorResponse;
  }
}
