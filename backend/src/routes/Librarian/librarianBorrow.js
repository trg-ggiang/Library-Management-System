// routes/Librarian/librarianBorrow.js
import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

router.get("/available-copies", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    let rows;

    if (search) {
      const pattern = `%${search}%`;
      rows = await prisma.$queryRaw`
        SELECT 
          c.id AS "copyId",
          c."bookId",
          b.title,
          b.author,
          b.genre,
          c.status,
          br."readerId",
          br."borrowDate",
          br."dueDate"
        FROM "BookCopy" c
        JOIN "Book" b ON c."bookId" = b.id
        LEFT JOIN "Borrowing" br
          ON br."copyId" = c.id
         AND br.status = 1
        WHERE c.status IN (0, 2)
          AND (b.title ILIKE ${pattern} OR b.author ILIKE ${pattern})
        ORDER BY c.id
        LIMIT 200
      `;
    } else {
      rows = await prisma.$queryRaw`
        SELECT 
          c.id AS "copyId",
          c."bookId",
          b.title,
          b.author,
          b.genre,
          c.status,
          br."readerId",
          br."borrowDate",
          br."dueDate"
        FROM "BookCopy" c
        JOIN "Book" b ON c."bookId" = b.id
        LEFT JOIN "Borrowing" br
          ON br."copyId" = c.id
         AND br.status = 1
        WHERE c.status IN (0, 2)
        ORDER BY c.id
        LIMIT 200
      `;
    }

    return res.json(rows);
  } catch (err) {
    console.error("Error GET /api/librarian/available-copies:", err);
    return res.status(500).json({ message: "Failed to load copies" });
  }
});

router.post("/borrow", async (req, res) => {
  try {
    const { readerId, copyId, days } = req.body;
    const readerIdNum = Number(readerId);
    const copyIdNum = Number(copyId);
    const loanDays = Number(days) || 14;

    if (!readerIdNum || !copyIdNum) {
      return res.status(400).json({ message: "readerId and copyId are required" });
    }

    const copyRows = await prisma.$queryRaw`
      SELECT id, status, "bookId"
      FROM "BookCopy"
      WHERE id = ${copyIdNum}
      LIMIT 1
    `;
    const copy = copyRows[0];
    if (!copy) return res.status(404).json({ message: "Book copy not found" });
    if (copy.status !== 0) {
      return res.status(400).json({ message: "Book copy is not available for borrowing" });
    }

    const readerRows = await prisma.$queryRaw`
      SELECT id
      FROM "ReaderProfile"
      WHERE id = ${readerIdNum}
      LIMIT 1
    `;
    const reader = readerRows[0];
    if (!reader) return res.status(404).json({ message: "Reader not found" });

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + loanDays);

    const result = await prisma.$transaction(async (tx) => {
      const borrowingRows = await tx.$queryRaw`
        INSERT INTO "Borrowing"
          ("readerId", "copyId", "borrowDate", "dueDate", "status", "bookId")
        VALUES
          (${readerIdNum}, ${copyIdNum}, ${now}, ${dueDate}, 1, ${copy.bookId})
        RETURNING id, "readerId", "copyId", "borrowDate", "dueDate", "returnDate", status, "bookId"
      `;
      const borrowing = borrowingRows[0];

      await tx.$executeRaw`
        UPDATE "BookCopy"
        SET status = 2, "updatedAt" = ${now}
        WHERE id = ${copyIdNum}
      `;

      return borrowing;
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error("Error POST /api/librarian/borrow:", err);
    return res.status(500).json({ message: "Failed to create borrowing" });
  }
});

// ✅ RETURN: auto tạo Fine nếu quá hạn (mặc định 10k/ngày)
router.post("/return", async (req, res) => {
  try {
    const { copyId } = req.body;
    const copyIdNum = Number(copyId);

    if (!copyIdNum) {
      return res.status(400).json({ message: "copyId is required" });
    }

    const activeRows = await prisma.$queryRaw`
      SELECT id, "dueDate"
      FROM "Borrowing"
      WHERE "copyId" = ${copyIdNum}
        AND status = 1
      ORDER BY "borrowDate" DESC
      LIMIT 1
    `;
    const active = activeRows[0];
    if (!active) {
      return res.status(404).json({ message: "No active borrowing found for this copy" });
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      // update borrowing + copy
      const updatedRows = await tx.$queryRaw`
        UPDATE "Borrowing"
        SET "returnDate" = ${now}, status = 2
        WHERE id = ${active.id}
        RETURNING id, "readerId", "copyId", "borrowDate", "dueDate", "returnDate", status, "bookId"
      `;

      await tx.$executeRaw`
        UPDATE "BookCopy"
        SET status = 0, "updatedAt" = ${now}
        WHERE id = ${copyIdNum}
      `;

      // ✅ fine nếu overdue
      const due = new Date(active.dueDate);
      if (now > due) {
        const ms = now.getTime() - due.getTime();
        const daysLate = Math.ceil(ms / (24 * 60 * 60 * 1000));
        const amount = daysLate * 10000;

        const existed = await tx.fine.findFirst({ where: { borrowingId: active.id } });
        if (!existed) {
          await tx.fine.create({
            data: {
              borrowingId: active.id,
              amount,
              fineDate: now,
            },
          });
        }
      }

      return updatedRows[0];
    });

    return res.json(updated);
  } catch (err) {
    console.error("Error POST /api/librarian/return:", err);
    return res.status(500).json({ message: "Failed to return book" });
  }
});

export default router;
