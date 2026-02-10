import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

// GET /api/accountant/payments
router.get("/payments", async (req, res) => {
  try {
    const rows = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        order: { include: { reader: { include: { user: { select: { name: true, email: true } } } } } },
        fine: true,
      },
    });
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/accountant/payments error:", err);
    return res.status(500).json({ message: "Failed to load payments" });
  }
});

export default router;
