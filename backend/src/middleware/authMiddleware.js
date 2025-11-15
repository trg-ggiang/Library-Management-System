import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Chua gui token" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Thieu token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (err) {
    console.error("Loi xac thuc JWT:", err.message);
    return res.status(401).json({ message: "Token khong hop le hoac het han" });
  }
}

export function allowRoles(roles = []) {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ message: "Chua dang nhap" });
    }

    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    next();
  };
}
