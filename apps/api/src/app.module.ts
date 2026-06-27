import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthorsModule } from './authors/authors.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StudentsModule } from './students/students.module.js';
import { BooksModule } from './books/books.module.js';
import { BorrowsModule } from './borrows/borrows.module.js';

@Module({
  imports: [
    PrismaModule,
    StudentsModule,
    AuthorsModule,
    CategoriesModule,
    BooksModule,
    BorrowsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
