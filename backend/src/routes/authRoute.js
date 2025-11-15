import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import prisma from "../prismaClient.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, address, phone, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Thieu thong tin" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email da ton tai" });
    }

    const hashed = bcrypt.hashSync(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashed,
        role: Role.READER,
        phone: phone ?? null,
        readerProfile: {
          create: {
            address: address ?? "",
          }
        }
      },
      include: { readerProfile: true },
    });

    if (!process.env.JWT_SECRET) {
      return res.status(201).json({
        message: "Dang ky thanh cong",
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      });
    }
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      message: "Dang ky doc gia thanh cong",
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error("Loi dang ky:", error);
    return res.status(503).json({ message: "Loi server" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Thieu email hoac password" });
    }
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User khong ton tai" });
    }

    const ok = bcrypt.compareSync(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Sai mat khau" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET chua duoc cau hinh" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Loi dang nhap:", error);
    return res.status(503).json({ message: "Loi server" });
  }
});

export default router;
