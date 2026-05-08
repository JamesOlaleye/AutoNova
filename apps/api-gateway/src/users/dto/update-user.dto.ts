import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Phone in E.164 format e.g. +2348012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'CUSTOMER'] })
  @IsOptional()
  @IsEnum(['DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'CUSTOMER'])
  role?: string;
}
