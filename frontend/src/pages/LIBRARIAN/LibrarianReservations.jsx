import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

function statusText(s) {
  if (s === 1) return "PENDING";
  if (s === 2) return "APPROVED";
  if (s === 3) return "BORROWED";
  if (s === 4) return "CANCELLED";
  if (s === 5) return "COMPLETED";
  return "UNKNOWN";
}

export default function LibrarianReservations() {
  const [status, setStatus] = useState(1);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const fetch = async () => {
    try {
      setError("");
      const res = await api.get("/librarian/orders", { params: { status } });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Không tải được danh sách đơn.");
    }
  };

  useEffect(() => { fetch(); }, [status]);

  const act = async (fn) => {
    try {
      setError("");
      await fn();
      fetch();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Thao tác thất bại.");
    }
  };

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContent">
          <h2 style={{ marginTop: 0 }}>Reservations (Borrow Orders)</h2>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <b>Status:</b>
            <select value={status} onChange={(e) => setStatus(Number(e.target.value))}>
              <option value={1}>PENDING</option>
              <option value={2}>APPROVED</option>
              <option value={3}>BORROWED</option>
              <option value={4}>CANCELLED</option>
              <option value={5}>COMPLETED</option>
            </select>
            <button className="page-btn" onClick={fetch}>Refresh</button>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {rows.length === 0 ? (
            <p>Không có đơn.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rows.map((o) => (
                <div key={o.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <b>Order #{o.id}</b>
                    <b>{statusText(o.status)}</b>
                  </div>

                  <div style={{ color: "#64748b", marginTop: 6 }}>
                    Reader: {o.reader?.user?.name} • {o.reader?.user?.email} • {o.loanDays} ngày
                  </div>

                  <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {(o.items || []).map((it) => (
                      <div key={it.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, display: "flex", gap: 10 }}>
                        <img
                          src={it.book?.coverUrl || "/book-placeholder.png"}
                          alt=""
                          style={{ width: 44, height: 62, objectFit: "cover", borderRadius: 8 }}
                          onError={(e) => (e.currentTarget.src = "/book-placeholder.png")}
                        />
                        <div style={{ flex: 1 }}>
                          <b>{it.book?.title}</b>
                          <div style={{ color: "#64748b" }}>{it.book?.author}</div>
                          <div><b>x{it.quantity}</b></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    {o.status === 1 && (
                      <button className="page-btn active" onClick={() => act(() => api.post(`/librarian/orders/${o.id}/approve`))}>
                        Approve
                      </button>
                    )}
                    {o.status === 2 && (
                      <button className="page-btn active" onClick={() => act(() => api.post(`/librarian/orders/${o.id}/issue`))}>
                        Issue (gán copy + tạo borrowing)
                      </button>
                    )}
                    {(o.status === 1 || o.status === 2) && (
                      <button className="page-btn" onClick={() => act(() => api.post(`/librarian/orders/${o.id}/cancel`))}>
                        Cancel
                      </button>
                    )}
                  </div>

                  {o.note && <p style={{ marginTop: 10 }}><b>Note:</b> {o.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
