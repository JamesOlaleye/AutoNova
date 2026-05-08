import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class OrderQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['PENDING', 'NEGOTIATING', 'FINANCED', 'COMPLETED', 'CANCELLED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'NEGOTIATING', 'FINANCED', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({ enum: ['PURCHASE', 'FINANCING', 'LEASE'] })
  @IsOptional()
  @IsEnum(['PURCHASE', 'FINANCING', 'LEASE'])
  type?: string;
}
