"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

export default function StudentDetailsPage() {
  const params = useParams<{ id: string }>();
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    [],
  );
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudent = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/students/${params.id}`);

      if (!response.ok) {
        throw new Error("Could not fetch student");
      }

      const data = (await response.json()) as Student;
      setStudent(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not fetch student",
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, params.id]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchStudent();
    });
  }, [fetchStudent]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Student Details
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {student?.name ?? "Student"}
            </h1>
          </div>

          <Button variant="outline" asChild>
            <Link href="/students">
              <ArrowLeft className="h-4 w-4" />
              Students
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border bg-white p-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading student
            </div>
          ) : student ? (
            <div className="flex flex-col gap-6 sm:flex-row">
              {student.photoUrl ? (
                <Image
                  src={student.photoUrl}
                  alt={student.name}
                  width={160}
                  height={160}
                  className="h-40 w-40 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-medium text-slate-500">
                  No photo
                </div>
              )}

              <dl className="grid flex-1 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-slate-500">Name</dt>
                  <dd className="mt-1 text-slate-950">{student.name}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Email</dt>
                  <dd className="mt-1 text-slate-950">{student.email}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Phone</dt>
                  <dd className="mt-1 text-slate-950">
                    {student.phone || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Department</dt>
                  <dd className="mt-1 text-slate-950">
                    {student.department || "-"}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="h-40 text-sm text-slate-500">
              Student not found.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
