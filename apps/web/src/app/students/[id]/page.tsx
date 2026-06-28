"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Borrow = {
  id: number;
  borrowedAt: string;
  dueAt: string | null;
  returnedAt: string | null;
  book: {
    id: number;
    title: string;
    coverUrl: string | null;
    author: { name: string };
    category: { name: string };
  };
};

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  photoUrl: string | null;
  borrows: Borrow[];
};

function borrowStatus(borrow: Borrow) {
  if (borrow.returnedAt) {
    return {
      label: "Returned",
      className: "bg-emerald-50 text-emerald-700",
    };
  }
  if (borrow.dueAt && new Date(borrow.dueAt).getTime() < Date.now()) {
    return { label: "Overdue", className: "bg-rose-50 text-rose-700" };
  }
  return { label: "Borrowed", className: "bg-amber-50 text-amber-800" };
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Not set";
}

export default function StudentDetailsPage() {
  const params = useParams<{ id: string }>();
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    [],
  );
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [returningId, setReturningId] = useState<number | null>(null);

  const fetchStudent = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/students/${params.id}`);
      if (!response.ok) throw new Error("Could not fetch student");
      setStudent((await response.json()) as Student);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not fetch student",
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, params.id]);

  useEffect(() => {
    queueMicrotask(() => void fetchStudent());
  }, [fetchStudent]);

  async function returnBook(borrow: Borrow) {
    if (!window.confirm(`Mark “${borrow.book.title}” as returned?`)) return;
    setReturningId(borrow.id);
    try {
      const response = await fetch(`${apiUrl}/borrows/${borrow.id}/return`, {
        method: "PATCH",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? "Could not return book");
      }
      toast.success("Book returned and availability restored");
      await fetchStudent();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not return book",
      );
    } finally {
      setReturningId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading student
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Student details</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {student?.name ?? "Student"}
            </h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/students">
              <ArrowLeft className="h-4 w-4" /> Students
            </Link>
          </Button>
        </div>

        {student ? (
          <>
            <div className="rounded-xl border bg-white p-6">
              <div className="flex flex-col gap-6 sm:flex-row">
                {student.photoUrl ? (
                  <Image
                    src={student.photoUrl}
                    alt={student.name}
                    width={160}
                    height={160}
                    className="h-40 w-40 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                    No photo
                  </div>
                )}
                <dl className="grid flex-1 gap-4 text-sm sm:grid-cols-2">
                  {[
                    ["Name", student.name],
                    ["Email", student.email],
                    ["Phone", student.phone || "—"],
                    ["Department", student.department || "—"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="font-medium text-slate-500">{label}</dt>
                      <dd className="mt-1">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <div>
                <h2 className="text-xl font-semibold">Borrow history</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {student.borrows.length} total borrow record
                  {student.borrows.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="mt-5 grid gap-4">
                {student.borrows.length ? (
                  student.borrows.map((borrow) => {
                    const status = borrowStatus(borrow);
                    return (
                      <article
                        key={borrow.id}
                        className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row"
                      >
                        <Link
                          href={`/books/${borrow.book.id}`}
                          className="relative flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100"
                        >
                          {borrow.book.coverUrl ? (
                            <Image
                              src={borrow.book.coverUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <BookOpen className="h-8 w-8 text-slate-300" />
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <Link
                                href={`/books/${borrow.book.id}`}
                                className="font-semibold hover:underline"
                              >
                                {borrow.book.title}
                              </Link>
                              <p className="mt-1 text-sm text-slate-500">
                                {borrow.book.author.name} ·{" "}
                                {borrow.book.category.name}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                            <p className="flex items-center gap-1.5">
                              <CalendarDays className="h-4 w-4" />
                              Borrowed: {formatDate(borrow.borrowedAt)}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Clock3 className="h-4 w-4" />
                              Due: {formatDate(borrow.dueAt)}
                            </p>
                            {borrow.returnedAt && (
                              <p className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4" />
                                Returned: {formatDate(borrow.returnedAt)}
                              </p>
                            )}
                          </div>
                          {!borrow.returnedAt && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-4"
                              disabled={returningId === borrow.id}
                              onClick={() => void returnBook(borrow)}
                            >
                              {returningId === borrow.id && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                              Mark as returned
                            </Button>
                          )}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed py-12 text-center text-sm text-slate-500">
                    This student has not borrowed any books yet.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">
            Student not found.
          </div>
        )}
      </section>
    </main>
  );
}
