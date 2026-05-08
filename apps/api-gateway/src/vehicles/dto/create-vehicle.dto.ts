import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Vehicle manufacturer e.g. Toyota, Honda' })
  @IsString()
  make: string;

  @ApiProperty({ description: 'Model name e.g. Camry, Corolla' })
  @IsString()
  model: string;

  @ApiProperty({ description: 'Manufacturing year e.g. 2022', minimum: 1900 })
  @IsNumber()
  @Min(1900)
  year: number;

  @ApiProperty({ description: 'Asking price in the smallest currency unit e.g. 15000000 for NGN' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'ISO 4217 currency code e.g. NGN, GBP' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Odometer reading' })
  @IsNumber()
  @Min(0)
  mileage: number;

  @ApiPropertyOptional({ enum: ['KM', 'MILES'], default: 'KM' })
  @IsOptional()
  @IsEnum(['KM', 'MILES'])
  mileageUnit?: string;

  @ApiProperty({ enum: ['NEW', 'USED', 'CERTIFIED_USED'] })
  @IsEnum(['NEW', 'USED', 'CERTIFIED_USED'])
  condition: string;

  @ApiProperty({ enum: ['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC'] })
  @IsEnum(['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC'])
  transmission: string;

  @ApiProperty({ enum: ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'CNG'] })
  @IsEnum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'CNG'])
  fuelType: string;

  @ApiPropertyOptional({ enum: ['RHD', 'LHD'], default: 'RHD' })
  @IsOptional()
  @IsEnum(['RHD', 'LHD'])
  driveType?: string;

  @ApiProperty({ description: 'Exterior colour e.g. White, Black, Silver' })
  @IsString()
  color: string;

  @ApiPropertyOptional({ description: 'Vehicle Identification Number (17 characters)' })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({ description: 'Engine displacement e.g. 2.5L, 1600cc' })
  @IsOptional()
  @IsString()
  engineSize?: string;

  @ApiPropertyOptional({ description: 'Detailed vehicle description for the listing' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Array of feature strings e.g. ["Leather seats", "Sunroof"]' })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ description: 'Array of Cloudinary image URLs' })
  @IsOptional()
  images?: string[];
}
