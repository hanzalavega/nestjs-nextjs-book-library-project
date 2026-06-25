import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthorsService } from './authors.service.js';
import { CreateAuthorDto } from './dto/create-author.dto.js';
import { UpdateAuthorDto } from './dto/update-author.dto.js';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an author' })
  @ApiCreatedResponse({ description: 'Author created successfully' })
  @ApiConflictResponse({ description: 'Email already exists' })
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all authors' })
  @ApiOkResponse({ description: 'Authors fetched successfully' })
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single author' })
  @ApiOkResponse({ description: 'Author fetched successfully' })
  @ApiNotFoundResponse({ description: 'Author not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an author' })
  @ApiOkResponse({ description: 'Author updated successfully' })
  @ApiConflictResponse({ description: 'Email already exists' })
  @ApiNotFoundResponse({ description: 'Author not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an author' })
  @ApiOkResponse({ description: 'Author deleted successfully' })
  @ApiNotFoundResponse({ description: 'Author not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.remove(id);
  }
}
