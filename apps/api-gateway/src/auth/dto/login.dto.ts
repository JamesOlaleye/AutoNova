import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Registered email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Account password' })
  @IsString()
  password: string;
}
