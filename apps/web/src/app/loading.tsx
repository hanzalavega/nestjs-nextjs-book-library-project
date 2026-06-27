import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center gap-2 text-sm text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      Loading library…
    </main>
  );
}
