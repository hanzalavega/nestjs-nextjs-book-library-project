import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAuthorDto } from './dto/create-author.dto.js';
import { UpdateAuthorDto } from './dto/update-author.dto.js';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto) {
    try {
      return await this.prisma.author.create({
        data: createAuthorDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll() {
    return this.prisma.author.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const author = await this.prisma.author.findUnique({
      where: { id },
    });

    if (!author) {
      throw new NotFoundException(`Author with id ${id} was not found`);
    }

    return author;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    await this.findOne(id);

    try {
      return await this.prisma.author.update({
        where: { id },
        data: updateAuthorDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.author.delete({
      where: { id },
    });

    return { message: 'Author deleted successfully' };
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('An author with this email already exists');
    }

    throw error;
  }
}
