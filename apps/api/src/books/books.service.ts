import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

const bookInclude = { author: true, category: true } as const;

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(dto: CreateBookDto, cover?: Express.Multer.File) {
    try {
      const coverData = await this.getCoverData(cover);
      return await this.prisma.book.create({
        data: { ...dto, ...coverData, availableQuantity: dto.quantity },
        include: bookInclude,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  findAll(search?: string, category?: string) {
    return this.prisma.book.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                {
                  author: {
                    name: { contains: search, mode: 'insensitive' as const },
                  },
                },
              ],
            }
          : {}),
        ...(category ? { category: { slug: category } } : {}),
      },
      include: bookInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        ...bookInclude,
        borrows: {
          include: { student: true },
          orderBy: { borrowedAt: 'desc' },
        },
      },
    });
    if (!book) throw new NotFoundException(`Book with id ${id} was not found`);
    return book;
  }

  async update(id: number, dto: UpdateBookDto, cover?: Express.Multer.File) {
    const book = await this.findOne(id);
    const borrowedCopies = book.quantity - book.availableQuantity;
    if (dto.quantity !== undefined && dto.quantity < borrowedCopies) {
      throw new BadRequestException(
        `Quantity cannot be below ${borrowedCopies}; those copies are borrowed`,
      );
    }
    try {
      const coverData = await this.getCoverData(cover);
      const updatedBook = await this.prisma.book.update({
        where: { id },
        data: {
          ...dto,
          ...coverData,
          ...(dto.quantity !== undefined
            ? { availableQuantity: dto.quantity - borrowedCopies }
            : {}),
        },
        include: bookInclude,
      });
      if (cover && book.coverPublicId) {
        await this.cloudinary.deleteImage(book.coverPublicId);
      }
      return updatedBook;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: number) {
    const book = await this.findOne(id);
    try {
      await this.prisma.book.delete({ where: { id } });
      if (book.coverPublicId) {
        await this.cloudinary.deleteImage(book.coverPublicId);
      }
      return { message: 'Book deleted successfully' };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Books with borrow history cannot be deleted',
        );
      }
      throw error;
    }
  }

  private handleError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('A book with this ISBN already exists');
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new BadRequestException('Author or category was not found');
    }
    throw error;
  }

  private async getCoverData(cover?: Express.Multer.File) {
    if (!cover) return {};
    const uploaded = await this.cloudinary.uploadImage(cover);
    return {
      coverUrl: uploaded.secureUrl,
      coverPublicId: uploaded.publicId,
    };
  }
}
