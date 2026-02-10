import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { Link } from "react-router-dom";
import api from "../../lib/axios";

function statusText(s) {
  if (s === 1) return "PENDING (Chờ duyệt)";
  if (s === 2) return "APPROVED (Đã duyệt)";
  if (s === 3) return "BORROWED (Đang mượn)";
  if (s === 4) return "CANCELLED";
  if (s === 5) return "COMPLETED";
  return "UNKNOWN";
}

export default function ReaderOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setError("");
      const res = await api.get("/reader/orders");
      setOrders(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Không tải được đơn.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContent">
          <div className="reader-shop" style={{ maxWidth: 1000, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Link to="/reader/books" className="page-btn" style={{ textDecoration: "none" }}>
                ← Shop sách
              </Link>
            </div>

            <h2 style={{ marginTop: 0 }}>Đơn mượn của tôi</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {orders.length === 0 ? (
              <p>Chưa có đơn.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {orders.map((o) => (
                  <div key={o.id} style={{ background: "white", borderRadius: 18, padding: 14, border: "1px solid rgba(229,231,235,1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <b>Order #{o.id}</b>
                      <b>{statusText(o.status)}</b>
                    </div>
                    <div style={{ color: "rgb(100,116,139)", marginTop: 6 }}>
                      {new Date(o.createdAt).toLocaleString("vi-VN")} • {o.loanDays} ngày • Pay: {o.paymentStatus === 2 ? "PAID" : "UNPAID"}
                    </div>

                    <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {o.items.map((it) => (
                        <div key={it.id} style={{ display: "flex", gap: 10, alignItems: "center", border: "1px solid rgba(229,231,235,1)", borderRadius: 14, padding: 10 }}>
                          <img
                            src={it.book.coverUrl || "/book-placeholder.png"}
                            alt={it.book.title}
                            style={{ width: 40, height: 56, objectFit: "cover", borderRadius: 8 }}
                            onError={(e) => { e.currentTarget.src = "/book-placeholder.png"; }}
                          />
                          <div style={{ flex: 1 }}>
                            <b>{it.book.title}</b>
                            <div style={{ color: "rgb(100,116,139)" }}>{it.book.author}</div>
                          </div>
                          <b>x{it.quantity}</b>
                        </div>
                      ))}
                    </div>

                    {o.note && <p style={{ marginTop: 10, color: "rgb(51,65,85)" }}><b>Note:</b> {o.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
