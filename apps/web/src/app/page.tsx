"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
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

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  photoUrl: string | null;
  photoPublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  department: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const defaultValues: StudentFormValues = {
  name: "",
  email: "",
  phone: "",
  department: "",
};

export default function Home() {
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    [],
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues,
  });

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/students`);

      if (!response.ok) {
        throw new Error("Could not fetch students");
      }

      const data = (await response.json()) as Student[];
      setStudents(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not fetch students",
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchStudents();
    });
  }, [fetchStudents]);

  const openCreateDialog = () => {
    setEditingStudent(null);
    setSelectedPhoto(null);
    form.reset(defaultValues);
    setDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setSelectedPhoto(null);
    form.reset({
      name: student.name,
      email: student.email,
      phone: student.phone ?? "",
      department: student.department ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: StudentFormValues) => {
    setIsSaving(true);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);

    if (values.phone) {
      formData.append("phone", values.phone);
    }

    if (values.department) {
      formData.append("department", values.department);
    }

    if (selectedPhoto) {
      formData.append("photo", selectedPhoto);
    }

    try {
      const endpoint = editingStudent
        ? `${apiUrl}/students/${editingStudent.id}`
        : `${apiUrl}/students`;
      const method = editingStudent ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? "Could not save student");
      }

      toast.success(
        editingStudent
          ? "Student updated successfully"
          : "Student created successfully",
      );
      setDialogOpen(false);
      setSelectedPhoto(null);
      await fetchStudents();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save student",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteStudent = async (student: Student) => {
    const shouldDelete = window.confirm(
      `Delete ${student.name} from the student list?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/students/${student.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete student");
      }

      toast.success("Student deleted successfully");
      await fetchStudents();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete student",
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
            <h1 className="text-3xl font-semibold tracking-tight">
              Students CRUD
            </h1>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Create Student
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="w-36 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading students
                    </span>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-sm text-slate-500"
                  >
                    No students found. Create the first one.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      {student.photoUrl ? (
                        <Image
                          src={student.photoUrl}
                          alt={student.name}
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
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone || "-"}</TableCell>
                    <TableCell>{student.department || "-"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(student)}
                          aria-label={`Edit ${student.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteStudent(student)}
                          aria-label={`Delete ${student.name}`}
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
              {editingStudent ? "Edit student" : "Create student"}
            </DialogTitle>
            <DialogDescription>
              {editingStudent
                ? "Update the student details."
                : "Add a new student to the library system."}
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
                      <Input placeholder="Ayesha Rahman" {...field} />
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
                      <Input placeholder="ayesha@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+8801712345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel htmlFor="photo">Photo</FormLabel>
                {editingStudent?.photoUrl && !selectedPhoto ? (
                  <Image
                    src={editingStudent.photoUrl}
                    alt={editingStudent.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                ) : null}
                <Input
                  id="photo"
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
                  {editingStudent ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
