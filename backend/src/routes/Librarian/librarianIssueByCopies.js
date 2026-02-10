import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();
const COPY = { AVAILABLE: 0, BORROWED: 2, RESERVED: 3 };
const RESV = { ACTIVE: 1, FULFILLED: 4 };

router.post("/orders/:orderId/issue-by-copies", async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const allocations = Array.isArray(req.body.allocations) ? req.body.allocations : [];

    if (!orderId) return res.status(400).json({ message: "Invalid orderId" });
    if (allocations.length === 0) return res.status(400).json({ message: "allocations is required" });

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.borrowOrder.findUnique({
        where: { id: orderId },
        include: {
          reader: true,
          items: { include: { book: true } },
        },
      });

      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status !== 2) throw new Error("ORDER_NOT_APPROVED"); // 2=APPROVED (theo hệ thống m)

      // verify: allocations đủ đúng quantity
      const itemMap = new Map(order.items.map((it) => [it.id, it]));
      const usedCopyIds = new Set();

      // group allocations by itemId
      const grouped = new Map();
      for (const a of allocations) {
        const itemId = Number(a.orderItemId);
        const copyId = Number(a.copyId);
        if (!itemId || !copyId) throw new Error("BAD_ALLOC");
        if (!itemMap.has(itemId)) throw new Error("BAD_ITEM");
        if (usedCopyIds.has(copyId)) throw new Error("DUP_COPY");
        usedCopyIds.add(copyId);
        if (!grouped.has(itemId)) grouped.set(itemId, []);
        grouped.get(itemId).push(copyId);
      }

      // check each item quantity
      for (const it of order.items) {
        const list = grouped.get(it.id) || [];
        if (list.length !== it.quantity) throw new Error("QTY_MISMATCH");
      }

      // lock & validate copies
      for (const [itemId, copyIds] of grouped.entries()) {
        const it = itemMap.get(itemId);

        for (const copyId of copyIds) {
          const copy = await tx.bookCopy.findUnique({ where: { id: copyId } });
          if (!copy) throw new Error("COPY_NOT_FOUND");
          if (copy.bookId !== it.bookId) throw new Error("COPY_BOOK_MISMATCH");
          if (![COPY.AVAILABLE, COPY.RESERVED].includes(copy.status)) throw new Error("COPY_NOT_ISSUABLE");

          // nếu RESERVED thì bắt buộc reservation ACTIVE của đúng reader
          if (copy.status === COPY.RESERVED) {
            const r = await tx.reservation.findFirst({
              where: {
                copyId,
                readerId: order.readerId,
                bookId: it.bookId,
                status: 1, // ACTIVE
                expiresAt: { gt: new Date() },
              },
            });
            if (!r) throw new Error("RESERVED_NOT_OWNED");
          }
        }
      }

      // create borrowings + update copies + fulfill reservations
      const now = new Date();
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 14);

      const borrowings = [];

      for (const [itemId, copyIds] of grouped.entries()) {
        const it = itemMap.get(itemId);

        for (const copyId of copyIds) {
          const b = await tx.borrowing.create({
            data: {
              readerId: order.readerId,
              copyId,
              bookId: it.bookId,
              borrowDate: now,
              dueDate,
              status: 1, // ACTIVE
            },
          });
          borrowings.push(b);

          await tx.bookCopy.update({
            where: { id: copyId },
            data: { status: COPY.BORROWED, updatedAt: now },
          });

          await tx.reservation.updateMany({
            where: { copyId, readerId: order.readerId, status: RESV.ACTIVE },
            data: { status: RESV.FULFILLED },
          });
        }
      }

      // update order status BORROWED (3)
      await tx.borrowOrder.update({
        where: { id: orderId },
        data: { status: 3, issuedAt: now },
      });

      return { orderId, borrowingsCount: borrowings.length };
    });

    return res.json({ message: "Issued", ...result });
  } catch (err) {
    const msg = String(err.message || "");
    const map = {
      ORDER_NOT_FOUND: "Order not found",
      ORDER_NOT_APPROVED: "Order is not approved",
      BAD_ALLOC: "Bad allocations payload",
      BAD_ITEM: "Order item not found in this order",
      DUP_COPY: "Duplicate copyId in allocations",
      QTY_MISMATCH: "Allocations count must match each item quantity",
      COPY_NOT_FOUND: "Copy not found",
      COPY_BOOK_MISMATCH: "Copy does not belong to the book",
      COPY_NOT_ISSUABLE: "Copy is not available/reserved for issue",
      RESERVED_NOT_OWNED: "Reserved copy does not belong to this reader",
    };
    if (map[msg]) return res.status(400).json({ message: map[msg] });

    console.error("POST /api/librarian/orders/:id/issue-by-copies error:", err);
    return res.status(500).json({ message: "Issue failed" });
  }
});

export default router;
