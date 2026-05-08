import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTenantDto {
  @ApiPropertyOptional({ description: 'Dealership display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country code e.g. NG, GB' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'ISO 4217 currency code e.g. NGN, GBP' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Locale code e.g. en-NG, en-GB' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ description: 'Dealership contact email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone in E.164 format e.g. +2348012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Physical address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Logo image URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ enum: ['STARTER', 'GROWTH', 'PRO'] })
  @IsOptional()
  @IsEnum(['STARTER', 'GROWTH', 'PRO'])
  plan?: string;
}
