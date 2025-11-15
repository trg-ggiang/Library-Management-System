export function requireAccountant(req, res, next) {
  if (!req.user || String(req.user.role).toUpperCase() !== "ACCOUNTANT") {
    return res.status(403).json({ error: "Chi danh cho ke toan" });
  }
  next();
}