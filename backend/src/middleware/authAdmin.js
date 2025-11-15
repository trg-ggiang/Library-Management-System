export function requireAdmin(req, res, next) {
  if (!req.user || String(req.user.role).toUpperCase() !== "ADMIN") {
    return res.status(403).json({ error: "Chi danh cho admin" });
  }
  next();
}