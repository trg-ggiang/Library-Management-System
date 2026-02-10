// routes/Librarian/librarianReaders.js
import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

// GET /api/librarian/readers?search=
router.get("/readers", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const pattern = `%${search}%`;

    const rows = search
      ? await prisma.$queryRaw`
          SELECT
            r.id AS "readerId",
            u.id AS "userId",
            u.name,
            u.email,
            u.phone,
            r.address,
            r.gender,
            r.dob,
            r."registrationDate"
          FROM "ReaderProfile" r
          JOIN "User" u ON u.id = r."userId"
          WHERE (u.name ILIKE ${pattern} OR u.email ILIKE ${pattern})
          ORDER BY r.id DESC
          LIMIT 200
        `
      : await prisma.$queryRaw`
          SELECT
            r.id AS "readerId",
            u.id AS "userId",
            u.name,
            u.email,
            u.phone,
            r.address,
            r.gender,
            r.dob,
            r."registrationDate"
          FROM "ReaderProfile" r
          JOIN "User" u ON u.id = r."userId"
          ORDER BY r.id DESC
          LIMIT 200
        `;

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/librarian/readers error:", err);
    return res.status(500).json({ message: "Failed to load readers" });
  }
});

// GET /api/librarian/readers/:id (detail + borrowings + fines)
router.get("/readers/:id", async (req, res) => {
  try {
    const readerId = Number(req.params.id);
    if (Number.isNaN(readerId)) return res.status(400).json({ message: "Invalid id" });

    const rp = await prisma.readerProfile.findUnique({
      where: { id: readerId },
      include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } },
    });
    if (!rp) return res.status(404).json({ message: "Reader not found" });

    const borrowings = await prisma.borrowing.findMany({
      where: { readerId },
      orderBy: { borrowDate: "desc" },
      take: 80,
      include: { copy: { include: { book: true } } },
    });

    const fines = await prisma.fine.findMany({
      where: { borrowing: { readerId } },
      orderBy: { fineDate: "desc" },
      take: 80,
      include: {
        borrowing: { include: { copy: { include: { book: true } } } },
        payments: true, // nếu schema có relation Fine -> Payment[]
      },
    });

    return res.json({
      profile: rp,
      borrowings: borrowings.map((b) => ({
        id: b.id,
        status: b.status,
        borrowDate: b.borrowDate,
        dueDate: b.dueDate,
        returnDate: b.returnDate,
        bookTitle: b.copy?.book?.title || "",
        copyId: b.copyId,
      })),
      fines: fines.map((f) => ({
        id: f.id,
        amount: f.amount,
        fineDate: f.fineDate,
        borrowingId: f.borrowingId,
        bookTitle: f.borrowing?.copy?.book?.title || "",
        paid: Array.isArray(f.payments) && f.payments.some((p) => p.status === 2),
      })),
    });
  } catch (err) {
    console.error("GET /api/librarian/readers/:id error:", err);
    return res.status(500).json({ message: "Failed to load reader detail" });
  }
});

export default router;
