import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();
const COPY = { AVAILABLE: 0, BORROWED: 2, RESERVED: 3 };
const RESV = { ACTIVE: 1 };

router.get("/books/:bookId/issue-copies", async (req, res) => {
  try {
    const bookId = Number(req.params.bookId);
    const readerId = req.query.readerId ? Number(req.query.readerId) : null;

    if (!bookId) return res.status(400).json({ message: "Invalid bookId" });

    // lấy cả AVAILABLE và RESERVED (nhưng RESERVED chỉ hợp lệ nếu reservation thuộc readerId)
    const copies = await prisma.bookCopy.findMany({
      where: { bookId, status: { in: [COPY.AVAILABLE, COPY.RESERVED] } },
      orderBy: { id: "asc" },
      take: 200,
    });

    if (!readerId) {
      // nếu không truyền readerId thì chỉ show AVAILABLE
      return res.json(copies.filter((c) => c.status === COPY.AVAILABLE));
    }

    // lọc RESERVED theo reservation active của reader
    const reservations = await prisma.reservation.findMany({
      where: { readerId, status: RESV.ACTIVE, bookId },
      select: { copyId: true },
    });
    const reservedSet = new Set(reservations.map((r) => r.copyId));

    const ok = copies.filter((c) => c.status === COPY.AVAILABLE || reservedSet.has(c.id));
    return res.json(ok);
  } catch (err) {
    console.error("GET /api/librarian/books/:bookId/issue-copies error:", err);
    return res.status(500).json({ message: "Failed to load issue copies" });
  }
});

export default router;
