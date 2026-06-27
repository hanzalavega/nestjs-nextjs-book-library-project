CREATE TABLE "Book" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "isbn" TEXT,
  "description" TEXT,
  "coverUrl" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "availableQuantity" INTEGER NOT NULL DEFAULT 1,
  "authorId" INTEGER NOT NULL,
  "categoryId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Borrow" (
  "id" SERIAL NOT NULL,
  "studentId" INTEGER NOT NULL,
  "bookId" INTEGER NOT NULL,
  "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueAt" TIMESTAMP(3),
  "returnedAt" TIMESTAMP(3),
  CONSTRAINT "Borrow_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
CREATE INDEX "Book_authorId_idx" ON "Book"("authorId");
CREATE INDEX "Book_categoryId_idx" ON "Book"("categoryId");
CREATE INDEX "Borrow_studentId_idx" ON "Borrow"("studentId");
CREATE INDEX "Borrow_bookId_idx" ON "Borrow"("bookId");
ALTER TABLE "Book" ADD CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Book" ADD CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Borrow" ADD CONSTRAINT "Borrow_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Borrow" ADD CONSTRAINT "Borrow_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
