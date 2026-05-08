import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'UUID of the vehicle being sold' })
  @IsString()
  vehicleId: string;

  @ApiProperty({ description: 'UUID of the customer' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ description: 'UUID of the originating lead' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ description: 'UUID of the assigned sales agent' })
  @IsOptional()
  @IsString()
  salesAgentId?: string;

  @ApiProperty({ enum: ['PURCHASE', 'FINANCING', 'LEASE'] })
  @IsEnum(['PURCHASE', 'FINANCING', 'LEASE'])
  type: string;

  @ApiProperty({ description: 'Agreed sale price in smallest currency unit' })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty({ description: 'ISO 4217 currency code e.g. NGN, GBP' })
  @IsString()
  currency: string;

  @ApiPropertyOptional({ description: 'Down payment amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number;

  @ApiPropertyOptional({ description: 'Financing term in months' })
  @IsOptional()
  @IsNumber()
  financingTerm?: number;

  @ApiPropertyOptional({ description: 'Internal notes for the deal' })
  @IsOptional()
  @IsString()
  notes?: string;
}
