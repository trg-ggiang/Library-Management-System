export function requireLibrarian(req, res, next) {
  if (!req.user || String(req.user.role).toUpperCase() !== "LIBRARIAN") {
    return res.status(403).json({ error: "Chi danh cho thu thu" });
  }
  next();
}