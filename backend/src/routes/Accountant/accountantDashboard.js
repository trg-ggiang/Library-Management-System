// routes/Accountant/accountantDashboard.js
import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

// GET /api/accountant/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const [fineAgg] = await prisma.$queryRaw`
      SELECT COALESCE(SUM(amount),0)::int AS total
      FROM "Fine"
    `;

    const [paidAgg] = await prisma.$queryRaw`
      SELECT COALESCE(SUM(amount),0)::int AS total
      FROM "Payment"
      WHERE status = 2
    `;

    const [unpaidFines] = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS count
      FROM "Fine" f
      WHERE NOT EXISTS (
        SELECT 1 FROM "Payment" p
        WHERE p."fineId" = f.id AND p.status = 2
      )
    `;

    return res.json({
      totalFineAmount: Number(fineAgg?.total || 0),
      totalPaidAmount: Number(paidAgg?.total || 0),
      unpaidFinesCount: Number(unpaidFines?.count || 0),
    });
  } catch (err) {
    console.error("GET /api/accountant/dashboard error:", err);
    return res.status(500).json({ message: "Failed to load accountant dashboard" });
  }
});

export default router;
