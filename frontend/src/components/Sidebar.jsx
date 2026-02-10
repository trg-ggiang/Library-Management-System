import { Link, useLocation } from "react-router-dom";
import {
  FaHome, FaUsers, FaBook, FaMoneyBillWave, FaCalendarAlt,
  FaClipboardList, FaChartBar, FaUserCog
} from "react-icons/fa";
import useAuthStore from "../store/useAuthStore";
import useUIStore from "../store/useUIStore";

export default function SideBar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const role = user?.role || "READER";
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  const adminMenu = [
    { icon: FaHome,  label: "Dashboard",       path: "/admin/dashboard" },
    { icon: FaUsers, label: "User Management", path: "/admin/users" },
    { icon: FaBook,  label: "Book Management", path: "/admin/books" },
    { icon: FaChartBar, label: "Statistics",   path: "/admin/statistics" },
  ];

  const librarianMenu = [
    { icon: FaHome,        label: "Dashboard",       path: "/librarian/dashboard" },
    { icon: FaBook,        label: "Book Catalog",    path: "/librarian/books" },
    { icon: FaCalendarAlt, label: "Borrow & Return", path: "/librarian/borrow-return" },
    { icon: FaClipboardList, label: "Orders",        path: "/librarian/orders" },
    { icon: FaUsers,       label: "Readers",         path: "/librarian/readers" },
  ];

  const accountantMenu = [
    { icon: FaHome,          label: "Dashboard",    path: "/accountant/dashboard" },
    { icon: FaMoneyBillWave, label: "Fines",        path: "/accountant/fines" },
    { icon: FaClipboardList, label: "Payments",     path: "/accountant/payments" },
  ];

  const readerMenu = [
    { icon: FaHome,        label: "Dashboard",      path: "/reader/dashboard" },
    { icon: FaBook,        label: "Browse Books",   path: "/reader/books" },
    { icon: FaClipboardList, label: "My Orders",    path: "/reader/orders" },
    { icon: FaCalendarAlt, label: "Borrow History", path: "/reader/borrows" },
    { icon: FaMoneyBillWave, label: "My Fines",     path: "/reader/fines" },
    { icon: FaUserCog,     label: "Profile",        path: "/reader/profile" },
  ];

  const menuItems =
    role === "ADMIN" ? adminMenu :
    role === "LIBRARIAN" ? librarianMenu :
    role === "ACCOUNTANT" ? accountantMenu :
    readerMenu;

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <ul>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <li key={index}>
              <Link to={item.path} className={isActive ? "active" : ""} title={collapsed ? item.label : ""}>
                <div className="menu-item">
                  <span className="icon"><Icon size={20} /></span>
                  {!collapsed && <span className="label">{item.label}</span>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
