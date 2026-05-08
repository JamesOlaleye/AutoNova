import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'] })
  @IsOptional()
  @IsEnum(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'])
  status?: string;

  @ApiPropertyOptional({ description: 'UUID of the staff member this lead is assigned to' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ example: 'Customer is very interested, follow up Friday.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
