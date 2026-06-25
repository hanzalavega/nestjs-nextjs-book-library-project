import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Humayun Ahmed' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'humayun@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Bangladeshi novelist and filmmaker.' })
  @IsOptional()
  @IsString()
  bio?: string;
}
