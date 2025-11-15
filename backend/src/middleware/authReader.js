export function requireLibrarian(req, res, next) {
  if (!req.user || String(req.user.role).toUpperCase() !== "READER") {
    return res.status(403).json({ error: "Chi danh cho reader" });
  }
  next();
}