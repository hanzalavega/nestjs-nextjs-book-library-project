"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BorrowDialog } from "@/components/borrow-dialog";
import {
  BookFormDialog,
  DeleteBookButton,
} from "@/components/book-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Author, Book, Category } from "@/lib/library";

export function BooksGrid({
  books,
  categories,
  authors,
}: {
  books: Book[];
  categories: Category[];
  authors: Author[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const visibleBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          (category === "all" || book.category.slug === category) &&
          `${book.title} ${book.author.name}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [books, category, search],
  );

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search by title or author..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select
          aria-label="Filter by category"
          className="h-10 rounded-md border bg-white px-3 text-sm sm:w-56"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <BookFormDialog authors={authors} categories={categories} />
        <BorrowDialog books={books} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleBooks.map((book) => (
          <article
            key={book.id}
            className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
              ) : (
                <BookOpen className="h-14 w-14 text-slate-300" />
              )}
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700">
                {book.category.name}
              </span>
            </div>
            <div className="p-4">
              <h2 className="line-clamp-1 font-semibold text-slate-950">
                {book.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{book.author.name}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-medium ${
                    book.availableQuantity ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {book.availableQuantity
                    ? `${book.availableQuantity} of ${book.quantity} available`
                    : "Unavailable"}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/books/${book.id}`}>Details</Link>
                  </Button>
                  <BookFormDialog
                    authors={authors}
                    categories={categories}
                    book={book}
                  />
                  <DeleteBookButton book={book} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {visibleBooks.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-white py-16 text-center text-sm text-slate-500">
          No books match this search.
        </div>
      )}
    </>
  );
}
