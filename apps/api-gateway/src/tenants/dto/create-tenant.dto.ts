import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Fresh Autos World' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'freshautosworld', description: 'URL slug — immutable after creation' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'NG', description: 'ISO 3166-1 alpha-2 country code' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'NGN', description: 'ISO 4217 currency code' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'en-NG' })
  @IsString()
  locale: string;

  @ApiProperty({ example: 'info@freshautosworld.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['STARTER', 'GROWTH', 'PRO'], default: 'STARTER' })
  @IsOptional()
  @IsEnum(['STARTER', 'GROWTH', 'PRO'])
  plan?: string;
}
