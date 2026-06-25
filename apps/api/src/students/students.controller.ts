import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { StudentsService } from './students.service.js';
import type {} from 'multer';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a student' })
  @ApiCreatedResponse({ description: 'Student created successfully' })
  @ApiConflictResponse({ description: 'Email already exists' })
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.studentsService.create(createStudentDto, photo);
  }

  @Get()
  @ApiOperation({ summary: 'Get all students' })
  @ApiOkResponse({ description: 'Students fetched successfully' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single student' })
  @ApiOkResponse({ description: 'Student fetched successfully' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student' })
  @ApiOkResponse({ description: 'Student updated successfully' })
  @ApiConflictResponse({ description: 'Email already exists' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.studentsService.update(id, updateStudentDto, photo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student' })
  @ApiOkResponse({ description: 'Student deleted successfully' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}
