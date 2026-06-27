"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">The library could not be loaded</h1>
      <p className="text-sm text-slate-500">
        Check that the NestJS API and database are running, then try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
