import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ enum: ['STARTER', 'GROWTH', 'PRO'], description: 'Subscription plan to purchase' })
  @IsEnum(['STARTER', 'GROWTH', 'PRO'])
  plan: string;

  @ApiProperty({ enum: ['STRIPE', 'PAYSTACK'], description: 'Payment gateway to use' })
  @IsEnum(['STRIPE', 'PAYSTACK'])
  gateway: string;

  @ApiProperty({ description: 'Billing email for the Stripe/Paystack customer' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'ISO 4217 currency code (e.g. USD, GBP, NGN)' })
  @IsString()
  currency: string;
}
