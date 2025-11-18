import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBook,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClipboardList,
  FaChartBar,
  FaUserCog
} from "react-icons/fa";
import authStore from "../store/useAuthStore";

export default function SideBar() {
  const location = useLocation();
  const { user } = authStore();

  const role = user?.role || "ADMIN";

  const adminMenu = [
    { icon: FaHome,  label: "Dashboard",       path: "/admin/dashboard" },
    { icon: FaUsers, label: "User Management", path: "/admin/users" },    
    { icon: FaBook,  label: "Book Management", path: "/admin/books" },
    { icon: FaChartBar, label: "Statistics",   path: "/admin/statistics" },
  ];

  const librarianMenu = [
    { icon: FaHome,        label: "Dashboard",       path: "/lib/dashboard" },
    { icon: FaBook,        label: "Book Catalog",    path: "/lib/books" },
    { icon: FaCalendarAlt, label: "Borrow & Return", path: "/lib/borrow-return" },
    { icon: FaClipboardList, label: "Reservations",  path: "/lib/reservations" },
    { icon: FaUsers,       label: "Readers",         path: "/lib/readers" },  // ReaderProfile, history,...
  ];

  // ===== ACCOUNTANT =====
  const accountantMenu = [
    { icon: FaHome,          label: "Dashboard",        path: "/acc/dashboard" },
    { icon: FaMoneyBillWave, label: "Fines & Fees",     path: "/acc/fines" },
    { icon: FaClipboardList, label: "Payments",         path: "/acc/payments" },
    { icon: FaChartBar,      label: "Financial Reports", path: "/acc/reports" },
  ];

  // ===== READER (user) =====
  const readerMenu = [
    { icon: FaHome,        label: "Home",             path: "/reader" },
    { icon: FaBook,        label: "Browse Books",     path: "/reader/books" },
    { icon: FaClipboardList, label: "My Reservations", path: "/reader/reservations" },
    { icon: FaCalendarAlt, label: "Borrow History",   path: "/reader/borrows" },
    { icon: FaMoneyBillWave, label: "My Fines",       path: "/reader/fines" },
    { icon: FaUserCog,     label: "Profile",          path: "/reader/profile" },
  ];

  const menuItems =
    role === "ADMIN"
      ? adminMenu
      : role === "LIBRARIAN"
      ? librarianMenu
      : role === "ACCOUNTANT"
      ? accountantMenu
      : readerMenu; // READER

  return (
    <aside className="sidebar">
      <ul>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <li key={index}>
              <Link to={item.path} className={isActive ? "active" : ""}>
                <div className="menu-item">
                  <span className="icon">
                    <Icon size={20} />
                  </span>
                  <span className="label">{item.label}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
