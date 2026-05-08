import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ description: 'Dealership display name e.g. Fresh Autos World' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL slug — immutable after creation e.g. freshautosworld' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code e.g. NG, GB, US' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'ISO 4217 currency code e.g. NGN, GBP, USD' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Locale code e.g. en-NG, en-GB' })
  @IsString()
  locale: string;

  @ApiProperty({ description: 'Dealership contact email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Dealership phone in E.164 format e.g. +2348012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['STARTER', 'GROWTH', 'PRO'], default: 'STARTER' })
  @IsOptional()
  @IsEnum(['STARTER', 'GROWTH', 'PRO'])
  plan?: string;
}
