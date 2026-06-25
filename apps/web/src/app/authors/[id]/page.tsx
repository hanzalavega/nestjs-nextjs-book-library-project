"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

export default function AuthorDetailsPage() {
  const params = useParams<{ id: string }>();
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    [],
  );
  const [author, setAuthor] = useState<Author | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuthor = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/authors/${params.id}`);

      if (!response.ok) {
        throw new Error("Could not fetch author");
      }

      const data = (await response.json()) as Author;
      setAuthor(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not fetch author",
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, params.id]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchAuthor();
    });
  }, [fetchAuthor]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Author Details</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {author?.name ?? "Author"}
            </h1>
          </div>

          <Button variant="outline" asChild>
            <Link href="/authors">
              <ArrowLeft className="h-4 w-4" />
              Authors
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border bg-white p-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading author
            </div>
          ) : author ? (
            <div className="flex flex-col gap-6 sm:flex-row">
              {author.photoUrl ? (
                <Image
                  src={author.photoUrl}
                  alt={author.name}
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
                  <dd className="mt-1 text-slate-950">{author.name}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Email</dt>
                  <dd className="mt-1 text-slate-950">{author.email || "-"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Bio</dt>
                  <dd className="mt-1 text-slate-950">{author.bio || "-"}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="h-40 text-sm text-slate-500">Author not found.</div>
          )}
        </div>
      </section>
    </main>
  );
}
