import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/statistics", async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();

    if (isNaN(year)) {
      return res.status(400).json({ message: "Invalid year parameter." });
    }

    const startOfYear = new Date(year, 0, 1);
    const startOfNextYear = new Date(year + 1, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    // 1. Readers per month (dùng registrationDate của ReaderProfile)
    const readersByMonth = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(r."registrationDate", 'YYYY-MM') AS month,
        COUNT(*)::int AS count
      FROM "ReaderProfile" r
      WHERE r."registrationDate" >= ${startOfYear}
        AND r."registrationDate" < ${startOfNextYear}
      GROUP BY month
      ORDER BY month;
    `;

    // 2. Genre distribution
    const genreDistribution = await prisma.$queryRaw`
      SELECT 
        genre,
        COUNT(*)::int AS count
      FROM "Book"
      GROUP BY genre
      ORDER BY genre;
    `;

    // 3. Most borrowed books trong năm
    const mostBorrowedBooks = await prisma.$queryRaw`
      SELECT 
        b.id AS "bookId",
        b.title,
        b.author,
        COUNT(br.id)::int AS "borrowCount"
      FROM "Borrowing" br
      JOIN "Book" b ON br."bookId" = b.id
      WHERE br."borrowDate" >= ${startOfYear}
        AND br."borrowDate" < ${startOfNextYear}
      GROUP BY b.id, b.title, b.author
      ORDER BY "borrowCount" DESC
      LIMIT 10;
    `;

    return res.json({
      year,
      readersByMonth,
      genreDistribution,
      mostBorrowedBooks,
    });
  } catch (err) {
    console.error("Statistics Error:", err);
    return res.status(500).json({
      message: "Failed to load statistics",
    });
  }
});

export default router;
