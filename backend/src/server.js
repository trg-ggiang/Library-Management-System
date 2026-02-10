import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoute.js";

import adminDashboardRoute from "./routes/Admin/adminDashboard.js";
import adminBooksRoute from "./routes/Admin/adminBooks.js";
import adminUsersRoute from "./routes/Admin/adminUsers.js";
import adminStatisticsRoute from "./routes/Admin/adminStatistics.js";

import readerDashboardRoute from "./routes/Reader/readerDashboardRoutes.js";
import readerShopRoute from "./routes/Reader/readerShop.js";

import librarianBorrowRoute from "./routes/Librarian/librarianBorrow.js";
import librarianDashboardRoute from "./routes/Librarian/librarianDashboard.js";
import librarianOrdersRoute from "./routes/Librarian/librarianOrders.js";
import readerExtrasRoute from "./routes/Reader/readerExtras.js";
import librarianReadersRoute from "./routes/Librarian/librarianReaders.js";
import librarianBooksRoute from "./routes/Librarian/librarianBooks.js";

import readerMeRoute from "./routes/Reader/readerMe.js";

import accountantDashboardRoute from "./routes/Accountant/accountantDashboard.js";
import accountantFinesRoute from "./routes/Accountant/accountantFines.js";
import accountantPaymentsRoute from "./routes/Accountant/accountantPayments.js";
import adminBookCoverRoute from "./routes/Admin/adminBookCover.js";
import readerReservationRoute from "./routes/Reader/readerReservation.js";
import librarianIssueCopiesRoute from "./routes/Librarian/librarianIssueCopies.js";
import librarianIssueByCopiesRoute from "./routes/Librarian/librarianIssueByCopies.js";

import path from "path";
import { fileURLToPath } from "url";

import { verifyToken, allowRoles } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("📚 Library API is running 🚀"));

// ================= PUBLIC =================
app.use("/api/auth", authRoutes);

// ================= READER =================
// Dashboard reader (nếu route này là của reader)
app.use(
  "/api/dashboard",
  verifyToken,
  allowRoles(["READER", "ADMIN"]),
  readerDashboardRoute
);

// Shop reader
app.use(
  "/api/reader",
  verifyToken,
  allowRoles(["READER", "ADMIN"]),
  readerShopRoute
);

// ================= ADMIN =================
app.use(
  "/api/admin",
  verifyToken,
  allowRoles(["ADMIN"]),
  adminDashboardRoute
);
app.use(
  "/api/admin",
  verifyToken,
  allowRoles(["ADMIN"]),
  adminBooksRoute
);
app.use(
  "/api/admin",
  verifyToken,
  allowRoles(["ADMIN"]),
  adminUsersRoute
);
app.use(
  "/api/admin",
  verifyToken,
  allowRoles(["ADMIN"]),
  adminStatisticsRoute
);

// ================= LIBRARIAN =================
app.use(
  "/api/librarian",
  verifyToken,
  allowRoles(["LIBRARIAN", "ADMIN"]),
  librarianDashboardRoute
);
app.use(
  "/api/librarian",
  verifyToken,
  allowRoles(["LIBRARIAN", "ADMIN"]),
  librarianBorrowRoute
);
app.use(
  "/api/librarian",
  verifyToken,
  allowRoles(["LIBRARIAN", "ADMIN"]),
  librarianOrdersRoute
);
app.use(
  "/api/librarian",
  verifyToken,
  allowRoles(["LIBRARIAN", "ADMIN"]),
  librarianIssueCopiesRoute
);

app.use(
  "/api/librarian",
  verifyToken,
  allowRoles(["LIBRARIAN", "ADMIN"]),
  librarianIssueByCopiesRoute
);


// ================= ACCOUNTANT =================
app.use(
  "/api/accountant",
  verifyToken,
  allowRoles(["ACCOUNTANT", "ADMIN"]),
  accountantPaymentsRoute
);
app.use(
  "/api/reader",
  verifyToken,
  allowRoles(["READER", "ADMIN"]),
  readerShopRoute
);

app.use(
  "/api/reader",
  verifyToken,
  allowRoles(["READER", "ADMIN"]),
  readerExtrasRoute
);
app.use(
  "/api/reader",
  verifyToken,
  allowRoles(["READER", "ADMIN"]),
  readerReservationRoute
);

app.use(
  "/api/reader",
  verifyToken,
  allowRoles(["READER", "ADMIN"]),
  readerShopRoute
);

// ✅ thêm
app.use(
  "/api/reader",
  verifyToken,
  allowRoles(["READER", "ADMIN"]),
  readerMeRoute
);

// ================= LIBRARIAN =================
app.use(
  "/api/librarian",
  verifyToken,
  allowRoles(["LIBRARIAN", "ADMIN"]),
  librarianDashboardRoute
);
app.use(
  "/api/librarian",
  verifyToken,
  allowRoles(["LIBRARIAN", "ADMIN"]),
  librarianBorrowRoute
);
app.use(
  "/api/librarian",
  verifyToken,
  allowRoles(["LIBRARIAN", "ADMIN"]),
  librarianOrdersRoute
);

// ✅ thêm
app.use(
  "/api/librarian",
  verifyToken,
  allowRoles(["LIBRARIAN", "ADMIN"]),
  librarianReadersRoute
);
app.use(
  "/api/librarian",
  verifyToken,
  allowRoles(["LIBRARIAN", "ADMIN"]),
  librarianBooksRoute
);

// ================= ACCOUNTANT =================
app.use(
  "/api/accountant",
  verifyToken,
  allowRoles(["ACCOUNTANT", "ADMIN"]),
  accountantPaymentsRoute
);

// ✅ thêm
app.use(
  "/api/accountant",
  verifyToken,
  allowRoles(["ACCOUNTANT", "ADMIN"]),
  accountantDashboardRoute
);
app.use(
  "/api/accountant",
  verifyToken,
  allowRoles(["ACCOUNTANT", "ADMIN"]),
  accountantFinesRoute
);

app.use(
  "/api/admin",
  verifyToken,
  allowRoles(["ADMIN"]),
  adminBookCoverRoute
);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Not Found", path: req.originalUrl });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
