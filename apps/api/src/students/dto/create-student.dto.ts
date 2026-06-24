import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'Ayesha Rahman' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'ayesha@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+8801712345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  department?: string;
}
