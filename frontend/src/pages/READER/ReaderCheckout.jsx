import { useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import useCartStore from "../../store/useCartStore";

export default function ReaderCheckout() {
  const nav = useNavigate();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const [loanDays, setLoanDays] = useState(14);
  const [note, setNote] = useState("");
  const [payNow, setPayNow] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (items.length === 0) return setError("Giỏ trống.");

    try {
      setLoading(true);
      const orderRes = await api.post("/reader/orders", {
        loanDays,
        note,
        items: items.map((x) => ({ bookId: x.bookId, quantity: x.quantity })),
      });

      const orderId = orderRes.data.id;

      if (payNow) {
        await api.post(`/reader/orders/${orderId}/pay`, { method: "MOCK" });
      }

      clear();
      nav(`/reader/orders`);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Tạo đơn thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContent">
          <div className="reader-shop" style={{ maxWidth: 900, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Link to="/reader/cart" className="page-btn" style={{ textDecoration: "none" }}>
                ← Quay lại giỏ
              </Link>
              <Link to="/reader/orders" className="page-btn" style={{ textDecoration: "none" }}>
                Đơn của tôi
              </Link>
            </div>

            <h2 style={{ marginTop: 0 }}>Checkout (mượn sách)</h2>

            {error && <p style={{ color: "red", fontWeight: 700 }}>{error}</p>}

            <div style={{ background: "white", borderRadius: 18, padding: 14, border: "1px solid rgba(229,231,235,1)" }}>
              <p style={{ marginTop: 0, fontWeight: 800 }}>Tóm tắt</p>
              {items.map((it) => (
                <div key={it.bookId} style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(229,231,235,1)", paddingTop: 10, marginTop: 10 }}>
                  <div>
                    <b>{it.title}</b>
                    <div style={{ color: "rgb(100,116,139)" }}>{it.author}</div>
                  </div>
                  <b>x{it.quantity}</b>
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                <div>
                  <label style={{ fontWeight: 800 }}>Số ngày mượn</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={loanDays}
                    onChange={(e) => setLoanDays(e.target.value)}
                    style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 14, border: "1px solid rgba(148,163,184,0.85)" }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 800 }}>Thanh toán</label>
                  <select
                    value={payNow ? "now" : "later"}
                    onChange={(e) => setPayNow(e.target.value === "now")}
                    style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 14, border: "1px solid rgba(148,163,184,0.85)" }}
                  >
                    <option value="now">Online (mock) - trả ngay</option>
                    <option value="later">Trả tại quầy</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label style={{ fontWeight: 800 }}>Ghi chú</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: mình muốn lấy sách chiều nay..."
                  style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 14, border: "1px solid rgba(148,163,184,0.85)", minHeight: 90 }}
                />
              </div>

              <button
                className="page-btn active"
                onClick={submit}
                disabled={loading}
                style={{ marginTop: 12 }}
              >
                {loading ? "Đang tạo đơn..." : "Tạo đơn mượn"}
              </button>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}
