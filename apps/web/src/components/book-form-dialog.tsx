"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import {
  API_URL,
  type Author,
  type Book,
  type Category,
} from "@/lib/library";

export function BookFormDialog({
  authors,
  categories,
  book,
}: {
  authors: Author[];
  categories: Category[];
  book?: Book;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cover, setCover] = useState<File | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (!cover) formData.delete("cover");
    for (const optionalField of ["isbn", "description"]) {
      if (!formData.get(optionalField)) formData.delete(optionalField);
    }
    setSaving(true);
    try {
      const response = await fetch(
        book ? `${API_URL}/books/${book.id}` : `${API_URL}/books`,
        {
          method: book ? "PATCH" : "POST",
          body: formData,
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? "Could not save book");
      }
      toast.success(book ? "Book updated" : "Book created");
      setOpen(false);
      setCover(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save book");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {book ? (
          <Button size="icon" variant="outline" aria-label={`Edit ${book.title}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Add book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{book ? "Edit book" : "Add a book"}</DialogTitle>
            <DialogDescription>
              Add catalogue details and upload a cover image to Cloudinary.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 grid gap-4">
            {(!authors.length || !categories.length) && (
              <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                Create at least one author and category before adding a book.
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor={`title-${book?.id ?? "new"}`}>Title</Label>
              <Input
                id={`title-${book?.id ?? "new"}`}
                name="title"
                defaultValue={book?.title}
                minLength={2}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Author</Label>
                <select
                  name="authorId"
                  defaultValue={book?.author.id ?? ""}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                  required
                >
                  <option value="" disabled>Select author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <select
                  name="categoryId"
                  defaultValue={book?.category.id ?? ""}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>ISBN</Label>
                <Input name="isbn" defaultValue={book?.isbn ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={book?.quantity ?? 1}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <textarea
                name="description"
                defaultValue={book?.description ?? ""}
                rows={4}
                className="rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`cover-${book?.id ?? "new"}`}>Cover image</Label>
              {book?.coverUrl && !cover && (
                <Image
                  src={book.coverUrl}
                  alt=""
                  width={64}
                  height={84}
                  className="h-20 w-16 rounded object-cover"
                />
              )}
              <Input
                id={`cover-${book?.id ?? "new"}`}
                name="cover"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (file && file.size > 5 * 1024 * 1024) {
                    event.target.value = "";
                    toast.error("Cover image must be 5 MB or smaller");
                    setCover(null);
                    return;
                  }
                  setCover(file);
                }}
              />
              <p className="text-xs text-slate-500">
                JPG, PNG, WebP, or another image format; maximum 5 MB.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !authors.length || !categories.length}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {book ? "Save changes" : "Create book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteBookButton({ book }: { book: Book }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete “${book.title}”?`)) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/books/${book.id}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? "Could not delete book");
      }
      toast.success("Book deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete book",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Button
      size="icon"
      variant="destructive"
      onClick={remove}
      disabled={deleting}
      aria-label={`Delete ${book.title}`}
    >
      {deleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
