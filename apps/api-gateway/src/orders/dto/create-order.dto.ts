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

  @ApiProperty({ enum: ['PURCHASE', 'FINANCING', 'LEASE'], example: 'PURCHASE' })
  @IsEnum(['PURCHASE', 'FINANCING', 'LEASE'])
  type: string;

  @ApiProperty({ example: 14500000 })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty({ example: 'NGN' })
  @IsString()
  currency: string;

  @ApiPropertyOptional({ example: 2000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number;

  @ApiPropertyOptional({ example: 24, description: 'Financing term in months' })
  @IsOptional()
  @IsNumber()
  financingTerm?: number;

  @ApiPropertyOptional({ example: 'Customer requests delivery by end of month.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
