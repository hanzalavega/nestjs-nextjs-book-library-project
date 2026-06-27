import { ArrowLeft, BookOpen, CalendarDays, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BorrowDialog } from "@/components/borrow-dialog";
import { Button } from "@/components/ui/button";
import { API_URL, type Book } from "@/lib/library";

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await fetch(`${API_URL}/books/${id}`, { cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Could not load book");
  const book = (await response.json()) as Book;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Back to catalogue
          </Link>
        </Button>
        <div className="grid gap-8 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-[240px_1fr]">
          <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-slate-100">
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt="" fill className="object-cover" />
            ) : (
              <BookOpen className="h-20 w-20 text-slate-300" />
            )}
          </div>
          <div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              {book.category.name}
            </span>
            <h1 className="mt-4 text-3xl font-bold">{book.title}</h1>
            <p className="mt-2 text-lg text-slate-500">by {book.author.name}</p>
            <p className="mt-5 leading-7 text-slate-600">
              {book.description || "No description has been added yet."}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm">
              <div>
                <dt className="text-slate-500">Availability</dt>
                <dd className="mt-1 font-semibold">
                  {book.availableQuantity} / {book.quantity} copies
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">ISBN</dt>
                <dd className="mt-1 font-semibold">{book.isbn || "—"}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <BorrowDialog books={[book]} initialBookId={book.id} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Borrow history</h2>
          <p className="mt-1 text-sm text-slate-500">
            Students who borrowed this title so far.
          </p>
          <div className="mt-5 divide-y">
            {book.borrows?.length ? (
              book.borrows.map((borrow) => (
                <div
                  key={borrow.id}
                  className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{borrow.student.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <Mail className="h-3.5 w-3.5" />
                      {borrow.student.email}
                    </p>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(borrow.borrowedAt).toLocaleDateString()}
                    {borrow.returnedAt ? " · Returned" : " · On loan"}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-8 text-sm text-slate-500">
                No one has borrowed this book yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
