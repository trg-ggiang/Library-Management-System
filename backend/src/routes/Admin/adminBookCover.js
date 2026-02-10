import express from "express";
import multer from "multer";
import path from "path";
import prisma from "../../prismaClient.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/covers"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `book_${req.params.id}_${Date.now()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

router.post("/books/:id/cover", upload.single("cover"), async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    if (Number.isNaN(bookId)) return res.status(400).json({ message: "Invalid bookId" });
    if (!req.file) return res.status(400).json({ message: "Missing file cover" });

    const coverUrl = `/${req.file.path.replaceAll("\\", "/")}`; // "/uploads/covers/..."

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: { coverUrl },
    });

    return res.json({ message: "Cover updated", book: updated });
  } catch (err) {
    console.error("POST /api/admin/books/:id/cover error:", err);
    return res.status(500).json({ message: "Upload cover failed" });
  }
});

export default router;
