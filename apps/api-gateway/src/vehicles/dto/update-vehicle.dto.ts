import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateVehicleDto } from './create-vehicle.dto';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @ApiPropertyOptional({ enum: ['DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD'], description: 'Follow lifecycle: DRAFT → AVAILABLE → RESERVED → SOLD' })
  @IsOptional()
  @IsEnum(['DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD'])
  status?: string;
}
