import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';

const TCP_TIMEOUT_MS = 10_000;

export abstract class BaseGatewayService {
  private readonly logger = new Logger(this.constructor.name);

  protected async send<T>(
    client: ClientProxy,
    pattern: string,
    payload: unknown,
  ): Promise<T> {
    try {
      return await firstValueFrom(
        client.send<T>(pattern, payload).pipe(timeout(TCP_TIMEOUT_MS)),
      );
    } catch (err) {
      if (err instanceof TimeoutError) {
        this.logger.error(`Timeout calling pattern: ${pattern}`);
        throw new HttpException(
          'Service temporarily unavailable — please try again',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const error = err?.error ?? err;
      const status: number = error?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const message: string = error?.message ?? 'Internal server error';

      this.logger.error(`RPC call failed [${pattern}]: ${message} (${status})`);
      throw new HttpException(message, status);
    }
  }
}
