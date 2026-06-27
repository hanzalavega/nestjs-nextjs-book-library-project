import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Book not found</h1>
      <Button asChild>
        <Link href="/">Return to catalogue</Link>
      </Button>
    </main>
  );
}
