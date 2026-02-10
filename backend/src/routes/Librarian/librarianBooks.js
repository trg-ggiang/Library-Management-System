// routes/Librarian/librarianBooks.js
import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

router.get("/books", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(6, Number(req.query.limit) || 12));
    const search = String(req.query.search || "").trim();
    const genre = String(req.query.genre || "").trim();
    const sort = String(req.query.sort || "new").trim();

    const offset = (page - 1) * limit;

    const whereParts = [];
    const params = [];
    let idx = 1;

    if (search) {
      const pattern = `%${search}%`;
      whereParts.push(`(b.title ILIKE $${idx} OR b.author ILIKE $${idx})`);
      params.push(pattern);
      idx++;
    }

    if (genre) {
      whereParts.push(`b.genre = $${idx}`);
      params.push(genre);
      idx++;
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
    const orderSql = sort === "title" ? `ORDER BY b.title ASC` : `ORDER BY b.id DESC`;

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM "Book" b
      ${whereSql}
    `;
    const countRows = await prisma.$queryRawUnsafe(countSql, ...params);
    const total = Number(countRows[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const limitIdx = idx;
    const offsetIdx = idx + 1;

    const listSql = `
      SELECT
        b.id, b.title, b.author, b.genre, b."publishedYear",
        b."coverUrl", b.description,
        COUNT(c.id)::int AS "totalCopies",
        COUNT(CASE WHEN c.status = 0 THEN 1 END)::int AS "availableCopies",
        COALESCE(AVG(r.rating), 0)::float AS "avgRating",
        COUNT(r.id)::int AS "reviewCount"
      FROM "Book" b
      LEFT JOIN "BookCopy" c ON c."bookId" = b.id
      LEFT JOIN "Review" r ON r."bookId" = b.id
      ${whereSql}
      GROUP BY b.id
      ${orderSql}
      LIMIT $${limitIdx}
      OFFSET $${offsetIdx}
    `;

    const rows = await prisma.$queryRawUnsafe(listSql, ...params, limit, offset);

    return res.json({
      page,
      limit,
      total,
      totalPages,
      items: rows.map((x) => ({
        id: x.id,
        title: x.title,
        author: x.author,
        genre: x.genre,
        publishedYear: x.publishedYear,
        coverUrl: x.coverUrl,
        description: x.description,
        totalCopies: Number(x.totalCopies),
        availableCopies: Number(x.availableCopies),
        avgRating: Number(x.avgRating || 0),
        reviewCount: Number(x.reviewCount || 0),
      })),
    });
  } catch (err) {
    console.error("GET /api/reader/books error:", err);
    return res.status(500).json({ message: "Failed to load books" });
  }
});


export default router;
