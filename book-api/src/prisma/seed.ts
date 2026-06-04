/**
 * E5.6 — Prisma seed file for the LMS Book table.
 *
 * Place this at `prisma/seed.ts` in your project. Register the seed command
 * in package.json:
 *
 *   "prisma": { "seed": "tsx prisma/seed.ts" }
 *
 * Run it: `npx prisma db seed`
 *
 * Idempotent — re-running it won't fail on duplicate ISBNs because we use
 * `upsert` keyed by the unique `isbn` column.
 */

import { prisma } from "../lib/prisma.js";

async function main() {
  // Books
  await prisma.book.createMany({
    data: [
      {
        bookName: "Clean Code",
        authorName: "Robert C. Martin",
        isbn: "9780132350884",
      },
      {
        bookName: "The Pragmatic Programmer",
        authorName: "Andrew Hunt",
        isbn: "9780201616224",
      },
      {
        bookName: "Design Patterns",
        authorName: "Erich Gamma",
        isbn: "9780201633610",
      },
      {
        bookName: "Refactoring",
        authorName: "Martin Fowler",
        isbn: "9780201485677",
      },
      {
        bookName: "JavaScript: The Good Parts",
        authorName: "Douglas Crockford",
        isbn: "9780596517748",
      },
    ],
    skipDuplicates: true,
  });

  // Students
  await prisma.student.createMany({
    data: [
      {
        name: "Nadeem Siddiqui",
        rollNo: "CS001",
        phoneNo: "9876543210",
        country: "India",
        state: "Delhi",
        city: "New Delhi",
      },
      {
        name: "Aman Sharma",
        rollNo: "CS002",
        phoneNo: "9876543211",
        country: "India",
        state: "Uttar Pradesh",
        city: "Noida",
      },
      {
        name: "Priya Singh",
        rollNo: "CS003",
        phoneNo: "9876543212",
        country: "India",
        state: "Haryana",
        city: "Gurugram",
      },
      {
        name: "Rahul Verma",
        rollNo: "CS004",
        phoneNo: "9876543213",
        country: "India",
        state: "Punjab",
        city: "Chandigarh",
      },
      {
        name: "Anjali Gupta",
        rollNo: "CS005",
        phoneNo: "9876543214",
        country: "India",
        state: "Rajasthan",
        city: "Jaipur",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
