import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly books: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a book' })
  @UseInterceptors(
    FileInterceptor('cover', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Cover must be an image'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  create(
    @Body() dto: CreateBookDto,
    @UploadedFile() cover?: Express.Multer.File,
  ) {
    return this.books.create(dto, cover);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter books' })
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.books.findAll(search, category);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.books.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('cover', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Cover must be an image'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
    @UploadedFile() cover?: Express.Multer.File,
  ) {
    return this.books.update(id, dto, cover);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.books.remove(id);
  }
}
