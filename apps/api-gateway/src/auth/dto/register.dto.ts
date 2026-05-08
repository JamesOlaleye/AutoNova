import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'admin@freshautosworld.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin1234!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Fresh' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Admin' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
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
