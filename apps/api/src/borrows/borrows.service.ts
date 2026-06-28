import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBorrowDto } from './dto/create-borrow.dto.js';

@Injectable()
export class BorrowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateBorrowDto) {
    const [student, book] = await Promise.all([
      this.prisma.student.findUnique({ where: { id: dto.studentId } }),
      this.prisma.book.findUnique({
        where: { id: dto.bookId },
        include: { author: true },
      }),
    ]);
    if (!student) throw new NotFoundException('Student was not found');
    if (!book) throw new NotFoundException('Book was not found');
    if (book.availableQuantity < 1) {
      throw new BadRequestException('This book is currently unavailable');
    }
    if (dto.dueAt && dto.dueAt <= new Date()) {
      throw new BadRequestException('Due date must be in the future');
    }

    const borrow = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.book.updateMany({
        where: { id: book.id, availableQuantity: { gt: 0 } },
        data: { availableQuantity: { decrement: 1 } },
      });
      if (updated.count === 0) {
        throw new BadRequestException('This book is currently unavailable');
      }
      return tx.borrow.create({
        data: dto,
        include: { student: true, book: { include: { author: true } } },
      });
    });

    await this.mail.sendBorrowConfirmationEmail(borrow);
    return borrow;
  }

  findAll() {
    return this.prisma.borrow.findMany({
      include: { student: true, book: true },
      orderBy: { borrowedAt: 'desc' },
    });
  }

  async returnBook(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const borrow = await tx.borrow.findUnique({ where: { id } });
      if (!borrow) {
        throw new NotFoundException(
          `Borrow record with id ${id} was not found`,
        );
      }
      if (borrow.returnedAt) {
        throw new BadRequestException('This book has already been returned');
      }

      const returnedAt = new Date();
      const claimed = await tx.borrow.updateMany({
        where: { id, returnedAt: null },
        data: { returnedAt },
      });
      if (claimed.count === 0) {
        throw new BadRequestException('This book has already been returned');
      }

      await tx.book.update({
        where: { id: borrow.bookId },
        data: { availableQuantity: { increment: 1 } },
      });

      return tx.borrow.findUnique({
        where: { id },
        include: {
          student: true,
          book: { include: { author: true, category: true } },
        },
      });
    });
  }
}
