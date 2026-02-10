import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

const COPY = { AVAILABLE: 0, BORROWED: 2, RESERVED: 3 };
const RESV = { ACTIVE: 1, CANCELLED: 2, EXPIRED: 3, FULFILLED: 4 };

async function expireReservations(tx) {
  const now = new Date();
  const expired = await tx.reservation.findMany({
    where: { status: RESV.ACTIVE, expiresAt: { lt: now } },
    select: { id: true, copyId: true },
  });

  if (expired.length === 0) return;

  await tx.reservation.updateMany({
    where: { id: { in: expired.map((x) => x.id) } },
    data: { status: RESV.EXPIRED },
  });

  await tx.bookCopy.updateMany({
    where: { id: { in: expired.map((x) => x.copyId) }, status: COPY.RESERVED },
    data: { status: COPY.AVAILABLE },
  });
}

// POST /api/reader/reservations  { bookId, holdDays? }
router.post("/reservations", async (req, res) => {
  try {
    const bookId = Number(req.body.bookId);
    const holdDays = Number(req.body.holdDays) || 2;

    if (!bookId) return res.status(400).json({ message: "bookId is required" });

    const rp = await prisma.readerProfile.findUnique({ where: { userId: req.user.id } });
    if (!rp) return res.status(404).json({ message: "Reader not found" });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + holdDays);

    const result = await prisma.$transaction(async (tx) => {
      await expireReservations(tx);

      // lấy 1 copy AVAILABLE để giữ chỗ
      const copy = await tx.bookCopy.findFirst({
        where: { bookId, status: COPY.AVAILABLE },
        orderBy: { id: "asc" },
      });
      if (!copy) throw new Error("NO_COPY_AVAILABLE");

      // set copy -> RESERVED
      await tx.bookCopy.update({
        where: { id: copy.id },
        data: { status: COPY.RESERVED },
      });

      // tạo reservation ACTIVE
      const reservation = await tx.reservation.create({
        data: {
          readerId: rp.id,
          bookId,
          copyId: copy.id,
          status: RESV.ACTIVE,
          expiresAt,
        },
        include: { book: true, copy: true },
      });

      return reservation;
    });

    return res.status(201).json(result);
  } catch (err) {
    if (String(err.message) === "NO_COPY_AVAILABLE") {
      return res.status(400).json({ message: "No available copy to reserve" });
    }
    console.error("POST /api/reader/reservations error:", err);
    return res.status(500).json({ message: "Reserve failed" });
  }
});

// GET /api/reader/me/reservations
router.get("/me/reservations", async (req, res) => {
  try {
    const rp = await prisma.readerProfile.findUnique({ where: { userId: req.user.id } });
    if (!rp) return res.status(404).json({ message: "Reader not found" });

    const data = await prisma.$transaction(async (tx) => {
      await expireReservations(tx);

      return tx.reservation.findMany({
        where: { readerId: rp.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { book: true, copy: true },
      });
    });

    return res.json(
      data.map((r) => ({
        id: r.id,
        status: r.status,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
        book: { id: r.book.id, title: r.book.title, coverUrl: r.book.coverUrl },
        copyId: r.copyId,
      }))
    );
  } catch (err) {
    console.error("GET /api/reader/me/reservations error:", err);
    return res.status(500).json({ message: "Load reservations failed" });
  }
});

// POST /api/reader/reservations/:id/cancel
router.post("/reservations/:id/cancel", async (req, res) => {
  try {
    const reservationId = Number(req.params.id);
    if (!reservationId) return res.status(400).json({ message: "Invalid id" });

    const rp = await prisma.readerProfile.findUnique({ where: { userId: req.user.id } });
    if (!rp) return res.status(404).json({ message: "Reader not found" });

    await prisma.$transaction(async (tx) => {
      await expireReservations(tx);

      const r = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!r || r.readerId !== rp.id) throw new Error("NOT_FOUND");
      if (r.status !== RESV.ACTIVE) return;

      await tx.reservation.update({ where: { id: reservationId }, data: { status: RESV.CANCELLED } });

      await tx.bookCopy.updateMany({
        where: { id: r.copyId, status: COPY.RESERVED },
        data: { status: COPY.AVAILABLE },
      });
    });

    return res.json({ message: "Cancelled" });
  } catch (err) {
    if (String(err.message) === "NOT_FOUND") return res.status(404).json({ message: "Reservation not found" });
    console.error("POST /api/reader/reservations/:id/cancel error:", err);
    return res.status(500).json({ message: "Cancel failed" });
  }
});

export default router;
