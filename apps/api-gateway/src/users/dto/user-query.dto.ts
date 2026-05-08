import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class UserQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'CUSTOMER'] })
  @IsOptional()
  @IsEnum(['DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'CUSTOMER'])
  role?: string;
}
