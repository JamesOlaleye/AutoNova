import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  phone: string;

  @ApiProperty({ enum: ['INQUIRY', 'TEST_DRIVE', 'TRADE_IN', 'FINANCING'], example: 'INQUIRY' })
  @IsEnum(['INQUIRY', 'TEST_DRIVE', 'TRADE_IN', 'FINANCING'])
  type: string;

  @ApiPropertyOptional({ example: 'Interested in the Toyota Camry listing' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'UUID of the vehicle the lead is about' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'UUID of an existing customer record' })
  @IsOptional()
  @IsString()
  customerId?: string;
}
