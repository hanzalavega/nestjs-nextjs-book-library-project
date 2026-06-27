export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Category = { id: number; name: string; slug: string };
export type Author = { id: number; name: string };
export type Student = { id: number; name: string; email: string };
export type Borrow = {
  id: number;
  borrowedAt: string;
  dueAt: string | null;
  returnedAt: string | null;
  student: Student;
};
export type Book = {
  id: number;
  title: string;
  isbn: string | null;
  description: string | null;
  coverUrl: string | null;
  coverPublicId: string | null;
  quantity: number;
  availableQuantity: number;
  author: Author;
  category: Category;
  borrows?: Borrow[];
};

export async function getBooks(): Promise<Book[]> {
  const response = await fetch(`${API_URL}/books`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load books");
  return response.json();
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load categories");
  return response.json();
}

export async function getAuthors(): Promise<Author[]> {
  const response = await fetch(`${API_URL}/authors`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load authors");
  return response.json();
}
