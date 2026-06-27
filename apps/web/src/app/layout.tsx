import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Library Management",
  description: "A simple librarian dashboard for books and students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="border-b bg-white px-4 py-3 sm:px-6 lg:px-8">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <Link href="/" className="font-semibold text-slate-950">
              Library Management
            </Link>
            <div className="flex gap-4 text-sm font-medium text-slate-600">
              <Link href="/" className="hover:text-slate-950">
                Books
              </Link>
              <Link href="/students" className="hover:text-slate-950">
                Students
              </Link>
              <Link href="/authors" className="hover:text-slate-950">
                Authors
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
