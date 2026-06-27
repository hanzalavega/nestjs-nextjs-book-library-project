import { BooksGrid } from "@/components/books-grid";
import { getAuthors, getBooks, getCategories } from "@/lib/library";

export default async function HomePage() {
  const [books, categories, authors] = await Promise.all([
    getBooks(),
    getCategories(),
    getAuthors(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-7">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
            Librarian workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Books catalogue
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Find books, check stock, review borrowing history, and issue a copy
            to a student.
          </p>
        </div>
        <BooksGrid books={books} categories={categories} authors={authors} />
      </section>
    </main>
  );
}
