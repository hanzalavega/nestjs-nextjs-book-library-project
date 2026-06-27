"use client";

import { useEffect, useState } from "react";
import { BookOpenCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL, type Book, type Student } from "@/lib/library";

export function BorrowDialog({
  books,
  initialBookId,
}: {
  books: Book[];
  initialBookId?: number;
}) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [bookId, setBookId] = useState(initialBookId?.toString() ?? "");
  const [studentSearch, setStudentSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || students.length) return;
    fetch(`${API_URL}/students`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load students");
        return response.json();
      })
      .then(setStudents)
      .catch(() => toast.error("Could not load students"));
  }, [open, students.length]);

  const matchingStudents = students.filter((student) =>
    `${student.name} ${student.email}`
      .toLowerCase()
      .includes(studentSearch.toLowerCase()),
  );
  const matchingBooks = books.filter((book) =>
    `${book.title} ${book.author.name}`
      .toLowerCase()
      .includes(bookSearch.toLowerCase()),
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!studentId || !bookId) {
      toast.error("Select both a student and a book");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/borrows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: Number(studentId),
          bookId: Number(bookId),
          ...(dueAt ? { dueAt: new Date(`${dueAt}T23:59:59`).toISOString() } : {}),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message ?? "Could not borrow book");
      toast.success("Borrow created successfully");
      setOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not borrow book");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <BookOpenCheck className="h-4 w-4" />
          New borrow
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Create borrow record</DialogTitle>
            <DialogDescription>
              Select a student and an available book. A PDF receipt is emailed
              after the record is saved.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="student-search">Student</Label>
              <Input
                id="student-search"
                placeholder="Search name or email"
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
              />
              <select
                className="h-10 rounded-md border bg-white px-3 text-sm"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                required
              >
                <option value="">Select student</option>
                {matchingStudents.map((student) => (
                  <option value={student.id} key={student.id}>
                    {student.name} — {student.email}
                  </option>
                ))}
              </select>
            </div>
            {!initialBookId && (
              <div className="grid gap-2">
                <Label htmlFor="book-search">Book</Label>
                <Input
                  id="book-search"
                  placeholder="Search title or author"
                  value={bookSearch}
                  onChange={(event) => setBookSearch(event.target.value)}
                />
                <select
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                  value={bookId}
                  onChange={(event) => setBookId(event.target.value)}
                  required
                >
                  <option value="">Select book</option>
                  {matchingBooks.map((book) => (
                    <option
                      value={book.id}
                      key={book.id}
                      disabled={book.availableQuantity === 0}
                    >
                      {book.title} ({book.availableQuantity} available)
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="due-date">Due date (optional)</Label>
              <Input
                id="due-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={dueAt}
                onChange={(event) => setDueAt(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm borrow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
