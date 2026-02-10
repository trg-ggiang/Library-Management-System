// routes/Reader/readerMe.js
import express from "express";
import prisma from "../../prismaClient.js";

const router = express.Router();

async function getReaderProfileByUserId(userId) {
  return prisma.readerProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
}

// GET /api/reader/me/profile
router.get("/me/profile", async (req, res) => {
  try {
    const rp = await getReaderProfileByUserId(req.user.id);
    if (!rp) return res.status(404).json({ message: "Reader not found" });

    return res.json({
      user: {
        id: rp.user.id,
        name: rp.user.name,
        email: rp.user.email,
        phone: rp.user.phone,
        role: rp.user.role,
      },
      profile: {
        id: rp.id,
        address: rp.address,
        gender: rp.gender,
        dob: rp.dob,
        registrationDate: rp.registrationDate,
      },
    });
  } catch (err) {
    console.error("GET /api/reader/me/profile error:", err);
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

// PATCH /api/reader/me/profile
router.patch("/me/profile", async (req, res) => {
  try {
    const { name, phone, address, gender, dob } = req.body;

    const rp = await prisma.readerProfile.findUnique({ where: { userId: req.user.id } });
    if (!rp) return res.status(404).json({ message: "Reader not found" });

    const parsedDob = dob ? new Date(dob) : null;
    if (dob && Number.isNaN(parsedDob.getTime())) {
      return res.status(400).json({ message: "Invalid dob" });
    }

    await prisma.$transaction(async (tx) => {
      if (typeof name === "string" || typeof phone === "string") {
        await tx.user.update({
          where: { id: req.user.id },
          data: {
            ...(typeof name === "string" ? { name: name.trim() } : {}),
            ...(typeof phone === "string" ? { phone: phone.trim() || null } : {}),
          },
        });
      }

      await tx.readerProfile.update({
        where: { id: rp.id },
        data: {
          ...(typeof address === "string" ? { address: address.trim() } : {}),
          ...(typeof gender === "string" ? { gender } : {}),
          ...(dob !== undefined ? { dob: parsedDob } : {}),
        },
      });
    });

    return res.json({ message: "Updated" });
  } catch (err) {
    console.error("PATCH /api/reader/me/profile error:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

// GET /api/reader/me/borrows?type=active|all
router.get("/me/borrows", async (req, res) => {
  try {
    const rp = await prisma.readerProfile.findUnique({ where: { userId: req.user.id } });
    if (!rp) return res.status(404).json({ message: "Reader not found" });

    const type = String(req.query.type || "all");
    const where =
      type === "active"
        ? { readerId: rp.id, status: 1 }
        : { readerId: rp.id };

    const rows = await prisma.borrowing.findMany({
      where,
      orderBy: { borrowDate: "desc" },
      take: 120,
      include: { copy: { include: { book: true } } },
    });

    return res.json(
      rows.map((b) => ({
        id: b.id,
        status: b.status,
        borrowDate: b.borrowDate,
        dueDate: b.dueDate,
        returnDate: b.returnDate,
        copyId: b.copyId,
        book: {
          id: b.copy?.book?.id,
          title: b.copy?.book?.title,
          author: b.copy?.book?.author,
          coverUrl: b.copy?.book?.coverUrl,
        },
      }))
    );
  } catch (err) {
    console.error("GET /api/reader/me/borrows error:", err);
    return res.status(500).json({ message: "Failed to load borrows" });
  }
});

// GET /api/reader/me/fines
router.get("/me/fines", async (req, res) => {
  try {
    const rp = await prisma.readerProfile.findUnique({ where: { userId: req.user.id } });
    if (!rp) return res.status(404).json({ message: "Reader not found" });

    const fines = await prisma.fine.findMany({
      where: { borrowing: { readerId: rp.id } },
      orderBy: { fineDate: "desc" },
      take: 120,
      include: {
        borrowing: { include: { copy: { include: { book: true } } } },
        payments: true, // Fine -> Payment[]
      },
    });

    return res.json(
      fines.map((f) => ({
        id: f.id,
        amount: f.amount,
        fineDate: f.fineDate,
        borrowingId: f.borrowingId,
        bookTitle: f.borrowing?.copy?.book?.title || "",
        paid: Array.isArray(f.payments) && f.payments.some((p) => p.status === 2),
      }))
    );
  } catch (err) {
    console.error("GET /api/reader/me/fines error:", err);
    return res.status(500).json({ message: "Failed to load fines" });
  }
});

// POST /api/reader/fines/:id/pay  (mock online)
router.post("/fines/:id/pay", async (req, res) => {
  try {
    const fineId = Number(req.params.id);
    if (Number.isNaN(fineId)) return res.status(400).json({ message: "Invalid id" });

    const rp = await prisma.readerProfile.findUnique({ where: { userId: req.user.id } });
    if (!rp) return res.status(404).json({ message: "Reader not found" });

    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
      include: { borrowing: true, payments: true },
    });
    if (!fine || fine.borrowing?.readerId !== rp.id) {
      return res.status(404).json({ message: "Fine not found" });
    }

    const alreadyPaid = Array.isArray(fine.payments) && fine.payments.some((p) => p.status === 2);
    if (alreadyPaid) return res.json({ message: "Already paid" });

    await prisma.payment.create({
      data: {
        fineId,
        amount: fine.amount,
        method: "MOCK",
        status: 2,
        paidAt: new Date(),
      },
    });

    return res.json({ message: "Paid fine (mock)", fineId });
  } catch (err) {
    console.error("POST /api/reader/fines/:id/pay error:", err);
    return res.status(500).json({ message: "Failed to pay fine" });
  }
});

export default router;
