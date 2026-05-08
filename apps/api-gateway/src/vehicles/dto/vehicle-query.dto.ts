import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class VehicleQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by manufacturer e.g. Toyota' })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ description: 'Filter by model e.g. Camry' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Minimum manufacture year', minimum: 1900 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  yearMin?: number;

  @ApiPropertyOptional({ description: 'Maximum manufacture year' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  yearMax?: number;

  @ApiPropertyOptional({ description: 'Minimum price in smallest currency unit' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({ description: 'Maximum price in smallest currency unit' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  @ApiPropertyOptional({ enum: ['NEW', 'USED', 'CERTIFIED_USED'] })
  @IsOptional()
  @IsEnum(['NEW', 'USED', 'CERTIFIED_USED'])
  condition?: string;

  @ApiPropertyOptional({ enum: ['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC'] })
  @IsOptional()
  @IsEnum(['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC'])
  transmission?: string;

  @ApiPropertyOptional({ enum: ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'CNG'] })
  @IsOptional()
  @IsEnum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'CNG'])
  fuelType?: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD'], default: 'AVAILABLE' })
  @IsOptional()
  @IsEnum(['DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD'])
  status?: string;
}
