import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class LeadQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'] })
  @IsOptional()
  @IsEnum(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'])
  status?: string;

  @ApiPropertyOptional({ enum: ['INQUIRY', 'TEST_DRIVE', 'TRADE_IN', 'FINANCING'] })
  @IsOptional()
  @IsEnum(['INQUIRY', 'TEST_DRIVE', 'TRADE_IN', 'FINANCING'])
  type?: string;

  @ApiPropertyOptional({ description: 'UUID of assigned staff member' })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}
