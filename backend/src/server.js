import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prismaClient.js";
import authRoutes from "./routes/authRoute.js"; // 👈 đường dẫn đúng tên file của bạn

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// test nhanh
app.get("/", (req, res) => res.send("📚 Library API is running 🚀"));

// 👇 MOUNT ROUTE AUTH
app.use("/api/auth", authRoutes);

// (khuyến nghị) 404 JSON cho những đường không có
app.use((req, res) => {
  res.status(404).json({ message: "Not Found", path: req.originalUrl });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
