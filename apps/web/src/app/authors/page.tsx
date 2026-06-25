"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Author = {
  id: number;
  name: string;
  email: string | null;
  bio: string | null;
  photoUrl: string | null;
  photoPublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

const authorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address").optional().or(z.literal("")),
  bio: z.string().optional(),
});

type AuthorFormValues = z.infer<typeof authorSchema>;

const defaultValues: AuthorFormValues = {
  name: "",
  email: "",
  bio: "",
};

export default function AuthorsPage() {
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    [],
  );
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues,
  });

  const fetchAuthors = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/authors`);

      if (!response.ok) {
        throw new Error("Could not fetch authors");
      }

      const data = (await response.json()) as Author[];
      setAuthors(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not fetch authors",
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchAuthors();
    });
  }, [fetchAuthors]);

  const openCreateDialog = () => {
    setEditingAuthor(null);
    setSelectedPhoto(null);
    form.reset(defaultValues);
    setDialogOpen(true);
  };

  const openEditDialog = (author: Author) => {
    setEditingAuthor(author);
    setSelectedPhoto(null);
    form.reset({
      name: author.name,
      email: author.email ?? "",
      bio: author.bio ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: AuthorFormValues) => {
    setIsSaving(true);

    const formData = new FormData();
    formData.append("name", values.name);

    if (values.email) {
      formData.append("email", values.email);
    }

    if (values.bio) {
      formData.append("bio", values.bio);
    }

    if (selectedPhoto) {
      formData.append("photo", selectedPhoto);
    }

    try {
      const endpoint = editingAuthor
        ? `${apiUrl}/authors/${editingAuthor.id}`
        : `${apiUrl}/authors`;
      const method = editingAuthor ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? "Could not save author");
      }

      toast.success(
        editingAuthor
          ? "Author updated successfully"
          : "Author created successfully",
      );
      setDialogOpen(false);
      setSelectedPhoto(null);
      await fetchAuthors();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save author",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAuthor = async (author: Author) => {
    const shouldDelete = window.confirm(`Delete ${author.name}?`);

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/authors/${author.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete author");
      }

      toast.success("Author deleted successfully");
      await fetchAuthors();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete author",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Book Library Management System
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Authors</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/">Students</Link>
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Create Author
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead className="w-48 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading authors
                    </span>
                  </TableCell>
                </TableRow>
              ) : authors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-28 text-center text-sm text-slate-500"
                  >
                    No authors found. Create the first one.
                  </TableCell>
                </TableRow>
              ) : (
                authors.map((author) => (
                  <TableRow key={author.id}>
                    <TableCell>
                      {author.photoUrl ? (
                        <Image
                          src={author.photoUrl}
                          alt={author.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-xs font-medium text-slate-500">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{author.name}</TableCell>
                    <TableCell>{author.email || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {author.bio || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link
                            href={`/authors/${author.id}`}
                            aria-label={`View ${author.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(author)}
                          aria-label={`Edit ${author.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteAuthor(author)}
                          aria-label={`Delete ${author.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);

          if (!open) {
            setSelectedPhoto(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAuthor ? "Edit author" : "Create author"}
            </DialogTitle>
            <DialogDescription>
              {editingAuthor
                ? "Update the author details."
                : "Add a new author to the library system."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Humayun Ahmed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="humayun@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bangladeshi novelist and filmmaker"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel htmlFor="author-photo">Photo</FormLabel>
                {editingAuthor?.photoUrl && !selectedPhoto ? (
                  <Image
                    src={editingAuthor.photoUrl}
                    alt={editingAuthor.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                ) : null}
                <Input
                  id="author-photo"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    setSelectedPhoto(event.target.files?.[0] ?? null);
                  }}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingAuthor ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
