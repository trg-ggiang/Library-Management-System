import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Dashboard from "./pages/ADMIN/Dashboard.jsx";
import AdminBrowseBooks from "./pages/ADMIN/AdminBrowseBooks.jsx";
import AdminUsers from "./pages/ADMIN/AdminUsers.jsx";
import AdminStatistics from "./pages/ADMIN/AdminStatistics.jsx";

import LibrarianBorrow from "./pages/LIBRARIAN/LibrarianBorrowing.jsx";
import LibrarianDashboard from "./pages/LIBRARIAN/LibrarianDashboard.jsx";
import LibrarianOrders from "./pages/LIBRARIAN/LibrarianOrders.jsx";
import LibrarianReaders from "./pages/LIBRARIAN/LibrarianReaders.jsx";
import LibrarianBooks from "./pages/LIBRARIAN/LibrarianBooks.jsx";

import ReaderDashboard from "./pages/READER/ReaderDashboard.jsx";
import ReaderBooks from "./pages/READER/ReaderBooks.jsx";
import ReaderBookDetail from "./pages/READER/ReaderBookDetail.jsx";
import ReaderCart from "./pages/READER/ReaderCart.jsx";
import ReaderCheckout from "./pages/READER/ReaderCheckout.jsx";
import ReaderOrders from "./pages/READER/ReaderOrders.jsx";
import ReaderBorrows from "./pages/READER/ReaderBorrows.jsx";
import ReaderFines from "./pages/READER/ReaderFines.jsx";
import ReaderProfile from "./pages/READER/ReaderProfile.jsx";

import AccountantDashboard from "./pages/ACCOUNTANT/AccountantDashboard.jsx";
import AccountantPayments from "./pages/ACCOUNTANT/AccountantPayments.jsx";
import AccountantFines from "./pages/ACCOUNTANT/AccountantFines.jsx";

import useAuthStore from "./store/useAuthStore.js";

function ProtectedRoute({ children, allowRoles }) {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  if (allowRoles && allowRoles.length > 0) {
    const role = String(user.role || "").toUpperCase();
    const allowed = allowRoles.map((r) => String(r).toUpperCase()).includes(role);
    if (!allowed) {
      const fallback =
        role === "ADMIN" ? "/admin/dashboard" :
        role === "LIBRARIAN" ? "/librarian/dashboard" :
        role === "ACCOUNTANT" ? "/accountant/dashboard" :
        "/reader/dashboard";
      return <Navigate to={fallback} replace />;
    }
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowRoles={["ADMIN"]}><Dashboard /></ProtectedRoute>
        } />
        <Route path="/admin/books" element={
          <ProtectedRoute allowRoles={["ADMIN"]}><AdminBrowseBooks /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowRoles={["ADMIN"]}><AdminUsers /></ProtectedRoute>
        } />
        <Route path="/admin/statistics" element={
          <ProtectedRoute allowRoles={["ADMIN"]}><AdminStatistics /></ProtectedRoute>
        } />

        {/* LIBRARIAN */}
        <Route path="/librarian/dashboard" element={
          <ProtectedRoute allowRoles={["LIBRARIAN", "ADMIN"]}><LibrarianDashboard /></ProtectedRoute>
        } />
        <Route path="/librarian/borrow-return" element={
          <ProtectedRoute allowRoles={["LIBRARIAN", "ADMIN"]}><LibrarianBorrow /></ProtectedRoute>
        } />
        <Route path="/librarian/orders" element={
          <ProtectedRoute allowRoles={["LIBRARIAN", "ADMIN"]}><LibrarianOrders /></ProtectedRoute>
        } />
        <Route path="/librarian/readers" element={
          <ProtectedRoute allowRoles={["LIBRARIAN", "ADMIN"]}><LibrarianReaders /></ProtectedRoute>
        } />
        <Route path="/librarian/books" element={
          <ProtectedRoute allowRoles={["LIBRARIAN", "ADMIN"]}><LibrarianBooks /></ProtectedRoute>
        } />

        {/* ACCOUNTANT */}
        <Route path="/accountant/dashboard" element={
          <ProtectedRoute allowRoles={["ACCOUNTANT", "ADMIN"]}><AccountantDashboard /></ProtectedRoute>
        } />
        <Route path="/accountant/payments" element={
          <ProtectedRoute allowRoles={["ACCOUNTANT", "ADMIN"]}><AccountantPayments /></ProtectedRoute>
        } />
        <Route path="/accountant/fines" element={
          <ProtectedRoute allowRoles={["ACCOUNTANT", "ADMIN"]}><AccountantFines /></ProtectedRoute>
        } />

        {/* READER */}
        <Route path="/reader/dashboard" element={
          <ProtectedRoute allowRoles={["READER", "ADMIN"]}><ReaderDashboard /></ProtectedRoute>
        } />
        <Route path="/reader/books" element={
          <ProtectedRoute allowRoles={["READER", "ADMIN"]}><ReaderBooks /></ProtectedRoute>
        } />
        <Route path="/reader/books/:id" element={
          <ProtectedRoute allowRoles={["READER", "ADMIN"]}><ReaderBookDetail /></ProtectedRoute>
        } />
        <Route path="/reader/cart" element={
          <ProtectedRoute allowRoles={["READER", "ADMIN"]}><ReaderCart /></ProtectedRoute>
        } />
        <Route path="/reader/checkout" element={
          <ProtectedRoute allowRoles={["READER", "ADMIN"]}><ReaderCheckout /></ProtectedRoute>
        } />
        <Route path="/reader/orders" element={
          <ProtectedRoute allowRoles={["READER", "ADMIN"]}><ReaderOrders /></ProtectedRoute>
        } />
        <Route path="/reader/borrows" element={
          <ProtectedRoute allowRoles={["READER", "ADMIN"]}><ReaderBorrows /></ProtectedRoute>
        } />
        <Route path="/reader/fines" element={
          <ProtectedRoute allowRoles={["READER", "ADMIN"]}><ReaderFines /></ProtectedRoute>
        } />
        <Route path="/reader/profile" element={
          <ProtectedRoute allowRoles={["READER", "ADMIN"]}><ReaderProfile /></ProtectedRoute>
        } />

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
