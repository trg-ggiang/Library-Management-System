import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/ADMIN/Dashboard.jsx";

import useAuthStore from "./store/authStore"; // ⬅ thêm dòng này

function ProtectedRoute({ children, allowRoles }) {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  if (allowRoles && allowRoles.length > 0) {
    const role = user.role?.toLowerCase();
    const allowed = allowRoles.map((r) => r.toLowerCase()).includes(role);
    if (!allowed) {
      const fallback =
        role === "admin"
          ? "/admin"
          : role === "librarian"
          ? "/lib/borrow-return"
          : role === "accountant"
          ? "/acc/fees"
          : role === "reader"
          ? "/reader"
          : "/";
      return <Navigate to={fallback} replace />;
    }
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
