// routes/Accountant/accountantFines.js
import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

// GET /api/accountant/fines?status=unpaid|paid|all
router.get("/fines", async (req, res) => {
  try {
    const status = String(req.query.status || "all");

    const fines = await prisma.fine.findMany({
      orderBy: { fineDate: "desc" },
      take: 200,
      include: {
        borrowing: { include: { reader: { include: { user: { select: { name: true, email: true } } } }, copy: { include: { book: true } } } },
        payments: true,
      },
    });

    const mapped = fines.map((f) => {
      const paid = Array.isArray(f.payments) && f.payments.some((p) => p.status === 2);
      return {
        id: f.id,
        amount: f.amount,
        fineDate: f.fineDate,
        borrowingId: f.borrowingId,
        paid,
        readerName: f.borrowing?.reader?.user?.name || "",
        readerEmail: f.borrowing?.reader?.user?.email || "",
        bookTitle: f.borrowing?.copy?.book?.title || "",
      };
    });

    const filtered =
      status === "paid"
        ? mapped.filter((x) => x.paid)
        : status === "unpaid"
          ? mapped.filter((x) => !x.paid)
          : mapped;

    return res.json(filtered);
  } catch (err) {
    console.error("GET /api/accountant/fines error:", err);
    return res.status(500).json({ message: "Failed to load fines" });
  }
});

// POST /api/accountant/fines/:id/pay  (thu tại quầy)
router.post("/fines/:id/pay", async (req, res) => {
  try {
    const fineId = Number(req.params.id);
    if (Number.isNaN(fineId)) return res.status(400).json({ message: "Invalid id" });

    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
      include: { payments: true },
    });
    if (!fine) return res.status(404).json({ message: "Fine not found" });

    const alreadyPaid = Array.isArray(fine.payments) && fine.payments.some((p) => p.status === 2);
    if (alreadyPaid) return res.json({ message: "Already paid" });

    const method = String(req.body.method || "CASH").toUpperCase();

    await prisma.payment.create({
      data: {
        fineId,
        amount: fine.amount,
        method,
        status: 2,
        paidAt: new Date(),
      },
    });

    return res.json({ message: "Paid fine", fineId });
  } catch (err) {
    console.error("POST /api/accountant/fines/:id/pay error:", err);
    return res.status(500).json({ message: "Failed to pay fine" });
  }
});

export default router;
