import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";

import useAuthStore from "../store/useAuthStore";
import useUIStore from "../store/useUIStore"; // tạo ở bước 2

export default function Header() {
  // ✅ hooks luôn ở trên cùng
  const nav = useNavigate();
  const { user, logout } = useAuthStore();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const [openUser, setOpenUser] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpenUser(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const doLogout = () => {
    logout(); // zustand persist sẽ tự clear auth-storage
    setOpenUser(false);
    nav("/login");
  };

  return (
    <header className="header">
      <button className="main-btn" onClick={toggleSidebar} type="button" aria-label="Toggle sidebar">
        <FaBars />
      </button>

      <div className="user">
        <button className="bell" type="button" aria-label="Notifications">
          <FaBell />
        </button>

        <div className="userMenu" ref={wrapRef}>
          <button
            className="user-account"
            type="button"
            aria-label="Account"
            aria-expanded={openUser}
            onClick={() => setOpenUser((v) => !v)}
          >
            <FaUser />
          </button>

          {openUser && (
            <div className="userDropdown">
              <div className="userDropdownHeader">
                <div style={{ fontWeight: 800 }}>{user?.name || "Account"}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{user?.role || ""}</div>
              </div>

              <button className="userDropdownItem danger" onClick={doLogout} type="button">
                <FaSignOutAlt style={{ marginRight: 8 }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
