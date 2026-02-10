import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

async function getReaderProfileByUserId(userId) {
  return prisma.readerProfile.findUnique({ where: { userId } });
}

// GET /api/reader/borrows  (lịch sử mượn)
router.get("/borrows", async (req, res) => {
  try {
    const rp = await getReaderProfileByUserId(req.user.id);
    if (!rp) return res.status(403).json({ message: "Reader profile not found" });

    const rows = await prisma.borrowing.findMany({
      where: { readerId: rp.id },
      orderBy: { borrowDate: "desc" },
      take: 100,
      include: {
        copy: { include: { book: true } },
      },
    });

    return res.json(
      rows.map((b) => ({
        id: b.id,
        status: b.status,
        borrowDate: b.borrowDate,
        dueDate: b.dueDate,
        returnDate: b.returnDate,
        copyId: b.copyId,
        book: b.copy?.book
          ? {
              id: b.copy.book.id,
              title: b.copy.book.title,
              author: b.copy.book.author,
              genre: b.copy.book.genre,
              coverUrl: b.copy.book.coverUrl,
            }
          : null,
      }))
    );
  } catch (err) {
    console.error("GET /api/reader/borrows error:", err);
    return res.status(500).json({ message: "Failed to load borrow history" });
  }
});

// GET /api/reader/fines  (tiền phạt)
router.get("/fines", async (req, res) => {
  try {
    const rp = await getReaderProfileByUserId(req.user.id);
    if (!rp) return res.status(403).json({ message: "Reader profile not found" });

    const fines = await prisma.fine.findMany({
      where: {
        borrowing: { readerId: rp.id },
      },
      orderBy: { fineDate: "desc" },
      take: 200,
      include: {
        borrowing: {
          include: {
            copy: { include: { book: true } },
          },
        },
      },
    });

    return res.json(
      fines.map((f) => ({
        id: f.id,
        amount: Number(f.amount),
        fineDate: f.fineDate,
        status: f.status ?? null,   // nếu schema có
        borrowingId: f.borrowingId,
        bookTitle: f.borrowing?.copy?.book?.title || null,
      }))
    );
  } catch (err) {
    console.error("GET /api/reader/fines error:", err);
    return res.status(500).json({ message: "Failed to load fines" });
  }
});

export default router;
