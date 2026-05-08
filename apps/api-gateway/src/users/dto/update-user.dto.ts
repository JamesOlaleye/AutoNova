import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Fresh' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Admin' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'CUSTOMER'] })
  @IsOptional()
  @IsEnum(['DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'CUSTOMER'])
  role?: string;
}
