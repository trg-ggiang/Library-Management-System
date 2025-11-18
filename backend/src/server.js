import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoute.js";
import adminDashboardRoute from "./routes/Admin/adminDashboard.js";
import readerDashboardRoutes from "./routes/Reader/readerDashboardRoutes.js";
import adminBooksRoutes from "./routes/Admin/adminBooks.js";
import adminUsersRoutes from "./routes/Admin/adminUsers.js";   
import adminStatisticsRoutes from "./routes/Admin/adminStatistics.js";
import { verifyToken, allowRoles } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("📚 Library API is running 🚀"));

app.use("/api/auth", authRoutes);

app.use("/api/admin", verifyToken, adminDashboardRoute);
app.use("/api/admin",verifyToken,adminBooksRoutes);
app.use("/api/admin",verifyToken,adminUsersRoutes);
app.use("/api/admin",verifyToken, adminStatisticsRoutes);

app.use("/api/dashboard", verifyToken, readerDashboardRoutes);


app.use((req, res) => {
  res.status(404).json({ message: "Not Found", path: req.originalUrl });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
