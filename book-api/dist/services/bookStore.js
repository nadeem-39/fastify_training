const store = new Map();
let nextId = 1;
export function listBooks() {
    return [...store.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
export function getBook(id) {
    return store.get(id);
}
export function createBook(input) {
    // duplicate isbn check
    for (const b of store.values()) {
        if (b.isbn === input.isbn) {
            throw Object.assign(new Error("ISBN already exists"), {
                statusCode: 409,
            });
        }
    }
    const now = new Date();
    const book = { id: nextId++, ...input, createdAt: now, updatedAt: now };
    store.set(book.id, book);
    return book;
}
export function updateBook(id, input) {
    const existing = store.get(id);
    if (!existing)
        throw Object.assign(new Error("Book not found"), { statusCode: 404 });
    const updated = { ...existing, ...input, updatedAt: new Date() };
    store.set(id, updated);
    return updated;
}
export function deleteBook(id) {
    if (!store.delete(id)) {
        throw Object.assign(new Error("Book Id not found"), { statusCode: 404 });
    }
}
// Seed three books so the API is testable right after start.
createBook({ bookName: "C", authorName: "Naman Bhardwaj", isbn: "2223334000" });
createBook({ bookName: "C++", authorName: "Vishal Kumar", isbn: "2201229000" });
createBook({ bookName: "Java", authorName: "Vinod", isbn: "2211259000" });
