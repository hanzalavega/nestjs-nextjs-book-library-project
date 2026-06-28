import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BorrowsService } from './borrows.service.js';
import { CreateBorrowDto } from './dto/create-borrow.dto.js';

@ApiTags('Borrows')
@Controller('borrows')
export class BorrowsController {
  constructor(private readonly borrows: BorrowsService) {}

  @Post()
  @ApiOperation({ summary: 'Borrow a book and email a PDF receipt' })
  create(@Body() dto: CreateBorrowDto) {
    return this.borrows.create(dto);
  }

  @Get()
  findAll() {
    return this.borrows.findAll();
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Return a borrowed book and restore its stock' })
  returnBook(@Param('id', ParseIntPipe) id: number) {
    return this.borrows.returnBook(id);
  }
}
