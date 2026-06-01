/**
 * E3.3 — Interfaces, type aliases, and a generic helper, all in one file.
 *
 * Why one file: at this stage of training we want you focused on the type
 * system itself, not on how to import across files. We'll split into modules
 * from Day 4 onwards.
 *
 * What you must do:
 *  1. Read the interfaces and the generic function below.
 *  2. Add 3 more books to the `books` array.
 *  3. Add 2 issues to the `issues` array (one ISSUED, one RETURNED).
 *  4. Use `filterBy` to print only books whose authorName starts with 'V'.
 *  5. Use `filterBy` to print only issues whose status is 'RETURNED'.
 *
 * Run with: npx tsx src/use-models.ts
 */
// Generic — works on ANY array. Note `<T>` and the typed predicate.
export function filterBy(items, predicate) {
    return items.filter(predicate);
}
// ---------- data ------------------------------------------------------------
const books = [
    { id: 1, bookName: "C", authorName: "Naman Bhardwaj", isbn: "2223334000" },
    { id: 2, bookName: "C++", authorName: "Vishal Kumar", isbn: "2201229000" },
    { id: 3, bookName: "Java", authorName: "Vinod", isbn: "2211259000" },
    { id: 4, bookName: "Python", authorName: "Nadeem", isbn: "2311259000" },
    { id: 5, bookName: "JavaScript", authorName: "Rahul", isbn: "2411259000" },
    { id: 6, bookName: "c#", authorName: "Ronak", isbn: "2511259000" },
    // TODO: add 3 more books here.
];
const issues = [
    // TODO: add 2 issues here. Example shape:
    {
        id: 1,
        bookId: 1,
        studentId: 12,
        issueDate: new Date("2026-05-01"),
        status: "ISSUED",
    },
    {
        id: 2,
        bookId: 2,
        studentId: 13,
        issueDate: new Date("2026-05-02"),
        status: "RETURNED",
    },
];
// ---------- exercises -------------------------------------------------------
// (4) authors starting with 'V'
const vAuthors = filterBy(books, (b) => b.authorName.startsWith("V"));
console.log("Books by V authors:", vAuthors);
// (5) returned issues
const returned = filterBy(issues, (i) => i.status === "RETURNED");
console.log("Returned issues:", returned);
