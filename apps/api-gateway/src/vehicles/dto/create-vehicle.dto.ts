import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  make: string;

  @ApiProperty({ example: 'Camry' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2022 })
  @IsNumber()
  @Min(1900)
  year: number;

  @ApiProperty({ example: 15000000, description: 'Price in the smallest currency unit' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'NGN', description: 'ISO 4217 currency code' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  @Min(0)
  mileage: number;

  @ApiPropertyOptional({ enum: ['KM', 'MILES'], default: 'KM' })
  @IsOptional()
  @IsEnum(['KM', 'MILES'])
  mileageUnit?: string;

  @ApiProperty({ enum: ['NEW', 'USED', 'CERTIFIED_USED'], example: 'USED' })
  @IsEnum(['NEW', 'USED', 'CERTIFIED_USED'])
  condition: string;

  @ApiProperty({ enum: ['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC'], example: 'AUTOMATIC' })
  @IsEnum(['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC'])
  transmission: string;

  @ApiProperty({ enum: ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'CNG'], example: 'PETROL' })
  @IsEnum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'CNG'])
  fuelType: string;

  @ApiPropertyOptional({ enum: ['RHD', 'LHD'], default: 'RHD' })
  @IsOptional()
  @IsEnum(['RHD', 'LHD'])
  driveType?: string;

  @ApiProperty({ example: 'White' })
  @IsString()
  color: string;

  @ApiPropertyOptional({ example: '1HGBH41JXMN109186' })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({ example: '2.5L' })
  @IsOptional()
  @IsString()
  engineSize?: string;

  @ApiPropertyOptional({ example: 'Well maintained Toyota Camry in excellent condition.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['Leather seats', 'Sunroof', 'Reverse camera'] })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  images?: string[];
}
