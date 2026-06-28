import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createStudentDto: CreateStudentDto,
    photo?: Express.Multer.File,
  ) {
    try {
      const photoData = await this.getPhotoData(photo);

      const student = await this.prisma.student.create({
        data: {
          ...createStudentDto,
          ...photoData,
        },
      });

      await this.mailService.sendStudentCreatedEmail(student);

      return student;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll() {
    return this.prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        borrows: {
          include: {
            book: {
              include: { author: true, category: true },
            },
          },
          orderBy: { borrowedAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} was not found`);
    }

    return student;
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
    photo?: Express.Multer.File,
  ) {
    await this.findOne(id);

    try {
      const photoData = await this.getPhotoData(photo);

      return await this.prisma.student.update({
        where: { id },
        data: {
          ...updateStudentDto,
          ...photoData,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.student.delete({
      where: { id },
    });

    return { message: 'Student deleted successfully' };
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('A student with this email already exists');
    }

    throw error;
  }

  private async getPhotoData(photo?: Express.Multer.File) {
    if (!photo) {
      return {};
    }

    const uploadedPhoto = await this.cloudinaryService.uploadImage(photo);

    return {
      photoUrl: uploadedPhoto.secureUrl,
      photoPublicId: uploadedPhoto.publicId,
    };
  }
}
