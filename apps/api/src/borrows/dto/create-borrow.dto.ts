import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional } from 'class-validator';

export class CreateBorrowDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  studentId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  bookId: number;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueAt?: Date;
}
