// routes/Librarian/librarianBooks.js
import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

// GET /api/librarian/books?search=
router.get("/books", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const pattern = `%${search}%`;

    const rows = search
      ? await prisma.$queryRaw`
          SELECT 
            b.id,
            b.title,
            b.author,
            b.genre,
            b."coverUrl",
            COUNT(c.id)::int AS "totalCopies",
            COUNT(CASE WHEN c.status = 0 THEN 1 END)::int AS "availableCopies"
          FROM "Book" b
          LEFT JOIN "BookCopy" c ON c."bookId" = b.id
          WHERE b.title ILIKE ${pattern} OR b.author ILIKE ${pattern}
          GROUP BY b.id
          ORDER BY b.id DESC
          LIMIT 200
        `
      : await prisma.$queryRaw`
          SELECT 
            b.id,
            b.title,
            b.author,
            b.genre,
            b."coverUrl",
            COUNT(c.id)::int AS "totalCopies",
            COUNT(CASE WHEN c.status = 0 THEN 1 END)::int AS "availableCopies"
          FROM "Book" b
          LEFT JOIN "BookCopy" c ON c."bookId" = b.id
          GROUP BY b.id
          ORDER BY b.id DESC
          LIMIT 200
        `;

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/librarian/books error:", err);
    return res.status(500).json({ message: "Failed to load books" });
  }
});

export default router;
