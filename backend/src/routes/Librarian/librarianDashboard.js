// routes/Librarian/librarianDashboard.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    let endPlusOne = null;
    if (end) {
      endPlusOne = new Date(end);
      endPlusOne.setDate(endPlusOne.getDate() + 1);
    }

    const [counts] = await prisma.$queryRaw`
      SELECT
        (SELECT COUNT(*)::int FROM "Book")       AS "totalBooks",
        (SELECT COUNT(*)::int FROM "BookCopy")   AS "totalCopies",
        (SELECT COUNT(*)::int FROM "BookCopy" WHERE status = 0) AS "available",
        (SELECT COUNT(*)::int FROM "BookCopy" WHERE status = 2) AS "borrowed"
    `;

    let dailyBorrow;

    if (start && endPlusOne) {
      dailyBorrow = await prisma.$queryRaw`
        SELECT
          DATE("borrowDate") AS day,
          COUNT(*)::int      AS count
        FROM "Borrowing"
        WHERE status = 1
          AND "borrowDate" >= ${start}
          AND "borrowDate" < ${endPlusOne}
        GROUP BY day
        ORDER BY day ASC
      `;
    } else if (start) {
      dailyBorrow = await prisma.$queryRaw`
        SELECT
          DATE("borrowDate") AS day,
          COUNT(*)::int      AS count
        FROM "Borrowing"
        WHERE status = 1
          AND "borrowDate" >= ${start}
        GROUP BY day
        ORDER BY day ASC
      `;
    } else if (endPlusOne) {
      dailyBorrow = await prisma.$queryRaw`
        SELECT
          DATE("borrowDate") AS day,
          COUNT(*)::int      AS count
        FROM "Borrowing"
        WHERE status = 1
          AND "borrowDate" < ${endPlusOne}
        GROUP BY day
        ORDER BY day ASC
      `;
    } else {
      dailyBorrow = await prisma.$queryRaw`
        SELECT
          DATE("borrowDate") AS day,
          COUNT(*)::int      AS count
        FROM "Borrowing"
        WHERE status = 1
        GROUP BY day
        ORDER BY day ASC
      `;
    }

    return res.json({
      totalBooks: counts.totalBooks,
      totalCopies: counts.totalCopies,
      available: counts.available,
      borrowed: counts.borrowed,
      dailyBorrow
    });
  } catch (err) {
    console.error("Error GET /api/librarian/dashboard:", err);
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
});

export default router;
