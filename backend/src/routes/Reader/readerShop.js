import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

async function getReaderProfileByUserId(userId) {
  const rp = await prisma.readerProfile.findUnique({ where: { userId } });
  return rp;
}

// ===================== BOOKS LIST (pagination + search + filter) =====================
router.get("/books", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(6, Number(req.query.limit) || 12));
    const search = String(req.query.search || "").trim();
    const genre = String(req.query.genre || "").trim();
    const sort = String(req.query.sort || "new").trim(); // new | title

    const offset = (page - 1) * limit;

    // build WHERE + params theo đúng thứ tự
    const whereParts = [];
    const params = [];
    let idx = 1;

    if (search) {
      const pattern = `%${search}%`;
      params.push(pattern);
      whereParts.push(`(b.title ILIKE $${idx} OR b.author ILIKE $${idx})`);
      idx++;
    }

    if (genre) {
      params.push(genre);
      // nếu muốn không phân biệt hoa thường: dùng ILIKE
      whereParts.push(`b.genre = $${idx}`);
      idx++;
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
    const orderSql = sort === "title" ? `ORDER BY b.title ASC` : `ORDER BY b.id DESC`;

    // COUNT
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM "Book" b
      ${whereSql}
    `;
    const countRows = await prisma.$queryRawUnsafe(countSql, ...params);
    const total = Number(countRows[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // LIST
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;

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


// ===================== BOOK DETAIL =====================
router.get("/books/:id", async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    if (Number.isNaN(bookId)) return res.status(400).json({ message: "Invalid id" });

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        author: true,
        genre: true,
        language: true,
        publishedYear: true,
        description: true,
        location: true,
        coverUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!book) return res.status(404).json({ message: "Book not found" });

    const [copiesAgg] = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int AS "totalCopies",
        COUNT(CASE WHEN status = 0 THEN 1 END)::int AS "availableCopies"
      FROM "BookCopy"
      WHERE "bookId" = ${bookId}
    `;

    const [ratingAgg] = await prisma.$queryRaw`
      SELECT
        COALESCE(AVG(rating), 0)::float AS "avgRating",
        COUNT(*)::int AS "reviewCount"
      FROM "Review"
      WHERE "bookId" = ${bookId}
    `;

    const reviews = await prisma.review.findMany({
      where: { bookId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reader: {
          select: {
            id: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    return res.json({
      book,
      totalCopies: Number(copiesAgg?.totalCopies || 0),
      availableCopies: Number(copiesAgg?.availableCopies || 0),
      avgRating: Number(ratingAgg?.avgRating || 0),
      reviewCount: Number(ratingAgg?.reviewCount || 0),
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        readerName: r.reader?.user?.name || "Reader",
      })),
    });
  } catch (err) {
    console.error("GET /api/reader/books/:id error:", err);
    return res.status(500).json({ message: "Failed to load book detail" });
  }
});

// ===================== CREATE/UPDATE REVIEW (reader) =====================
router.post("/books/:id/reviews", async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : null;

    if (Number.isNaN(bookId)) return res.status(400).json({ message: "Invalid bookId" });
    if (![1, 2, 3, 4, 5].includes(rating)) return res.status(400).json({ message: "Rating must be 1..5" });

    const rp = await getReaderProfileByUserId(req.user.id);
    if (!rp) return res.status(403).json({ message: "Reader profile not found" });

    const upsert = await prisma.review.upsert({
      where: { readerId_bookId: { readerId: rp.id, bookId } },
      update: { rating, comment: comment || null },
      create: { readerId: rp.id, bookId, rating, comment: comment || null },
      select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
    });

    return res.status(201).json(upsert);
  } catch (err) {
    console.error("POST /api/reader/books/:id/reviews error:", err);
    return res.status(500).json({ message: "Failed to submit review" });
  }
});

// ===================== CREATE ORDER FROM CART =====================
router.post("/orders", async (req, res) => {
  try {
    const rp = await getReaderProfileByUserId(req.user.id);
    if (!rp) return res.status(403).json({ message: "Reader profile not found" });

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const loanDays = Math.min(60, Math.max(1, Number(req.body.loanDays) || 14));
    const note = typeof req.body.note === "string" ? req.body.note.trim() : null;

    if (items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    // normalize + validate
    const normalized = items
      .map((x) => ({
        bookId: Number(x.bookId),
        quantity: Math.min(5, Math.max(1, Number(x.quantity) || 1)),
      }))
      .filter((x) => !Number.isNaN(x.bookId));

    if (normalized.length === 0) return res.status(400).json({ message: "Invalid items" });

    // check availability for each book
    for (const it of normalized) {
      const [agg] = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS "availableCopies"
        FROM "BookCopy"
        WHERE "bookId" = ${it.bookId} AND status = 0
      `;
      const available = Number(agg?.availableCopies || 0);
      if (available < it.quantity) {
        return res.status(400).json({
          message: `Not enough available copies for bookId=${it.bookId}. Available=${available}`,
        });
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.borrowOrder.create({
        data: {
          readerId: rp.id,
          loanDays,
          note: note || null,
          status: 1, // PENDING
          paymentStatus: 1, // UNPAID
          totalDeposit: 0,
          totalFee: 0,
          items: {
            create: normalized.map((it) => ({
              bookId: it.bookId,
              quantity: it.quantity,
            })),
          },
        },
        include: { items: true },
      });

      return created;
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error("POST /api/reader/orders error:", err);
    return res.status(500).json({ message: "Failed to create order" });
  }
});

// ===================== READER ORDERS LIST =====================
router.get("/orders", async (req, res) => {
  try {
    const rp = await getReaderProfileByUserId(req.user.id);
    if (!rp) return res.status(403).json({ message: "Reader profile not found" });

    const rows = await prisma.borrowOrder.findMany({
      where: { readerId: rp.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        items: { include: { book: { select: { id: true, title: true, author: true, coverUrl: true } } } },
      },
    });

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/reader/orders error:", err);
    return res.status(500).json({ message: "Failed to load orders" });
  }
});

// ===================== ORDER DETAIL =====================
router.get("/orders/:id", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (Number.isNaN(orderId)) return res.status(400).json({ message: "Invalid id" });

    const rp = await getReaderProfileByUserId(req.user.id);
    if (!rp) return res.status(403).json({ message: "Reader profile not found" });

    const order = await prisma.borrowOrder.findFirst({
      where: { id: orderId, readerId: rp.id },
      include: {
        items: { include: { book: { select: { id: true, title: true, author: true, coverUrl: true } } } },
        payments: true,
        borrowings: {
          include: { copy: { include: { book: { select: { title: true } } } } },
          orderBy: { borrowDate: "desc" },
        },
      },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (err) {
    console.error("GET /api/reader/orders/:id error:", err);
    return res.status(500).json({ message: "Failed to load order detail" });
  }
});

// ===================== PAY (MOCK) =====================
router.post("/orders/:id/pay", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (Number.isNaN(orderId)) return res.status(400).json({ message: "Invalid id" });

    const rp = await getReaderProfileByUserId(req.user.id);
    if (!rp) return res.status(403).json({ message: "Reader profile not found" });

    const method = String(req.body.method || "MOCK").toUpperCase();

    const order = await prisma.borrowOrder.findFirst({
      where: { id: orderId, readerId: rp.id },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === 2) return res.json({ message: "Already paid" });

    const amount = (order.totalFee || 0) + (order.totalDeposit || 0);

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          orderId,
          amount,
          method,
          status: 2,
          paidAt: new Date(),
        },
      });

      await tx.borrowOrder.update({
        where: { id: orderId },
        data: { paymentStatus: 2 },
      });
    });

    return res.json({ message: "Paid (mock)", orderId });
  } catch (err) {
    console.error("POST /api/reader/orders/:id/pay error:", err);
    return res.status(500).json({ message: "Failed to pay" });
  }
});

// ===================== READER SUMMARY (profile dashboard) =====================
router.get("/me/summary", async (req, res) => {
  try {
    const rp = await getReaderProfileByUserId(req.user.id);
    if (!rp) return res.status(403).json({ message: "Reader profile not found" });

    const [borrowAgg] = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int AS "totalBorrowings",
        COUNT(CASE WHEN status = 1 THEN 1 END)::int AS "currentlyBorrowed"
      FROM "Borrowing"
      WHERE "readerId" = ${rp.id}
    `;

    const [overdueAgg] = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS "overdue"
      FROM "Borrowing"
      WHERE "readerId" = ${rp.id}
        AND status = 1
        AND "dueDate" < NOW()
    `;

    const fav = await prisma.$queryRaw`
      SELECT b.genre, COUNT(*)::int AS cnt
      FROM "Borrowing" br
      JOIN "Book" b ON br."bookId" = b.id
      WHERE br."readerId" = ${rp.id}
      GROUP BY b.genre
      ORDER BY cnt DESC
      LIMIT 3
    `;

    return res.json({
      totalBorrowings: Number(borrowAgg?.totalBorrowings || 0),
      currentlyBorrowed: Number(borrowAgg?.currentlyBorrowed || 0),
      overdue: Number(overdueAgg?.overdue || 0),
      favoriteGenres: fav.map((x) => ({ genre: x.genre, count: Number(x.cnt) })),
    });
  } catch (err) {
    console.error("GET /api/reader/me/summary error:", err);
    return res.status(500).json({ message: "Failed to load summary" });
  }
});

export default router;
