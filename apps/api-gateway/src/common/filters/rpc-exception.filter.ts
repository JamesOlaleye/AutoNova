import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const error = exception.getError() as any;

    const statusCode =
      typeof error === 'object' && error?.statusCode
        ? error.statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      typeof error === 'object' && error?.message
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Internal server error';

    this.logger.error(`RPC Error [${statusCode}]: ${message}`);

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
