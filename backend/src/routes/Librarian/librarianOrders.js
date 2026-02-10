import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

// GET /api/librarian/orders?status=1
router.get("/orders", async (req, res) => {
  try {
    const status = req.query.status ? Number(req.query.status) : null;

    const where = {};
    if (!Number.isNaN(status) && status !== null) where.status = status;

    const rows = await prisma.borrowOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        reader: { include: { user: { select: { name: true, email: true } } } },
        items: { include: { book: { select: { id: true, title: true, author: true, coverUrl: true } } } },
      },
    });

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/librarian/orders error:", err);
    return res.status(500).json({ message: "Failed to load orders" });
  }
});

// POST /api/librarian/orders/:id/approve
router.post("/orders/:id/approve", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (Number.isNaN(orderId)) return res.status(400).json({ message: "Invalid id" });

    const order = await prisma.borrowOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== 1) return res.status(400).json({ message: "Order is not PENDING" });

    const pickupDays = 2;
    const expires = new Date();
    expires.setDate(expires.getDate() + pickupDays);

    const updated = await prisma.borrowOrder.update({
      where: { id: orderId },
      data: {
        status: 2, // APPROVED
        pickupExpiresAt: expires,
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error("POST /api/librarian/orders/:id/approve error:", err);
    return res.status(500).json({ message: "Failed to approve order" });
  }
});

// POST /api/librarian/orders/:id/issue  (gán copy + tạo borrowing)
router.post("/orders/:id/issue", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (Number.isNaN(orderId)) return res.status(400).json({ message: "Invalid id" });

    const order = await prisma.borrowOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== 2) return res.status(400).json({ message: "Order must be APPROVED to issue" });

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + (order.loanDays || 14));

    const staffId = req.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const createdBorrowings = [];

      for (const it of order.items) {
        // lấy đủ số copy AVAILABLE
        const copies = await tx.bookCopy.findMany({
          where: { bookId: it.bookId, status: 0 },
          select: { id: true },
          take: it.quantity,
        });

        if (copies.length < it.quantity) {
          throw new Error(`Not enough copies for bookId=${it.bookId}`);
        }

        for (const c of copies) {
          const br = await tx.borrowing.create({
            data: {
              readerId: order.readerId,
              copyId: c.id,
              staffId,
              borrowDate: now,
              dueDate,
              status: 1,
              bookId: it.bookId,
              orderId,
            },
          });

          await tx.bookCopy.update({
            where: { id: c.id },
            data: { status: 2, updatedAt: now },
          });

          createdBorrowings.push(br);
        }
      }

      const updatedOrder = await tx.borrowOrder.update({
        where: { id: orderId },
        data: { status: 3 }, // BORROWED
      });

      return { updatedOrder, createdBorrowings };
    });

    return res.json(result);
  } catch (err) {
    console.error("POST /api/librarian/orders/:id/issue error:", err);
    return res.status(500).json({ message: err.message || "Failed to issue order" });
  }
});

// POST /api/librarian/orders/:id/cancel
router.post("/orders/:id/cancel", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (Number.isNaN(orderId)) return res.status(400).json({ message: "Invalid id" });

    const updated = await prisma.borrowOrder.update({
      where: { id: orderId },
      data: { status: 4 },
    });

    return res.json(updated);
  } catch (err) {
    console.error("POST /api/librarian/orders/:id/cancel error:", err);
    return res.status(500).json({ message: "Failed to cancel order" });
  }
});

export default router;
