import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password — minimum 8 characters', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Phone number in E.164 format e.g. +2348012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    enum: ['DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'CUSTOMER'],
    default: 'DEALER_ADMIN',
  })
  @IsOptional()
  @IsEnum(['DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'CUSTOMER', 'PLATFORM_ADMIN'])
  role?: string;
}
