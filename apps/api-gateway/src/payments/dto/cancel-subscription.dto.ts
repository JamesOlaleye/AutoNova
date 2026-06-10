import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class CancelSubscriptionDto {
  @ApiProperty({ enum: ['STRIPE', 'PAYSTACK'], description: 'Gateway the subscription was created on' })
  @IsEnum(['STRIPE', 'PAYSTACK'])
  gateway: string;
}
