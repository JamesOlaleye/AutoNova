import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @ApiProperty({ description: 'Customer full name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Customer email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Customer phone in E.164 format e.g. +2348012345678' })
  @IsString()
  phone: string;

  @ApiProperty({ enum: ['INQUIRY', 'TEST_DRIVE', 'TRADE_IN', 'FINANCING'] })
  @IsEnum(['INQUIRY', 'TEST_DRIVE', 'TRADE_IN', 'FINANCING'])
  type: string;

  @ApiPropertyOptional({ description: 'Customer message or enquiry details' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'UUID of the vehicle this lead is about' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'UUID of an existing customer record' })
  @IsOptional()
  @IsString()
  customerId?: string;
}
