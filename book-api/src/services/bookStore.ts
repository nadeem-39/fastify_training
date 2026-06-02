export interface Book {
  id: number;
  bookName: string;
  authorName: string;
  isbn: string;
  coverFile?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateBookInput = Pick<Book, "bookName" | "authorName" | "isbn">;
export type UpdateBookInput = Partial<CreateBookInput>;

const store = new Map<number, Book>();
let nextId = 1;

export function listBooks(): Book[] {
  return [...store.values()].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export function getBook(id: number): Book | undefined {
  return store.get(id);
}

export function createBook(input: CreateBookInput): Book {
  // duplicate isbn check
  for (const b of store.values()) {
    if (b.isbn === input.isbn) {
      throw Object.assign(new Error("ISBN already exists"), {
        statusCode: 409,
      });
    }
  }
  const now = new Date();
  const book: Book = { id: nextId++, ...input, createdAt: now, updatedAt: now };
  store.set(book.id, book);
  return book;
}

export function updateBook(id: number, input: UpdateBookInput): Book {
  const existing = store.get(id);
  if (!existing)
    throw Object.assign(new Error("Book not found"), { statusCode: 404 });
  const updated: Book = { ...existing, ...input, updatedAt: new Date() };
  store.set(id, updated);
  return updated;
}

export function deleteBook(id: number): void {
  if (!store.delete(id)) {
    throw Object.assign(new Error("Book Id not found"), { statusCode: 404 });
  }
}

// Seed three books so the API is testable right after start.
createBook({ bookName: "C", authorName: "Naman Bhardwaj", isbn: "2223334000" });
createBook({ bookName: "C++", authorName: "Vishal Kumar", isbn: "2201229000" });
createBook({ bookName: "Java", authorName: "Vinod", isbn: "2211259000" });
