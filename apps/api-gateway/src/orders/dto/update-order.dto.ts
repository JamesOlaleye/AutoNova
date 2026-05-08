import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateOrderDto {
  @ApiPropertyOptional({ enum: ['PENDING', 'NEGOTIATING', 'FINANCED', 'COMPLETED', 'CANCELLED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'NEGOTIATING', 'FINANCED', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({ description: 'UUID of the assigned sales agent' })
  @IsOptional()
  @IsString()
  salesAgentId?: string;

  @ApiPropertyOptional({ description: 'Revised sale price in smallest currency unit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

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
