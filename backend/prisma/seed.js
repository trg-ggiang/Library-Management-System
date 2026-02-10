// backend/prisma/seed.js
// chạy: node prisma/seed.js  (hoặc npx prisma migrate reset sẽ tự chạy seed nếu đã config)

import { PrismaClient, Role, Gender, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

console.log("=== SEED VERSION: 2026-02-09 v3 (Reservation fix) ===");

const PASSWORD = "123456";
const HASH = bcrypt.hashSync(PASSWORD, 10);

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

async function clearDB() {
  // Xóa theo thứ tự để tránh FK
  await prisma.payment.deleteMany().catch(() => { });
  await prisma.fine.deleteMany().catch(() => { });
  await prisma.review.deleteMany().catch(() => { });
  await prisma.reservation.deleteMany().catch(() => { });
  await prisma.borrowOrderItem.deleteMany().catch(() => { });
  await prisma.borrowOrder.deleteMany().catch(() => { });
  await prisma.borrowing.deleteMany().catch(() => { });
  await prisma.bookCopy.deleteMany().catch(() => { });
  await prisma.book.deleteMany().catch(() => { });
  await prisma.readerProfile.deleteMany().catch(() => { });
  await prisma.user.deleteMany().catch(() => { });
}

async function main() {
  console.log("=== CLEAR DB ===");
  await clearDB();

  console.log("=== SEED USERS ===");

  // 1 ADMIN
  const admin = await prisma.user.create({
    data: {
      name: "Admin Seed",
      email: "admin_seed@lib.com",
      passwordHash: HASH,
      role: Role.ADMIN,
      phone: "0901000001",
    },
  });

  // 1 LIBRARIAN
  const librarian = await prisma.user.create({
    data: {
      name: "Librarian Seed",
      email: "librarian_seed@lib.com",
      passwordHash: HASH,
      role: Role.LIBRARIAN,
      phone: "0902000001",
    },
  });

  // 1 ACCOUNTANT
  const accountant = await prisma.user.create({
    data: {
      name: "Accountant Seed",
      email: "accountant_seed@lib.com",
      passwordHash: HASH,
      role: Role.ACCOUNTANT,
      phone: "0903000001",
    },
  });

  // 20 READERS
  const readers = await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Reader ${i + 1}`,
          email: `reader_seed_${i + 1}@mail.com`,
          passwordHash: HASH,
          role: Role.READER,
          phone: `09040000${String(i + 1).padStart(2, "0")}`,
          readerProfile: {
            create: {
              address: `Street ${i + 1}, Hanoi`,
              gender: rand([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
              dob: randomDate(new Date(1998, 0, 1), new Date(2010, 0, 1)),
            },
          },
        },
        include: { readerProfile: true },
      })
    )
  );

  console.log("Users inserted:", {
    admin: 1,
    librarian: 1,
    accountant: 1,
    readers: readers.length,
  });

  console.log("=== SEED BOOKS (REAL) ===");

  // coverUrl: nếu muốn FE show ảnh sẵn => bỏ ảnh vào frontend/public/covers/... (tên file đúng)
  const realBooks = [
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      genre: "Classic",
      language: "English",
      publishedYear: 1960,
      description:
        "A classic novel about justice and empathy in the American South.",
      coverUrl: "/To-save-a-mocking-bird.png",
    },
    {
      title: "1984",
      author: "George Orwell",
      genre: "Dystopian",
      language: "English",
      publishedYear: 1949,
      description: "A dystopian story about surveillance, propaganda, and freedom.",
      coverUrl: "/1984.png",
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      genre: "Classic",
      language: "English",
      publishedYear: 1813,
      description:
        "A witty romance exploring manners, society, and misunderstandings.",
      coverUrl: "/Pride and Prejudice.png",
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      genre: "Classic",
      language: "English",
      publishedYear: 1925,
      description: "A portrait of ambition, love, and the American Dream.",
      coverUrl: "/The Great Gatsby.png",
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      genre: "Classic",
      language: "English",
      publishedYear: 1951,
      description: "A coming-of-age novel about identity and alienation.",
      coverUrl: "/The Catcher in the Rye.png",
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      genre: "Fantasy",
      language: "English",
      publishedYear: 1937,
      description:
        "A fantasy adventure that leads to dragons, treasure, and bravery.",
      coverUrl: "/The Hobbit.png",
    },
    {
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      genre: "Fantasy",
      language: "English",
      publishedYear: 1997,
      description: "The first year at Hogwarts begins a magical journey.",
      // ⚠️ nhớ check đúng tên file y hệt trong public
      coverUrl: "/Harry Potter and the Philosopher's Stone.png",
    },
    {
      title: "The Fellowship of the Ring",
      author: "J.R.R. Tolkien",
      genre: "Fantasy",
      language: "English",
      publishedYear: 1954,
      description: "The first part of The Lord of the Rings trilogy.",
      coverUrl: "/The Fellowship of the Ring.png",
    },
    {
      title: "The Alchemist",
      author: "Paulo Coelho",
      genre: "Fiction",
      language: "English",
      publishedYear: 1988,
      description: "A symbolic journey about dreams, purpose, and destiny.",
      coverUrl: "/The Alchemist.png",
    },
    {
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      genre: "History",
      language: "English",
      publishedYear: 2011,
      description:
        "A readable overview of human history and big turning points.",
      // ⚠️ check đúng tên file
      coverUrl: "/Sapiens A Brief History of Humankind.png",
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      genre: "Tech",
      language: "English",
      publishedYear: 2008,
      description:
        "Principles and best practices for writing maintainable code.",
      coverUrl: "/Clean Code.png",
    },
    {
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt & David Thomas",
      genre: "Tech",
      language: "English",
      publishedYear: 1999,
      description: "Practical advice for building better software and habits.",
      // ⚠️ check đúng tên file
      coverUrl: "/The Pragmatic Programmer.png",
    },
    {
      title: "Introduction to Algorithms",
      author:
        "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
      genre: "Tech",
      language: "English",
      publishedYear: 1990,
      description:
        "A foundational textbook covering core algorithms and analysis.",
      // ⚠️ check đúng tên file
      coverUrl: "/Introduction to Algorithms.png",
    },
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
      genre: "Tech",
      language: "English",
      publishedYear: 1994,
      description:
        "Classic design patterns used in object-oriented software.",
      // ⚠️ file m đang dài, check đúng tên file y hệt
      coverUrl:
        "/Design Patterns-Elements of Reusable Object-Oriented Software.png",
    },
    {
      title: "Deep Work",
      author: "Cal Newport",
      genre: "Self-help",
      language: "English",
      publishedYear: 2016,
      description: "A guide to focused work and reducing distractions.",
      coverUrl: "/Deep Work.png",
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      genre: "Self-help",
      language: "English",
      publishedYear: 2018,
      description: "Small habits compound into big results over time.",
      coverUrl: "/Atomic Habits.png",
    },
    {
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      genre: "Psychology",
      language: "English",
      publishedYear: 2011,
      description: "How two systems of thinking shape judgments and decisions.",
      coverUrl: "/Thinking, Fast and Slow.png",
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      genre: "SciFi",
      language: "English",
      publishedYear: 1965,
      description: "Epic science fiction about power, ecology, and destiny.",
      coverUrl: "/Dune.png",
    },
    {
      title: "The Little Prince",
      author: "Antoine de Saint-Exupéry",
      genre: "Classic",
      language: "English",
      publishedYear: 1943,
      description: "A philosophical story about childhood, love, and meaning.",
      coverUrl: "/The Little Prince.png",
    },
    {
      title: "The Da Vinci Code",
      author: "Dan Brown",
      genre: "Thriller",
      language: "English",
      publishedYear: 2003,
      description: "A mystery thriller involving symbols, secrets, and puzzles.",
      coverUrl: "/The Da Vinci Code.png",
    },
  ];


  const books = await Promise.all(
    realBooks.map((b, i) =>
      prisma.book.create({
        data: {
          ...b,
          location: `Shelf-${String(Math.floor(i / 5) + 1)}`, // Shelf-1..4
        },
      })
    )
  );

  console.log(`Books inserted: ${books.length}`);

  // ---- COPIES ---- (mỗi sách 3 bản)
  console.log("=== SEED BOOK COPIES ===");
  const copies = [];
  const copyStatus = new Map(); // copyId -> status

  for (const book of books) {
    for (let i = 0; i < 3; i++) {
      const c = await prisma.bookCopy.create({
        data: {
          book: { connect: { id: book.id } },
          status: 0, // AVAILABLE
        },
      });
      copies.push(c);
      copyStatus.set(c.id, 0);
    }
  }
  console.log(`Copies inserted: ${copies.length}`);

  // ---- BORROWINGS ----
  console.log("=== SEED BORROWINGS ===");
  const borrowings = [];
  let borrowTries = 0;

  while (borrowings.length < 40 && borrowTries < 2000) {
    borrowTries++;

    const user = rand(readers);
    const profile = user.readerProfile;

    const available = copies.filter((c) => (copyStatus.get(c.id) ?? 0) === 0);
    if (!available.length) break;

    const copy = rand(available);

    const borrowDate = randomDate(new Date(2024, 0, 1), new Date());
    const dueDate = addDays(borrowDate, rand([7, 14, 21]));

    const returned = Math.random() < 0.6;
    const returnDate = returned ? randomDate(borrowDate, addDays(dueDate, 7)) : null;
    const status = returned ? 2 : 1;

    const b = await prisma.borrowing.create({
      data: {
        borrowDate,
        dueDate,
        returnDate,
        status,
        reader: { connect: { id: profile.id } },
        copy: { connect: { id: copy.id } },
        staff: { connect: { id: librarian.id } },
        book: { connect: { id: copy.bookId } },
      },
    });

    borrowings.push(b);

    // update copy status cho đúng "nhìn cho thật"
    const newCopyStatus = returned ? 0 : 2;
    copyStatus.set(copy.id, newCopyStatus);
    await prisma.bookCopy.update({
      where: { id: copy.id },
      data: { status: newCopyStatus },
    });
  }

  console.log(`Borrowings inserted: ${borrowings.length}`);

  // ---- RESERVATIONS ---- (FIX đúng schema: cần reader/book/copy + expiresAt)
  console.log("=== SEED RESERVATIONS ===");
  const reservations = [];
  const usedPairs = new Set();
  let resTries = 0;

  while (reservations.length < 15 && resTries < 2000) {
    resTries++;

    const user = rand(readers);
    const profile = user.readerProfile;

    // chọn book trước, rồi chọn copy AVAILABLE của book đó
    const book = rand(books);

    const key = `${profile.id}-${book.id}`;
    if (usedPairs.has(key)) continue;

    const availableCopies = copies.filter(
      (c) => c.bookId === book.id && (copyStatus.get(c.id) ?? 0) === 0
    );
    if (!availableCopies.length) continue;

    const copy = rand(availableCopies);

    // 1=ACTIVE,2=CANCELLED,3=EXPIRED,4=FULFILLED
    const status = rand([1, 1, 1, 2, 3, 4]);

    const createdAt = randomDate(new Date(2024, 0, 1), new Date());
    const expiresAt = addDays(createdAt, rand([2, 3, 5]));

    const r = await prisma.reservation.create({
      data: {
        status,
        createdAt,
        expiresAt,
        reader: { connect: { id: profile.id } },
        book: { connect: { id: book.id } },
        copy: { connect: { id: copy.id } },
      },
    });

    reservations.push(r);
    usedPairs.add(key);

    // nếu ACTIVE => set copy RESERVED cho đúng logic
    if (status === 1) {
      copyStatus.set(copy.id, 1);
      await prisma.bookCopy.update({
        where: { id: copy.id },
        data: { status: 1 },
      });
    }
  }

  console.log(`Reservations inserted: ${reservations.length}`);

  // ---- FINES ----
  console.log("=== SEED FINES ===");
  const fineAmounts = ["5000.00", "10000.00", "15000.00", "20000.00", "30000.00"];
  let fineCount = 0;

  for (const b of borrowings) {
    if (Math.random() < 0.25) {
      const amount = rand(fineAmounts);
      await prisma.fine.create({
        data: {
          borrowing: { connect: { id: b.id } },
          reason: rand(["Late return", "Lost book", "Damaged book"]),
          amount: new Prisma.Decimal(amount),
          fineDate: new Date(b.dueDate ?? new Date()),
        },
      });
      fineCount++;
    }
  }

  console.log(`Fines inserted: ${fineCount}`);

  console.log("=== SEED DONE ===");
  console.log("Example login accounts:");
  console.log("  admin_seed@lib.com / 123456");
  console.log("  librarian_seed@lib.com / 123456");
  console.log("  accountant_seed@lib.com / 123456");
  console.log("  reader_seed_1@mail.com / 123456");

  console.log("Example books:");
  console.log(books.slice(0, 5).map((b) => ({ id: b.id, title: b.title, coverUrl: b.coverUrl })));
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
