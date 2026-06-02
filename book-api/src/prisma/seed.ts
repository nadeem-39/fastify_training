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
import { Role } from "../generated/prisma/enums.js";

const books = [
  { bookName: "C", authorName: "Naman Bhardwaj", isbn: "2223334000" },
  { bookName: "C++", authorName: "Vishal Kumar", isbn: "2201229000" },
  { bookName: "Java", authorName: "Vinod", isbn: "2211259000" },
  { bookName: "Electronic", authorName: "Sumit Kadyan", isbn: "2221234000" },
  { bookName: "C#", authorName: "Smriti Devi", isbn: "2210029000" },
  { bookName: "Java-advance", authorName: "Anil Mittal", isbn: "2211329000" },
  { bookName: "Javascript", authorName: "Smriti Devi", isbn: "2210329000" },
  { bookName: "c#", authorName: "Manish Goel", isbn: "2210029001" },
  { bookName: "Electronic-3", authorName: "Sapna Devi", isbn: "2201329000" },
  { bookName: "Electronic-2", authorName: "Kumari Devi", isbn: "2211325000" },
];

const users = [
  {
    name: "Nadeem",
    email: "nadeem@gmail.com",
    password: "$2b$10$8K1p/a0hY1vD1n9M6mYQw.7n2T3n3bFzq9j7zYw3h4J2Q6wY5Xr6e",
    role: Role.ADMIN,
  },
  {
    name: "Aman",
    email: "aman@gmail.com",
    password: "$2b$10$8K1p/a0hY1vD1n9M6mYQw.7n2T3n3bFzq9j7zYw3h4J2Q6wY5Xr6e",
    role: Role.STUDENT,
  },
  {
    name: "Rahul",
    email: "rahul@gmail.com",
    password: "$2b$10$8K1p/a0hY1vD1n9M6mYQw.7n2T3n3bFzq9j7zYw3h4J2Q6wY5Xr6e",
    role: Role.STUDENT,
  },
  {
    name: "Arjun",
    email: "arjun@gmail.com",
    password: "$2b$10$8K1p/a0hY1vD1n9M6mYQw.7n2T3n3bFzq9j7zYw3h4J2Q6wY5Xr6e",
    role: Role.STUDENT,
  },
  {
    name: "Vikas",
    email: "vikas@gmail.com",
    password: "$2b$10$8K1p/a0hY1vD1n9M6mYQw.7n2T3n3bFzq9j7zYw3h4J2Q6wY5Xr6e",
    role: Role.STUDENT,
  },
  {
    name: "Sahil",
    email: "sahil@gmail.com",
    password: "$2b$10$8K1p/a0hY1vD1n9M6mYQw.7n2T3n3bFzq9j7zYw3h4J2Q6wY5Xr6e",
    role: Role.STUDENT,
  },
  {
    name: "Karan",
    email: "karan@gmail.com",
    password: "$2b$10$8K1p/a0hY1vD1n9M6mYQw.7n2T3n3bFzq9j7zYw3h4J2Q6wY5Xr6e",
    role: Role.STUDENT,
  },
  {
    name: "Rohit",
    email: "rohit@gmail.com",
    password: "$2b$10$8K1p/a0hY1vD1n9M6mYQw.7n2T3n3bFzq9j7zYw3h4J2Q6wY5Xr6e",
    role: Role.STUDENT,
  },
  {
    name: "Deepak",
    email: "deepak@gmail.com",
    password: "$2b$10$8K1p/a0hY1vD1n9M6mYQw.7n2T3n3bFzq9j7zYw3h4J2Q6wY5Xr6e",
    role: Role.STUDENT,
  },
  {
    name: "Mohit",
    email: "mohit@gmail.com",
    password: "$2b$10$8K1p/a0hY1vD1n9M6mYQw.7n2T3n3bFzq9j7zYw3h4J2Q6wY5Xr6e",
    role: Role.STUDENT,
  },
];

async function main(): Promise<void> {
  for (const b of books) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: { bookName: b.bookName, authorName: b.authorName },
      create: b,
    });
  }

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, password: u.password },
      create: u,
    });
  }
  console.log(`Seeded ${books.length} books`);
  console.log(`Seeded ${users.length} users`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
